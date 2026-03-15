export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: scan, error } = await supabase
    .from('scans')
    .select(`
      *,
      protected_persons!inner(profile_id, full_name, pnr, address, city),
      scan_results(*)
    `)
    .eq('id', id)
    .eq('protected_persons.profile_id', user.id)
    .single()

  if (error || !scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
  }

  // Return in the format the scan page poll expects: { status, results }
  return NextResponse.json({
    status: scan.status,
    results: scan.scan_results || [],
    scan,
  })
}
