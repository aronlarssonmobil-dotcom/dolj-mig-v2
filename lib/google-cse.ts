export const dynamic = 'force-dynamic'
import type { SupportedSite } from '@/types'
import { SUPPORTED_SITES } from '@/types'
import { scrapeProfile, ExposedField } from './profile-scraper'
import { scanAllSitesBrave, buildCombinedQuery as buildBraveCombinedQuery } from './brave-search'

export interface SiteMatch {
  site: SupportedSite
  found: boolean
  profile_url: string | null
  title: string | null
  snippet: string | null
  exposed_fields?: ExposedField[]
}

const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

const HEADERS: Record<string, string> = {
  'User-Agent': MOBILE_UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'sv-SE,sv;q=0.9',
}

function getAge(pnr: string): number {
  const digits = pnr.replace(/\D/g, '')
  const yy = digits.length === 12 ? digits.slice(2, 4) : digits.slice(0, 2)
  const year = parseInt(yy) + (parseInt(yy) > 25 ? 1900 : 2000)
  return new Date().getFullYear() - year
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function extractFirstLink(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern)
  return match ? match[1] : null
}

async function findRatsit(fullName: string, pnr: string | null): Promise<{ found: boolean; url: string | null }> {
  const age = pnr ? getAge(pnr) : null
  const ageParam = age ? `&amin=${age}&amax=${age}` : ''
  const encodedName = encodeURIComponent(fullName)
  const searchUrl = `https://www.ratsit.se/sok/person?vem=${encodedName}${ageParam}&fon=1&page=1`

  const html = await fetchPage(searchUrl)
  if (!html) return { found: false, url: searchUrl }

  // Find profile links - format: /YYMMDD???-Name,_Surname
  const profileLinks = html.match(/href="(\/\d{6}[A-Z0-9]+-[^"]+)"/g) || []
  const firstLink = profileLinks[0]
  if (firstLink) {
    const href = firstLink.replace(/href="|"/g, '')
    return { found: true, url: `https://www.ratsit.se${href}` }
  }

  return { found: false, url: searchUrl }
}

async function findMrkoll(fullName: string, pnr: string | null): Promise<{ found: boolean; url: string | null }> {
  const nameParts = fullName.trim().split(/\s+/)
  const first = nameParts[0] || ''
  const last = nameParts[nameParts.length - 1] || ''
  const pnrShort = pnr ? pnr.replace(/\D/g, '').slice(-10).slice(0, 6) : ''

  // Try direct URL first
  if (pnrShort) {
    const slug = (s: string) =>
      s.toLowerCase()
        .replace(/å/g, 'a')
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/[^a-z0-9]+/g, '-')
    const directUrl = `https://mrkoll.se/person/${slug(first)}-${slug(last)}-${pnrShort}/`
    const html = await fetchPage(directUrl)
    if (html && !html.includes('blocked') && !html.includes('Sorry') && html.length > 5000) {
      return { found: true, url: directUrl }
    }
  }

  const searchUrl = `https://mrkoll.se/person/?namn=${encodeURIComponent(fullName)}`
  return { found: false, url: searchUrl }
}

async function findMerinfo(fullName: string, pnr: string | null): Promise<{ found: boolean; url: string | null }> {
  const searchUrl = `https://www.merinfo.se/search?who=${encodeURIComponent(fullName)}&where=`
  const html = await fetchPage(searchUrl)
  if (!html) return { found: false, url: searchUrl }

  const profileLink = extractFirstLink(html, /href="(\/person\/[^"]+)"/)
  if (profileLink) {
    return { found: true, url: `https://www.merinfo.se${profileLink}` }
  }
  return { found: false, url: searchUrl }
}

async function findHitta(fullName: string): Promise<{ found: boolean; url: string | null }> {
  const searchUrl = `https://www.hitta.se/s%C3%B6k?vad=${encodeURIComponent(fullName)}&typ=PP`
  const html = await fetchPage(searchUrl)
  if (!html) return { found: false, url: searchUrl }

  const profileLink = extractFirstLink(html, /href="(\/[^"]+\/person\/[^"]+)"/)
  if (profileLink) {
    return { found: true, url: `https://www.hitta.se${profileLink}` }
  }

  // Check if results exist
  if (html.includes(fullName.split(' ')[0])) {
    return { found: true, url: searchUrl }
  }
  return { found: false, url: searchUrl }
}

