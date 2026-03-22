/**
 * Brave Search API integration for profile scanning
 * Primary search method — works in production (Vercel) without Playwright/Cloudflare issues
 * API docs: https://api.search.brave.com/app/documentation/web-search
 *
 * Free tier: 2,000 queries/month
 * Paid: ~$0.50 per 1,000 queries
 */

import type { SupportedSite } from '@/types'
import { SUPPORTED_SITES } from '@/types'

export interface SiteMatch {
  site: SupportedSite
  found: boolean
  profile_url: string | null
  title: string | null
  snippet: string | null
  exposed_fields?: Array<{ label: string; value: string; sensitive: boolean }>
}

interface BraveWebResult {
  title: string
  url: string
  description?: string
  extra_snippets?: string[]
}

interface BraveSearchResponse {
  web?: {
    results?: BraveWebResult[]
  }
  error?: {
    message: string
    code?: number
  }
}

// Map each supported site to its domain for site: searches
const SITE_DOMAINS: Record<SupportedSite, string> = {
  'ratsit.se': 'ratsit.se',
  'mrkoll.se': 'mrkoll.se',
  'merinfo.se': 'merinfo.se',
  'hitta.se': 'hitta.se',
  'eniro.se': 'eniro.se',
  'birthday.se': 'birthday.se',
  'upplysning.se': 'upplysning.se',
}

// Known URL path patterns that indicate a real profile page (not a search/listing page)
const PROFILE_URL_PATTERNS: Record<SupportedSite, RegExp | null> = {
  'ratsit.se': /ratsit\.se\/\d{6}[A-Z0-9]+-/i,
  'mrkoll.se': /mrkoll\.se\/person\//i,
  'merinfo.se': /merinfo\.se\/person\//i,
  'hitta.se': /hitta\.se\/.+\/person\//i,
  'eniro.se': /eniro\.se\/.+\/person\//i,
  'birthday.se': /birthday\.se\/sok/i, // search page is the best we get
  'upplysning.se': /upplysning\.se\/Person\//i,
}

/**
 * Search Brave for a specific person on a specific site.
 * Returns the best matching result or null.
 */
async function braveSearchSite(
  apiKey: string,
  fullName: string,
  site: SupportedSite,
  pnr?: string | null,
): Promise<BraveWebResult | null> {
  const domain = SITE_DOMAINS[site]

  // Build a targeted query: exact name + optional birth year + site filter
  let query = `"${fullName}" site:${domain}`
  if (pnr) {
    // Extract birth year (YYYY) from personnummer for better matching
    const digits = pnr.replace(/\D/g, '')
    const yy = digits.length === 12 ? digits.slice(2, 4) : digits.slice(0, 2)
    const birthYear = parseInt(yy) + (parseInt(yy) > 25 ? 1900 : 2000)
    query = `"${fullName}" ${birthYear} site:${domain}`
  }

  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&search_lang=sv&country=se&safesearch=off`

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.error(`Brave API error for ${site}: ${res.status} ${res.statusText}`)
      return null
    }

    const data: BraveSearchResponse = await res.json()

    if (data.error) {
      console.error(`Brave API returned error for ${site}:`, data.error)
      return null
    }

    const results = data.web?.results || []
    if (results.length === 0) return null

    // Prefer results whose URL matches a known profile pattern
    const pattern = PROFILE_URL_PATTERNS[site]
    if (pattern) {
      const profileResult = results.find((r) => pattern.test(r.url))
      if (profileResult) return profileResult
    }

    // Fallback: first result from the site (already filtered by site: query)
    return results[0] || null
  } catch (err) {
    console.error(`Brave search failed for ${site}:`, err)
    return null
  }
}

/**
 * Infer exposed fields from a Brave snippet — lightweight, no extra HTTP requests
 */
function inferExposedFields(
  snippet: string | undefined,
  site: SupportedSite,
): Array<{ label: string; value: string; sensitive: boolean }> {
  const fields: Array<{ label: string; value: string; sensitive: boolean }> = []
  if (!snippet) return fields

  // Personnummer pattern
  const pnrMatch = snippet.match(/\b(\d{6}[-–]\d{4})\b/)
  if (pnrMatch) fields.push({ label: 'Personnummer', value: pnrMatch[1], sensitive: true })

  // Age
  const ageMatch = snippet.match(/\b(\d{2,3})\s*år\b/i)
  if (ageMatch) fields.push({ label: 'Ålder', value: `${ageMatch[1]} år`, sensitive: false })

  // Swedish address patterns: "Gatugatan 12, 123 45 Stad"
  const addressMatch = snippet.match(/([A-ZÅÄÖa-zåäö][a-zåäö]+(gatan|vägen|väg|gatan|allén|torget|plan|stigen)\s+\d+[A-Za-z]?)/i)
  if (addressMatch) fields.push({ label: 'Adress', value: addressMatch[0], sensitive: true })

  // Postal code
  const postalMatch = snippet.match(/\b(\d{3}\s*\d{2})\b/)
  if (postalMatch) fields.push({ label: 'Postnummer', value: postalMatch[1], sensitive: true })

  // Phone
  const phoneMatch = snippet.match(/(\+46|0)\d[\d\s-]{7,11}\d/)
  if (phoneMatch) fields.push({ label: 'Telefon', value: phoneMatch[0], sensitive: true })

  // Income (ratsit style)
  const incomeMatch = snippet.match(/inkomst[:\s]+(\d[\d\s]+(?:kr|000))/i)
  if (incomeMatch) fields.push({ label: 'Inkomst', value: incomeMatch[1], sensitive: true })

  return fields
}

/**
 * Scan all supported sites using Brave Search API.
 * This is the primary scan method — no Playwright, no Cloudflare issues.
 */
export async function scanAllSitesBrave(
  fullName: string,
  pnr?: string | null,
): Promise<SiteMatch[]> {
  const apiKey = process.env.BRAVE_API_KEY
  if (!apiKey) {
    throw new Error('BRAVE_API_KEY is not set. Cannot run Brave Search scan.')
  }

  // Run all site searches in parallel (Brave rate limit: 1 req/s on free tier, 20 req/s paid)
  // With 7 sites we may hit the free-tier rate limit — add slight stagger if needed
  const results = await Promise.all(
    SUPPORTED_SITES.map(async (site) => {
      const result = await braveSearchSite(apiKey, fullName, site, pnr)
      if (!result) {
        return {
          site,
          found: false,
          profile_url: null,
          title: null,
          snippet: null,
          exposed_fields: [],
        } satisfies SiteMatch
      }

      const snippet = result.description || result.extra_snippets?.[0] || null
      const exposedFields = inferExposedFields(snippet || undefined, site)

      return {
        site,
        found: true,
        profile_url: result.url,
        title: result.title,
        snippet,
        exposed_fields: exposedFields,
      } satisfies SiteMatch
    }),
  )

  return results
}

/**
 * Build a combined query string (kept for compatibility with scan record)
 */
export function buildCombinedQuery(fullName: string, pnr?: string | null): string {
  const pnrShort = pnr ? pnr.replace(/\D/g, '').slice(-10).slice(0, 6) : ''
  return pnrShort ? `"${fullName}" ${pnrShort}` : `"${fullName}"`
}
