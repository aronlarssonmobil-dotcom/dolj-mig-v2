export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendGDPREmail, sendTakedownConfirmationEmail } from '@/lib/gdpr-emails'
import { SITE_GDPR_EMAILS } from '@/types'
import type { SupportedSite } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { scanResultId?: string; scan_result_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Accept both camelCase and snake_case variants
  const scanResultId = body.scanResultId || body.scan_result_id
  if (!scanResultId) {
    return NextResponse.json({ error: 'scanResultId is required' }, { status: 400 })
  }

  // Get scan result with person info, verify ownership
  const { data: scanResult, error: srError } = await supabase
    .from('scan_results')
    .select(`
      *,
      scans!inner(
        person_id,
        protected_persons!inner(
          id, full_name, pnr, address, city,
          profiles!inner(id, email)
        )
      )
    `)
    .eq('id', scanResultId)
    .eq('scans.protected_persons.profiles.id', user.id)
    .single()

  if (srError || !scanResult) {
    return NextResponse.json({ error: 'Scan result not found' }, { status: 404 })
  }

  if (!scanResult.found || !scanResult.profile_url) {
    return NextResponse.json({ error: 'No profile found for this result' }, { status: 400 })
  }

  // Check if takedown already sent
  const { data: existing } = await supabase
    .from('takedown_requests')
    .select('id, status')
    .eq('scan_result_id', scanResultId)
    .in('status', ['pending', 'sent', 'confirmed'])
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'Takedown already requested', status: existing.status },
      { status: 409 }
    )
  }

  const person = scanResult.scans.protected_persons
  const profile = person.profiles
  const site = scanResult.site as SupportedSite
  const contactEmail = SITE_GDPR_EMAILS[site]

  // Create takedown record
  const { data: takedown, error: tdError } = await supabase
    .from('takedown_requests')
    .insert({
      scan_result_id: scanResultId,
      person_id: person.id,
      site,
      contact_email: contactEmail,
      status: 'pending',
    })
    .select()
    .single()

  if (tdError || !takedown) {
    return NextResponse.json({ error: 'Failed to create takedown request' }, { status: 500 })
  }

  // Send GDPR email
  try {
    await sendGDPREmail({
      personName: person.full_name,
      personPnr: person.pnr,
      personAddress: person.address,
      profileUrl: scanResult.profile_url,
      site,
      senderEmail: profile.email,
    })

    // Mark as sent
    await supabase
      .from('takedown_requests')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', takedown.id)

    // Send confirmation to customer
    await sendTakedownConfirmationEmail(
      profile.email,
      person.full_name,
      site,
      scanResult.profile_url
    ).catch(console.error)

    return NextResponse.json({
      success: true,
      takedownId: takedown.id,
      status: 'sent',
      sentTo: contactEmail,
    })
  } catch (error) {
    console.error('Failed to send GDPR email:', error)

    await supabase
      .from('takedown_requests')
      .update({ status: 'failed' })
      .eq('id', takedown.id)

    return NextResponse.json({ error: 'Failed to send GDPR email' }, { status: 500 })
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
    .from('takedown_requests')
    .select(`
      *,
      protected_persons!inner(profile_id, full_name)
    `)
    .eq('protected_persons.profile_id', user.id)
    .order('created_at', { ascending: false })

  if (personId) {
    query = query.eq('person_id', personId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ takedowns: data })
}
