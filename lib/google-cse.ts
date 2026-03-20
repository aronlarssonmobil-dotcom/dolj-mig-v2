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

function normalizeForUrl(str: string): string {
  return str.toLowerCase()
    .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o')
    .replace(/é/g, 'e').replace(/ü/g, 'u').replace(/ø/g, 'o').replace(/æ/g, 'a')
    .replace(/[^a-z0-9]/g, '')
}

function normalizePnr(pnr: string): string {
  const digits = pnr.replace(/\D/g, '')
  return digits.length === 12 ? digits.slice(2) : digits.slice(-10)
}

function slugify(str: string): string {
  return str.toLowerCase()
    .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'sv-SE,sv;q=0.9',
}

async function checkExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: HEADERS,
      signal: AbortSignal.timeout(6000),
      redirect: 'follow',
    })
    if (!res.ok) return false
    const text = await res.text()
    const notFoundPatterns = [
      'hittades inte', 'not found', '404', 'finns inte',
      'kunde inte hitta', 'no results', 'inga resultat'
    ]
    const lower = text.toLowerCase()
    const isNotFound = notFoundPatterns.some(p => lower.includes(p)) && text.length < 5000
    return !isNotFound
  } catch {
    return false
  }
}

async function checkRatsit(fullName: string, pnr: string | null): Promise<{ found: boolean; url: string | null }> {
  if (pnr) {
    const pnr10 = normalizePnr(pnr)
    const parts = fullName.trim().split(/\s+/)
    const first = parts[0] || ''
    const last = parts[parts.length - 1] || ''
    const url = `https://www.ratsit.se/${pnr10.slice(0,6)}-${pnr10.slice(6)}/${first}-${last}`
    const exists = await checkExists(url)
    if (exists) return { found: true, url }
  }
  const searchUrl = `https://www.ratsit.se/sok/person?vad=${encodeURIComponent(fullName)}`
  return { found: false, url: searchUrl }
}

async function checkMrkoll(fullName: string, pnr: string | null): Promise<{ found: boolean; url: string | null }> {
  if (pnr) {
    const pnr10 = normalizePnr(pnr)
    const pnrShort = pnr10.slice(0, 6)
    const parts = fullName.trim().split(/\s+/)
    const first = slugify(parts[0] || '')
    const last = slugify(parts[parts.length - 1] || '')
    const url = `https://mrkoll.se/person/${first}-${last}-${pnrShort}/`
    const exists = await checkExists(url)
    if (exists) return { found: true, url }
  }
  return { found: false, url: `https://mrkoll.se/person/?namn=${encodeURIComponent(fullName)}` }
}

async function checkMerinfo(fullName: string, pnr: string | null): Promise<{ found: boolean; url: string | null }> {
  if (pnr) {
    const pnr10 = normalizePnr(pnr)
    const parts = fullName.trim().split(/\s+/)
    const first = slugify(parts[0] || '')
    const last = slugify(parts[parts.length - 1] || '')
    const url = `https://www.merinfo.se/person/${first}-${last}/${pnr10}`
    const exists = await checkExists(url)
    if (exists) return { found: true, url }
  }
  return { found: false, url: `https://www.merinfo.se/search?who=${encodeURIComponent(fullName)}` }
}

async function checkHitta(fullName: string, pnr: string | null): Promise<{ found: boolean; url: string | null }> {
  const searchUrl = `https://www.hitta.se/s%C3%B6k?vad=${encodeURIComponent(fullName)}`
  try {
    const res = await fetch(searchUrl, {
      headers: HEADERS,
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return { found: false, url: searchUrl }
    const text = await res.text()
    const hasResults = text.includes('person') && (
      text.includes(normalizeForUrl(fullName.split(' ')[0])) ||
      text.toLowerCase().includes(fullName.toLowerCase().split(' ')[0])
    )
    return { found: hasResults, url: searchUrl }
  } catch {
    return { found: false, url: searchUrl }
  }
}

async function checkEniro(fullName: string): Promise<{ found: boolean; url: string | null }> {
  const searchUrl = `https://www.eniro.se/s/${encodeURIComponent(fullName)}/person`
  try {
    const res = await fetch(searchUrl, {
      headers: HEADERS,
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return { found: false, url: searchUrl }
    const text = await res.text()
    const hasResults = text.includes('person-card') ||
                       text.toLowerCase().includes(fullName.toLowerCase().split(' ')[0])
    return { found: hasResults, url: searchUrl }
  } catch {
    return { found: false, url: searchUrl }
  }
}

async function checkBirthday(fullName: string): Promise<{ found: boolean; url: string | null }> {
  const searchUrl = `https://birthday.se/sok/?q=${encodeURIComponent(fullName)}`
  try {
    const res = await fetch(searchUrl, {
      headers: HEADERS,
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return { found: false, url: searchUrl }
    const text = await res.text()
    const hasResults = text.includes('birthday-result') ||
                       text.toLowerCase().includes(fullName.toLowerCase().split(' ')[0])
    return { found: hasResults, url: searchUrl }
  } catch {
    return { found: false, url: searchUrl }
  }
}

async function checkUpplysning(fullName: string): Promise<{ found: boolean; url: string | null }> {
  const searchUrl = `https://www.upplysning.se/Person/Sok/?q=${encodeURIComponent(fullName)}`
  try {
    const res = await fetch(searchUrl, {
      headers: HEADERS,
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return { found: false, url: searchUrl }
    const text = await res.text()
    const hasResults = text.includes('person-item') ||
                       text.toLowerCase().includes(fullName.toLowerCase().split(' ')[0])
    return { found: hasResults, url: searchUrl }
  } catch {
    return { found: false, url: searchUrl }
  }
}

export async function scanAllSites(
  fullName: string,
  pnr?: string | null,
  address?: string | null,
): Promise<SiteMatch[]> {
  const [ratsit, mrkoll, merinfo, hitta, eniro, birthday, upplysning] = await Promise.all([
    checkRatsit(fullName, pnr ?? null),
    checkMrkoll(fullName, pnr ?? null),
    checkMerinfo(fullName, pnr ?? null),
    checkHitta(fullName, pnr ?? null),
    checkEniro(fullName),
    checkBirthday(fullName),
    checkUpplysning(fullName),
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
        snippet: scraped.fields.map(f => `${f.label}: ${f.value}`).join(' · ') || null,
        exposed_fields: scraped.fields,
      }
    })
  )

  return results
}

export function buildCombinedQuery(fullName: string, pnr?: string | null): string {
  const pnrShort = pnr ? pnr.replace(/\D/g, '').slice(-10).slice(0, 6) : ''
  return pnrShort ? `"${fullName}" ${pnrShort}` : `"${fullName}"`
}

export async function scanSite(fullName: string, site: SupportedSite, pnr?: string | null): Promise<SiteMatch> {
  const results = await scanAllSites(fullName, pnr)
  return results.find(r => r.site === site) || { site, found: false, profile_url: null, title: null, snippet: null }
}
