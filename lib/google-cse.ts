export const dynamic = 'force-dynamic'
import type { SupportedSite } from '@/types'
import { SUPPORTED_SITES } from '@/types'
import { scrapeProfile, ExposedField } from './profile-scraper'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID!

export interface SiteMatch {
  site: SupportedSite
  found: boolean
  profile_url: string | null
  title: string | null
  snippet: string | null
  exposed_fields?: ExposedField[]
}

export interface CSEItem {
  title: string
  link: string
  snippet: string
  displayLink: string
}

function normalizeForUrl(str: string): string {
  return str
    .toLowerCase()
    .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o')
    .replace(/é/g, 'e').replace(/ü/g, 'u').replace(/ø/g, 'o').replace(/æ/g, 'a')
    .replace(/[^a-z0-9]/g, '')
}

function buildDirectUrl(site: SupportedSite, fullName: string, pnr: string | null): string | null {
  if (!pnr) return null
  const digits = pnr.replace(/\D/g, '')
  const pnr10 = digits.length === 12 ? digits.slice(2) : digits.slice(-10)
  const pnrShort = pnr10.slice(0, 6)
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0] || ''
  const last = parts[parts.length - 1] || ''
  function slug(s: string) {
    return normalizeForUrl(s) || s.toLowerCase()
  }
  switch (site) {
    case 'ratsit.se':
      return `https://www.ratsit.se/${pnr10.slice(0,6)}-${pnr10.slice(6)}/${first}-${last}`
    case 'mrkoll.se':
      return `https://mrkoll.se/person/${slug(first)}-${slug(last)}-${pnrShort}/`
    case 'merinfo.se':
      return `https://www.merinfo.se/search?who=${encodeURIComponent(fullName)}&where=`
    default:
      return null
  }
}

async function searchGoogle(query: string, start = 1): Promise<CSEItem[]> {
  if (!GOOGLE_CSE_ID || !GOOGLE_API_KEY) return []
  const url = new URL('https://www.googleapis.com/customsearch/v1')
  url.searchParams.set('key', GOOGLE_API_KEY)
  url.searchParams.set('cx', GOOGLE_CSE_ID)
  url.searchParams.set('q', query)
  url.searchParams.set('num', '10')
  url.searchParams.set('hl', 'sv')
  url.searchParams.set('gl', 'se')
  if (start > 1) url.searchParams.set('start', String(start))
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 0 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.items || []
  } catch {
    return []
  }
}

function matchItemToSite(item: CSEItem): SupportedSite | null {
  const link = item.link.toLowerCase()
  const display = (item.displayLink || '').toLowerCase()
  for (const site of SUPPORTED_SITES) {
    if (link.includes(site) || display.includes(site)) return site
  }
  return null
}

function isPersonProfile(item: CSEItem, fullName: string): boolean {
  const nameParts = fullName.toLowerCase().split(/\s+/)
  const text = `${item.title} ${item.snippet} ${item.link}`.toLowerCase()
  const textNorm = normalizeForUrl(text)
  return nameParts.some(part => text.includes(part) || textNorm.includes(normalizeForUrl(part)))
}

export async function scanAllSites(
  fullName: string,
  pnr?: string | null,
  address?: string | null
): Promise<SiteMatch[]> {
  const pnrPart = pnr ? pnr.replace(/\D/g, '').slice(-10).slice(0, 6) : ''
  const query = pnrPart
    ? `"${fullName}" ${pnrPart}`
    : `"${fullName}" (site:mrkoll.se OR site:ratsit.se OR site:merinfo.se OR site:hitta.se OR site:eniro.se OR site:birthday.se OR site:upplysning.se)`

  const [page1, page2] = await Promise.all([
    searchGoogle(query, 1),
    searchGoogle(query, 11),
  ])
  const allItems = [...page1, ...page2]

  const siteMap: Record<string, CSEItem> = {}
  for (const item of allItems) {
    const site = matchItemToSite(item)
    if (site && !siteMap[site] && isPersonProfile(item, fullName)) {
      siteMap[site] = item
    }
  }

  const results: SiteMatch[] = await Promise.all(
    SUPPORTED_SITES.map(async (site) => {
      const item = siteMap[site]

      if (!item && pnr) {
        const directUrl = buildDirectUrl(site, fullName, pnr)
        if (directUrl) {
          try {
            const res = await fetch(directUrl, {
              method: 'HEAD',
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' },
              signal: AbortSignal.timeout(4000),
              redirect: 'follow',
            })
            if (res.ok) {
              const scraped = await scrapeProfile(directUrl, site)
              return {
                site, found: true, profile_url: directUrl,
                title: `${fullName} på ${site}`,
                snippet: scraped.fields.map(f => `${f.label}: ${f.value}`).join(' · ') || null,
                exposed_fields: scraped.fields,
              }
            }
          } catch { /* ignore */ }
        }
      }

      if (!item) return { site, found: false, profile_url: null, title: null, snippet: null }

      const scraped = await scrapeProfile(item.link, site)
      return {
        site, found: true, profile_url: item.link,
        title: item.title, snippet: item.snippet,
        exposed_fields: scraped.fields,
      }
    })
  )

  return results
}

export function buildCombinedQuery(fullName: string, pnr?: string | null): string {
  const pnrPart = pnr ? pnr.replace(/\D/g, '').slice(-10).slice(0, 6) : ''
  return pnrPart ? `"${fullName}" ${pnrPart}` : `"${fullName}"`
}

export async function scanSite(fullName: string, site: SupportedSite, pnr?: string | null): Promise<SiteMatch> {
  const results = await scanAllSites(fullName, pnr)
  return results.find(r => r.site === site) || { site, found: false, profile_url: null, title: null, snippet: null }
}
