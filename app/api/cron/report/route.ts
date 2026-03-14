export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { sendMonthlyReportEmail } from '@/lib/gdpr-emails'

function getServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceSupabase()
  const now = new Date()
  const reportMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Get all active full/family subscribers (they get PDF reports)
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, subscription_tier')
    .eq('subscription_status', 'active')
    .in('subscription_tier', ['full', 'family'])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: 'No eligible profiles', sent: 0 })
  }

  let sent = 0
  let failed = 0

  for (const profile of profiles) {
    try {
      // Gather stats for this profile for the current month
      const startOfMonth = `${reportMonth}-01`
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0]

      const { data: persons } = await supabase
        .from('protected_persons')
        .select('id')
        .eq('profile_id', profile.id)
        .eq('is_active', true)

      const personIds = persons?.map((p) => p.id) || []

      const { data: scans } = await supabase
        .from('scans')
        .select('id')
        .in('person_id', personIds)
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth + 'T23:59:59Z')

      const scanIds = scans?.map((s) => s.id) || []

      const { data: findings } = await supabase
        .from('scan_results')
        .select('id')
        .in('scan_id', scanIds)
        .eq('found', true)

      const { data: takedownsSent } = await supabase
        .from('takedown_requests')
        .select('id, status')
        .in('person_id', personIds)
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth + 'T23:59:59Z')

      const stats = {
        personsScanned: personIds.length,
        newFindings: findings?.length || 0,
        takedownsSent: takedownsSent?.length || 0,
        takedownsCompleted: takedownsSent?.filter((t) => t.status === 'confirmed').length || 0,
      }

      // Check if report already exists
      const { data: existingReport } = await supabase
        .from('monthly_reports')
        .select('id')
        .eq('profile_id', profile.id)
        .eq('report_month', reportMonth)
        .single()

      if (!existingReport) {
        await supabase.from('monthly_reports').insert({
          profile_id: profile.id,
          report_month: reportMonth,
          scan_summary: stats,
        })
      }

      await sendMonthlyReportEmail(profile.email, profile.full_name, reportMonth, stats)

      sent++
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (err) {
      console.error(`Failed to send report for ${profile.id}:`, err)
      failed++
    }
  }

  return NextResponse.json({
    message: 'Report emails sent',
    reportMonth,
    sent,
    failed,
  })
}
