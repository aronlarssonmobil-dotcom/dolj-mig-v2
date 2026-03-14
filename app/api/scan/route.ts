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

  let body: { personId: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { personId } = body
  if (!personId) {
    return NextResponse.json({ error: 'personId is required' }, { status: 400 })
  }

  // Verify person belongs to user
  const { data: person, error: personError } = await supabase
    .from('protected_persons')
    .select('*, profiles!inner(id)')
    .eq('id', personId)
    .eq('profiles.id', user.id)
    .single()

  if (personError || !person) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 })
  }

  // Check subscription
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.subscription_status !== 'active') {
    return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
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

  // Run scan asynchronously (don't await) and return scan ID immediately
  runScan(scan.id, person.full_name, person.pnr, personId).catch(console.error)

  return NextResponse.json({ scanId: scan.id, status: 'running' }, { status: 202 })
}

async function runScan(
  scanId: string,
  fullName: string,
  pnr: string | null,
  personId: string
) {
  // Use service role for background work
  const { createServiceClient } = await import('@/lib/supabase/server')
  const supabase = await createServiceClient()

  try {
    const siteResults = await scanAllSites(fullName, pnr)

    // Insert scan results
    const scanResults = siteResults.map((r) => ({
      scan_id: scanId,
      site: r.site,
      found: r.found,
      profile_url: r.profile_url,
      title: r.title,
      snippet: r.snippet,
    }))

    await supabase.from('scan_results').insert(scanResults)

    // Mark scan as completed
    await supabase
      .from('scans')
      .update({
        status: 'completed',
        raw_results: siteResults as unknown as Record<string, unknown>,
        completed_at: new Date().toISOString(),
      })
      .eq('id', scanId)
  } catch (error) {
    console.error(`Scan ${scanId} failed:`, error)
    await supabase
      .from('scans')
      .update({ status: 'failed', completed_at: new Date().toISOString() })
      .eq('id', scanId)
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
