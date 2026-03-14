export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { scanAllSites, buildCombinedQuery } from '@/lib/google-cse'
import { createServerClient } from '@supabase/ssr'

function getServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceSupabase()

  // Get all active subscriptions and their protected persons
  const { data: activeProfiles, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('subscription_status', 'active')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!activeProfiles || activeProfiles.length === 0) {
    return NextResponse.json({ message: 'No active profiles', scanned: 0 })
  }

  const profileIds = activeProfiles.map((p) => p.id)

  const { data: persons, error: personsError } = await supabase
    .from('protected_persons')
    .select('*')
    .in('profile_id', profileIds)
    .eq('is_active', true)

  if (personsError) {
    return NextResponse.json({ error: personsError.message }, { status: 500 })
  }

  if (!persons || persons.length === 0) {
    return NextResponse.json({ message: 'No active persons', scanned: 0 })
  }

  let scanned = 0
  let failed = 0
  const results: Array<{ personId: string; scanId: string; findingsCount: number }> = []

  for (const person of persons) {
    try {
      const googleQuery = buildCombinedQuery(person.full_name, person.pnr)

      const { data: scan } = await supabase
        .from('scans')
        .insert({
          person_id: person.id,
          triggered_by: 'cron',
          status: 'running',
          google_query: googleQuery,
        })
        .select()
        .single()

      if (!scan) continue

      const siteResults = await scanAllSites(person.full_name, person.pnr, person.address)
      const findings = siteResults.filter((r) => r.found)

      const scanResultRows = siteResults.map((r) => ({
        scan_id: scan.id,
        site: r.site,
        found: r.found,
        profile_url: r.profile_url,
        title: r.title,
        snippet: r.snippet,
      }))

      await supabase.from('scan_results').insert(scanResultRows)
      await supabase
        .from('scans')
        .update({
          status: 'completed',
          raw_results: siteResults as unknown as Record<string, unknown>,
          completed_at: new Date().toISOString(),
        })
        .eq('id', scan.id)

      results.push({ personId: person.id, scanId: scan.id, findingsCount: findings.length })
      scanned++

      // Rate limit: 1 person per 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000))
    } catch (err) {
      console.error(`Failed to scan person ${person.id}:`, err)
      failed++
    }
  }

  return NextResponse.json({
    message: 'Monthly scan complete',
    scanned,
    failed,
    results,
  })
}
