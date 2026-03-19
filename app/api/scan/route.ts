export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scanAllSites, buildCombinedQuery } from '@/lib/google-cse'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    fullName?: string
    personnummer?: string
    address?: string
    city?: string
    personId?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  let personId: string

  // Support both old (personId) and new (form data) flows
  if (body.personId) {
    // Legacy: verify person belongs to user
    const { data: existingPerson, error: personError } = await supabase
      .from('protected_persons')
      .select('id')
      .eq('id', body.personId)
      .eq('profile_id', user.id)
      .single()

    if (personError || !existingPerson) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }
    personId = body.personId
  } else {
    // New flow: accept raw form data, upsert protected_person
    const { fullName, personnummer, address, city } = body

    if (!fullName?.trim()) {
      return NextResponse.json({ error: 'fullName is required' }, { status: 400 })
    }

    // Upsert: find existing person for this user with same name, or create new
    const { data: existingPersons } = await supabase
      .from('protected_persons')
      .select('id')
      .eq('profile_id', user.id)
      .ilike('full_name', fullName.trim())
      .limit(1)

    if (existingPersons && existingPersons.length > 0) {
      // Update existing person with latest data
      const existing = existingPersons[0]
      await supabase
        .from('protected_persons')
        .update({
          pnr: personnummer || null,
          address: address || null,
          city: city || null,
        })
        .eq('id', existing.id)
      personId = existing.id
    } else {
      // Create new protected person
      const { data: newPerson, error: createError } = await supabase
        .from('protected_persons')
        .insert({
          profile_id: user.id,
          full_name: fullName.trim(),
          pnr: personnummer || null,
          address: address || null,
          city: city || null,
          is_active: true,
        })
        .select('id')
        .single()

      if (createError || !newPerson) {
        console.error('Failed to create person:', createError)
        return NextResponse.json({ error: 'Failed to create person record' }, { status: 500 })
      }
      personId = newPerson.id
    }
  }

  // Fetch person details for the scan
  const { data: person } = await supabase
    .from('protected_persons')
    .select('full_name, pnr')
    .eq('id', personId)
    .single()

  if (!person) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 })
  }

  // Create scan record
  const googleQuery = buildCombinedQuery(person.full_name, person.pnr)
  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .insert({
      person_id: personId,
      triggered_by: 'manual',
      status: 'running',
      google_query: googleQuery,
    })
    .select()
    .single()

  if (scanError || !scan) {
    console.error('Failed to create scan:', scanError)
    return NextResponse.json({ error: 'Failed to create scan' }, { status: 500 })
  }

  // Run scan synchronously (works reliably in serverless)
  try {
    const siteResults = await scanAllSites(person.full_name, person.pnr)

    // Insert scan results
    const scanResults = siteResults.map((r) => ({
      scan_id: scan.id,
      site: r.site,
      found: r.found,
      profile_url: r.profile_url,
      title: r.title,
      snippet: r.snippet,
      exposed_fields: r.exposed_fields || [],
    }))

    const { data: insertedResults } = await supabase
      .from('scan_results')
      .insert(scanResults)
      .select()

    // Mark scan as completed
    await supabase
      .from('scans')
      .update({
        status: 'completed',
        raw_results: siteResults as unknown as Record<string, unknown>,
        completed_at: new Date().toISOString(),
      })
      .eq('id', scan.id)

    // Return results directly so the UI doesn't need to poll
    return NextResponse.json({
      scanId: scan.id,
      results: (insertedResults || scanResults.map((r, i) => ({ ...r, id: `temp-${i}` }))),
    })
  } catch (error) {
    console.error(`Scan ${scan.id} failed:`, error)
    await supabase
      .from('scans')
      .update({ status: 'failed', completed_at: new Date().toISOString() })
      .eq('id', scan.id)

    return NextResponse.json({ error: 'Scan failed. Please try again.' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const personId = searchParams.get('personId')

  let query = supabase
    .from('scans')
    .select('*, protected_persons!inner(profile_id), scan_results(*)')
    .eq('protected_persons.profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (personId) {
    query = query.eq('person_id', personId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ scans: data })
}