async function findEniro(fullName: string): Promise<{ found: boolean; url: string | null }> {
  const searchUrl = `https://www.eniro.se/s/${encodeURIComponent(fullName)}/person`
  const html = await fetchPage(searchUrl)
  if (!html) return { found: false, url: searchUrl }

  if (html.toLowerCase().includes(fullName.toLowerCase().split(' ')[0])) {
    return { found: true, url: searchUrl }
  }
  return { found: false, url: searchUrl }
}

async function findBirthday(fullName: string): Promise<{ found: boolean; url: string | null }> {
  const searchUrl = `https://birthday.se/sok/?q=${encodeURIComponent(fullName)}`
  const html = await fetchPage(searchUrl)
  if (!html) return { found: false, url: searchUrl }
  if (html.toLowerCase().includes(fullName.toLowerCase().split(' ')[0])) {
    return { found: true, url: searchUrl }
  }
  return { found: false, url: searchUrl }
}

async function findUpplysning(fullName: string): Promise<{ found: boolean; url: string | null }> {
  const searchUrl = `https://www.upplysning.se/Person/Sok/?q=${encodeURIComponent(fullName)}`
  const html = await fetchPage(searchUrl)
  if (!html) return { found: false, url: searchUrl }
  if (html.toLowerCase().includes(fullName.toLowerCase().split(' ')[0])) {
    return { found: true, url: searchUrl }
  }
  return { found: false, url: searchUrl }
}

/**
 * scanAllSites — primary entry point for scanning.
 *
 * Strategy:
 * 1. PRODUCTION (Vercel): use Brave Search API (env BRAVE_API_KEY required)
 * 2. LOCAL DEV fallback: direct HTTP scraping (USE_PLAYWRIGHT or no BRAVE_API_KEY)
 *    — original approach, blocked by Cloudflare in prod but works fine locally
 */
export async function scanAllSites(
  fullName: string,
  pnr?: string | null,
  address?: string | null,
): Promise<SiteMatch[]> {
  const useBrave =
    !!process.env.BRAVE_API_KEY &&
    process.env.USE_PLAYWRIGHT !== 'true'

  if (useBrave) {
    console.log('[scan] Using Brave Search API')
    return scanAllSitesBrave(fullName, pnr)
  }

  // Local-only fallback: direct HTTP fetching (works when not behind Cloudflare)
  console.log('[scan] Using direct HTTP fallback (local dev only)')

  const [ratsit, mrkoll, merinfo, hitta, eniro, birthday, upplysning] = await Promise.all([
    findRatsit(fullName, pnr ?? null),
    findMrkoll(fullName, pnr ?? null),
    findMerinfo(fullName, pnr ?? null),
    findHitta(fullName),
    findEniro(fullName),
    findBirthday(fullName),
    findUpplysning(fullName),
  ])

  const checks: Record<SupportedSite, { found: boolean; url: string | null }> = {
    'ratsit.se': ratsit,
    'mrkoll.se': mrkoll,
    'merinfo.se': merinfo,
    'hitta.se': hitta,
    'eniro.se': eniro,
    'birthday.se': birthday,
    'upplysning.se': upplysning,
  }

  const results: SiteMatch[] = await Promise.all(
    SUPPORTED_SITES.map(async (site: SupportedSite) => {
      const check = checks[site]
      if (!check.found || !check.url) {
        return { site, found: false, profile_url: check.url, title: null, snippet: null }
      }
      const scraped = await scrapeProfile(check.url, site)
      return {
        site,
        found: true,
        profile_url: check.url,
        title: `${fullName} på ${site}`,
        snippet: scraped.fields.map((f: ExposedField) => `${f.label}: ${f.value}`).join(' · ') || null,
        exposed_fields: scraped.fields,
      }
    })
  )
  return results
}

export function buildCombinedQuery(fullName: string, pnr?: string | null): string {
  return buildBraveCombinedQuery(fullName, pnr)
}

export async function scanSite(fullName: string, site: SupportedSite, pnr?: string | null): Promise<SiteMatch> {
  const results = await scanAllSites(fullName, pnr)
  return results.find(r => r.site === site) || { site, found: false, profile_url: null, title: null, snippet: null }
}
