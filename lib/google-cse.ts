export const dynamic = 'force-dynamic'
import type { SupportedSite } from '@/types'
import { SUPPORTED_SITES } from '@/types'
import { scrapeProfile, ExposedField } from './profile-scraper'

export interface SiteMatch {
  site: SupportedSite
  found: boolean
  profile_url: string | null
  title: string | null
  snippet: string | null
  exposed_fields?: ExposedField[]
}

const HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'sv-SE,sv;q=0.9',
}

function extractUrls(html: string): string[] {
  const urls: string[] = []
  // DuckDuckGo result URLs appear in result__url class and in redirect links
  const patterns = [
    /class="result__url"[^>]*>\s*([^\s<]+)/g,
    /\/\/duckduckgo\.com\/l\/\?uddg=([^&"]+)/g,
    /href="(https?:\/\/(?:(?:www\.)?(?:ratsit|mrkoll|merinfo|hitta|eniro|birthday|upplysning)\.[^"]+))"/gi,
  ]
  
  for (const pattern of patterns) {
    let match
    const re = new RegExp(pattern.source, pattern.flags)
    while ((match = re.exec(html)) !== null) {
      try {
        const url = match[1].includes('%') ? decodeURIComponent(match[1]) : match[1]
        const clean = url.startsWith('http') ? url : `https://${url}`
        urls.push(clean)
      } catch {}
    }
  }
  return urls
}

function matchUrlToSite(url: string): SupportedSite | null {
  const lower = url.toLowerCase()
  for (const site of SUPPORTED_SITES) {
    if (lower.includes(site.replace('.se', '').replace('.', ''))) return site
    if (lower.includes(site)) return site
  }
  return null
}

function isPersonUrl(url: string, fullName: string): boolean {
  const nameParts = fullName.toLowerCase().split(/\s+/)
  const urlLower = url.toLowerCase()
  // Check if any name part appears in URL (normalized)
  const normalize = (s: string) => s
    .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o')
    .toLowerCase()
  return nameParts.some(part => 
    urlLower.includes(part) || urlLower.includes(normalize(part))
  )
}

async function searchDuckDuckGo(query: string): Promise<string[]> {
  try {
    const body = new URLSearchParams({ q: query, kl: 'se-sv' })
    const res = await fetch('https://html.duckduckgo.com/html/', {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const html = await res.text()
    return extractUrls(html)
  } catch {
    return []
  }
}

export async function scanAllSites(
  fullName: string,
  pnr?: string | null,
  address?: string | null,
): Promise<SiteMatch[]> {
  const pnrShort = pnr ? pnr.replace(/\D/g, '').slice(-10).slice(0, 6) : ''
  
  // Build targeted search queries
  const queries = pnrShort
    ? [
        `"${fullName}" ${pnrShort} site:ratsit.se OR site:mrkoll.se OR site:merinfo.se`,
        `"${fullName}" ${pnrShort} site:hitta.se OR site:eniro.se OR site:birthday.se OR site:upplysning.se`,
      ]
    : [
        `"${fullName}" site:ratsit.se OR site:mrkoll.se OR site:merinfo.se OR site:hitta.se OR site:eniro.se OR site:birthday.se OR site:upplysning.se`,
      ]

  // Run searches in parallel
  const results = await Promise.all(queries.map(q => searchDuckDuckGo(q)))
  const allUrls = results.flat()

  // Map to sites
  const siteMap: Record<string, string> = {}
  for (const url of allUrls) {
    const site = matchUrlToSite(url)
    if (site && !siteMap[site] && isPersonUrl(url, fullName)) {
      siteMap[site] = url
    }
  }

  // Build results
  const siteResults: SiteMatch[] = await Promise.all(
    SUPPORTED_SITES.map(async (site: SupportedSite) => {
      const url = siteMap[site]
      if (!url) return { site, found: false, profile_url: null, title: null, snippet: null }
      
      const scraped = await scrapeProfile(url, site)
      return {
        site,
        found: true,
        profile_url: url,
        title: `${fullName} på ${site}`,
        snippet: scraped.fields.map((f: ExposedField) => `${f.label}: ${f.value}`).join(' · ') || null,
        exposed_fields: scraped.fields,
      }
    })
  )

  return siteResults
}

export function buildCombinedQuery(fullName: string, pnr?: string | null): string {
  const pnrShort = pnr ? pnr.replace(/\D/g, '').slice(-10).slice(0, 6) : ''
  return pnrShort ? `"${fullName}" ${pnrShort}` : `"${fullName}"`
}

export async function scanSite(fullName: string, site: SupportedSite, pnr?: string | null): Promise<SiteMatch> {
  const results = await scanAllSites(fullName, pnr)
  return results.find(r => r.site === site) || { site, found: false, profile_url: null, title: null, snippet: null }
}
