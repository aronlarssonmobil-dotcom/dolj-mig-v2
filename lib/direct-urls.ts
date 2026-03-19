/**
 * Direct URL builder — constructs profile URLs directly from name + personnummer
 * without relying on Google CSE which finds wrong pages (company pages, homepages, 404s)
 */

import type { SupportedSite } from '@/types'

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o')
    .replace(/é/g, 'e').replace(/ü/g, 'u').replace(/ø/g, 'o').replace(/æ/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizePnr(pnr: string): string {
  // Strip everything except digits, take last 10
  const digits = pnr.replace(/\D/g, '')
  return digits.length === 12 ? digits.slice(2) : digits.slice(-10)
}

export interface DirectUrlResult {
  site: SupportedSite
  searchUrl: string      // URL to search page (always works)
  profileUrl: string | null  // Direct profile URL if we can construct it
}

export function buildDirectUrls(
  fullName: string,
  pnr?: string | null
): DirectUrlResult[] {
  const nameParts = fullName.trim().split(/\s+/)
  const firstName = nameParts[0] || ''
  const lastName = nameParts[nameParts.length - 1] || ''
  const fullSlug = slugify(fullName)
  const firstSlug = slugify(firstName)
  const lastSlug = slugify(lastName)
  
  const pnrNorm = pnr ? normalizePnr(pnr) : null
  const pnrShort = pnrNorm ? pnrNorm.slice(0, 6) : null // YYMMDD
  const pnrFull = pnrNorm // YYMMDDXXXX

  return [
    {
      site: 'ratsit.se',
      // Ratsit person search (not company!)
      searchUrl: `https://www.ratsit.se/sok/person?vad=${encodeURIComponent(fullName)}`,
      // Person profile URL format: ratsit.se/YYMMDD-XXXX/Fornamn-Efternamn
      profileUrl: pnrNorm
        ? `https://www.ratsit.se/${pnrNorm.slice(0,6)}-${pnrNorm.slice(6)}/${firstName}-${lastName}`
        : null,
    },
    {
      site: 'mrkoll.se',
      searchUrl: `https://mrkoll.se/person/?namn=${encodeURIComponent(fullName)}`,
      // MrKoll format: mrkoll.se/person/fornamn-efternamn-YYMMDD/
      profileUrl: pnrShort
        ? `https://mrkoll.se/person/${firstSlug}-${lastSlug}-${pnrShort}/`
        : null,
    },
    {
      site: 'merinfo.se',
      searchUrl: `https://www.merinfo.se/sok?what=${encodeURIComponent(fullName)}`,
      // Merinfo format: merinfo.se/person/fornamn-efternamn/YYMMDDXXXX
      profileUrl: pnrNorm
        ? `https://www.merinfo.se/person/${firstSlug}-${lastSlug}/${pnrNorm}`
        : null,
    },
    {
      site: 'hitta.se',
      searchUrl: `https://www.hitta.se/s%C3%B6k?vad=${encodeURIComponent(fullName)}`,
      profileUrl: null, // Hitta uses dynamic IDs, can't construct directly
    },
    {
      site: 'eniro.se',
      searchUrl: `https://www.eniro.se/s/${encodeURIComponent(fullName)}/person`,
      profileUrl: null, // Eniro uses dynamic IDs
    },
    {
      site: 'birthday.se',
      searchUrl: `https://birthday.se/sok/?q=${encodeURIComponent(fullName)}`,
      profileUrl: null,
    },
    {
      site: 'upplysning.se',
      searchUrl: `https://www.upplysning.se/Person/Sok/?q=${encodeURIComponent(fullName)}`,
      profileUrl: null,
    },
  ]
}

/**
 * Check if a URL is accessible (returns 200)
 */
export async function checkUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    })
    return res.ok && res.status < 400
  } catch {
    return false
  }
}
