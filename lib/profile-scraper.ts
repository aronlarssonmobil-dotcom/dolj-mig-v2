/**
 * Profile scraper — fetches a found profile URL and extracts exposed personal data
 * Each site has unique HTML structure, so we have site-specific extractors
 */

export interface ExposedField {
  label: string
  value: string
  sensitive: boolean // true = especially sensitive (pnr, income, debt)
}

export interface ScrapedProfile {
  fields: ExposedField[]
  scrapedAt: string
  error?: string
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function extractText(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern)
  return match ? match[1]?.trim() || null : null
}

function extractAll(html: string, pattern: RegExp): string[] {
  const results: string[] = []
  let match
  const re = new RegExp(pattern.source, pattern.flags + (pattern.flags.includes('g') ? '' : 'g'))
  while ((match = re.exec(html)) !== null) {
    if (match[1]) results.push(match[1].trim())
  }
  return results
}

// Strip HTML tags
function stripTags(str: string): string {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function scrapeRatsit(url: string): Promise<ExposedField[]> {
  const html = await fetchPage(url)
  if (!html) return []
  const fields: ExposedField[] = []

  const address = extractText(html, /(?:adress|address)[^>]*>([^<]{5,80})</i)
  if (address) fields.push({ label: 'Adress', value: stripTags(address), sensitive: true })

  const income = extractText(html, /(?:inkomst|lön)[^>]*>([0-9\s]+(?:kr|000)?)/i)
  if (income) fields.push({ label: 'Inkomst', value: income, sensitive: true })

  const age = extractText(html, /(?:ålder|år)[^>]*>(\d{2,3})/i)
  if (age) fields.push({ label: 'Ålder', value: `${age} år`, sensitive: false })

  const pnr = extractText(html, /(\d{6}[-–]\d{4})/)
  if (pnr) fields.push({ label: 'Personnummer', value: pnr, sensitive: true })

  return fields
}

async function scrapeMrKoll(url: string): Promise<ExposedField[]> {
  const html = await fetchPage(url)
  if (!html) return []
  const fields: ExposedField[] = []

  const address = extractText(html, /(?:bor på|gatuadress)[^>]*>([^<]{5,80})</i)
    || extractText(html, /class="address[^"]*"[^>]*>([^<]+)</)
  if (address) fields.push({ label: 'Adress', value: stripTags(address), sensitive: true })

  const income = extractText(html, /(?:inkomst)[^>]*>([\d\s]+(?:kr)?)/i)
  if (income) fields.push({ label: 'Inkomst', value: income, sensitive: true })

  const cars = extractAll(html, /(?:fordon|bil)[^>]*>([A-Z]{3}\s?\d{3})</i)
  cars.forEach(c => fields.push({ label: 'Fordon', value: c, sensitive: false }))

  return fields
}

async function scrapeMerinfo(url: string): Promise<ExposedField[]> {
  const html = await fetchPage(url)
  if (!html) return []
  const fields: ExposedField[] = []

  const address = extractText(html, /(?:adress)[^>]*>([^<]{5,80})</i)
  if (address) fields.push({ label: 'Adress', value: stripTags(address), sensitive: true })

  const income = extractText(html, /(?:inkomst|taxerad)[^>]*>([\d\s]+(?:kr)?)/i)
  if (income) fields.push({ label: 'Inkomst', value: income, sensitive: true })

  const age = extractText(html, /(\d{2,3})\s*år/i)
  if (age) fields.push({ label: 'Ålder', value: `${age} år`, sensitive: false })

  return fields
}

async function scrapeHitta(url: string): Promise<ExposedField[]> {
  const html = await fetchPage(url)
  if (!html) return []
  const fields: ExposedField[] = []

  const address = extractText(html, /class="[^"]*address[^"]*"[^>]*>([^<]{5,80})</)
    || extractText(html, /(?:bor på)[^>]*>([^<]+)</)
  if (address) fields.push({ label: 'Adress', value: stripTags(address), sensitive: true })

  const phone = extractText(html, /(?:telefon|tel)[^>]*>([\d\s\-+]{7,15})/i)
  if (phone) fields.push({ label: 'Telefon', value: phone, sensitive: false })

  // Neighbors section
  const neighbors = extractAll(html, /class="[^"]*neighbor[^"]*"[^>]*>([^<]+)</)
  if (neighbors.length > 0) {
    fields.push({ label: 'Grannar synliga', value: `${neighbors.length} grannar`, sensitive: true })
  }

  return fields
}

async function scrapeEniro(url: string): Promise<ExposedField[]> {
  const html = await fetchPage(url)
  if (!html) return []
  const fields: ExposedField[] = []

  const address = extractText(html, /class="[^"]*street[^"]*"[^>]*>([^<]+)</)
    || extractText(html, /(?:adress)[^>]*>([^<]{5,80})</i)
  if (address) fields.push({ label: 'Adress', value: stripTags(address), sensitive: true })

  const phone = extractText(html, /(0[0-9\-\s]{8,14})/)
  if (phone) fields.push({ label: 'Telefonnummer', value: phone, sensitive: false })

  return fields
}

async function scrapeBirthday(url: string): Promise<ExposedField[]> {
  const html = await fetchPage(url)
  if (!html) return []
  const fields: ExposedField[] = []

  const birthday = extractText(html, /(?:födelsedag|född)[^>]*>([^<]{5,30})</i)
  if (birthday) fields.push({ label: 'Födelsedag', value: birthday, sensitive: true })

  const age = extractText(html, /(\d{2,3})\s*år/i)
  if (age) fields.push({ label: 'Ålder', value: `${age} år`, sensitive: false })

  return fields
}

async function scrapeUpplysning(url: string): Promise<ExposedField[]> {
  const html = await fetchPage(url)
  if (!html) return []
  const fields: ExposedField[] = []

  const address = extractText(html, /(?:adress|folkbokförd)[^>]*>([^<]{5,80})</i)
  if (address) fields.push({ label: 'Adress', value: stripTags(address), sensitive: true })

  const income = extractText(html, /(?:inkomst|taxerad)[^>]*>([\d\s]+(?:kr)?)/i)
  if (income) fields.push({ label: 'Inkomst', value: income, sensitive: true })

  const debt = extractText(html, /(?:skuld|betalningsanmärkning)[^>]*>([^<]{3,50})</i)
  if (debt) fields.push({ label: 'Betalningsanm.', value: debt, sensitive: true })

  return fields
}

const SCRAPERS: Record<string, (url: string) => Promise<ExposedField[]>> = {
  'ratsit.se': scrapeRatsit,
  'mrkoll.se': scrapeMrKoll,
  'merinfo.se': scrapeMerinfo,
  'hitta.se': scrapeHitta,
  'eniro.se': scrapeEniro,
  'birthday.se': scrapeBirthday,
  'upplysning.se': scrapeUpplysning,
}

export async function scrapeProfile(
  profileUrl: string,
  site: string
): Promise<ScrapedProfile> {
  const scraper = SCRAPERS[site]
  if (!scraper) {
    return { fields: [], scrapedAt: new Date().toISOString(), error: 'No scraper for site' }
  }

  try {
    const fields = await scraper(profileUrl)
    return { fields, scrapedAt: new Date().toISOString() }
  } catch (err) {
    return {
      fields: [],
      scrapedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
