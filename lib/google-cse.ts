import { SupportedSite, SUPPORTED_SITES } from '@/types'
import { scrapeProfile, ExposedField } from './profile-scraper'
import { buildDirectUrls, checkUrl } from './direct-urls'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID!

export interface CSEItem {
  title: string
  link: string
  snippet: string
  displayLink: string
  pagemap?: Record<string, unknown>
}

export interface CSEResponse {
  items?: CSEItem[]
  searchInformation?: {
    totalResults: string
    searchTime: number
  }
  error?: {
    code: number
    message: string
    status: string
  }
}

export interface SiteMatch {
  site: SupportedSite
  found: boolean
  profile_url: string | null
  title: string | null
  snippet: string | null
  exposed_fields?: ExposedField[]
}

/**
 * Build a site-restricted Google query for a person
 */
export function buildSearchQuery(
  fullName: string,
  site: SupportedSite,
  pnr?: string | null
): string {
  const namePart = `"${fullName}"`
  const sitePart = `site:${site}`
  if (pnr) {
    const shortPnr = pnr.replace('-', '').slice(0, 6)
    return `${namePart} ${sitePart} ${shortPnr}`
  }
  return `${namePart} ${sitePart}`
}

/**
 * Execute a Google CSE query
 */
export async function executeSearch(query: string): Promise<CSEResponse> {
  // Return empty results if CSE is not configured
  if (!GOOGLE_CSE_ID || !GOOGLE_API_KEY) {
    console.warn('Google CSE not configured (GOOGLE_CSE_ID or GOOGLE_API_KEY missing). Returning empty results.')
    return {}
  }

  const url = new URL('https://www.googleapis.com/customsearch/v1')
  url.searchParams.set('key', GOOGLE_API_KEY)
  url.searchParams.set('cx', GOOGLE_CSE_ID)
  url.searchParams.set('q', query)
  url.searchParams.set('num', '5')
  url.searchParams.set('hl', 'sv')
  url.searchParams.set('gl', 'se')

  const res = await fetch(url.toString(), {
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google CSE HTTP ${res.status}: ${text}`)
  }

  return res.json() as Promise<CSEResponse>
}

/**
 * Normalize a string for URL comparison (removes Swedish chars, spaces, etc.)
 */
function normalizeForUrl(str: string): string {
  return str
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/é/g, 'e')
    .replace(/ü/g, 'u')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'a')
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Determine if a CSE result is a real profile match vs generic page
 */
function isProfileMatch(item: CSEItem, fullName: string, site: SupportedSite): boolean {
  const nameLower = fullName.toLowerCase()
  const nameNormalized = normalizeForUrl(fullName)
  const titleLower = item.title.toLowerCase()
  const snippetLower = item.snippet.toLowerCase()
  const linkLower = item.link.toLowerCase()

  // Name must appear somewhere in title, snippet, or URL
  // Also check normalized versions to handle Swedish chars in URLs (björn → bjorn)
  const nameParts = nameLower.split(' ')
  const namePartsNormalized = nameNormalized.split('').length > 0
    ? fullName.toLowerCase().split(' ').map(p => normalizeForUrl(p))
    : []

  const nameInContent = nameParts.every(
    (part) =>
      titleLower.includes(part) ||
      snippetLower.includes(part) ||
      linkLower.includes(part) ||
      titleLower.includes(normalizeForUrl(part)) ||
      snippetLower.includes(normalizeForUrl(part)) ||
      linkLower.includes(normalizeForUrl(part))
  )

  if (!nameInContent) return false

  // Site-specific URL patterns that indicate a real person profile
  const profilePatterns: Record<SupportedSite, RegExp[]> = {
    'ratsit.se': [/ratsit\.se\/.+\/\d+/i, /ratsit\.se\/vem\//i],
    'mrkoll.se': [/mrkoll\.se\/person/i, /mrkoll\.se\/[a-z]+\//i],
    'merinfo.se': [/merinfo\.se\/[a-z]/i],
    'hitta.se': [/hitta\.se\/person/i, /hitta\.se\/[a-z]/i],
    'eniro.se': [/eniro\.se\/[a-z]/i, /eniro\.se\/p\//i],
    'birthday.se': [/birthday\.se\/[a-z]/i],
    'upplysning.se': [/upplysning\.se\/[a-z]/i],
  }

  const patterns = profilePatterns[site]
  return patterns.some((pattern) => pattern.test(item.link))
}

/**
 * Scan a single site for a person
 */
export async function scanSite(
  fullName: string,
  site: SupportedSite,
  pnr?: string | null
): Promise<SiteMatch> {
  // First try direct URL if we have personnummer
  if (pnr) {
    const directUrls = buildDirectUrls(fullName, pnr)
    const direct = directUrls.find(d => d.site === site)

    if (direct?.profileUrl) {
      const exists = await checkUrl(direct.profileUrl)
      if (exists) {
        const scraped = await scrapeProfile(direct.profileUrl, site)
        return {
          site,
          found: true,
          profile_url: direct.profileUrl,
          title: `${fullName} på ${site}`,
          snippet: scraped.fields.map(f => `${f.label}: ${f.value}`).join(' · ') || null,
          exposed_fields: scraped.fields,
        }
      }
    }
  }

  // Fallback: Google CSE
  const query = buildSearchQuery(fullName, site, pnr)

  try {
    const response = await executeSearch(query)

    if (response.error) {
      console.error(`CSE error for ${site}:`, response.error)
      return { site, found: false, profile_url: null, title: null, snippet: null }
    }

    if (!response.items || response.items.length === 0) {
      return { site, found: false, profile_url: null, title: null, snippet: null }
    }

    const match = response.items.find((item) => isProfileMatch(item, fullName, site))

    if (match) {
      const scraped = await scrapeProfile(match.link, site)
      return {
        site,
        found: true,
        profile_url: match.link,
        title: match.title,
        snippet: match.snippet,
        exposed_fields: scraped.fields,
      }
    }

    return { site, found: false, profile_url: null, title: null, snippet: null }
  } catch (error) {
    console.error(`Error scanning ${site}:`, error)
    return { site, found: false, profile_url: null, title: null, snippet: null }
  }
}

/**
 * Scan all sites for a person — runs sequentially to respect CSE rate limits
 */
export async function scanAllSites(
  fullName: string,
  pnr?: string | null,
  address?: string | null
): Promise<SiteMatch[]> {
  const results: SiteMatch[] = []

  for (const site of SUPPORTED_SITES) {
    const result = await scanSite(fullName, site, pnr)
    results.push(result)
    // Small delay to avoid quota burst
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  return results
}

/**
 * Build a combined query string for display / logging
 */
export function buildCombinedQuery(
  fullName: string,
  pnr?: string | null
): string {
  const sites = SUPPORTED_SITES.map((s) => `site:${s}`).join(' OR ')
  const namePart = `"${fullName}"`
  if (pnr) {
    const shortPnr = pnr.replace('-', '').slice(0, 6)
    return `${namePart} (${sites}) ${shortPnr}`
  }
  return `${namePart} (${sites})`
}
