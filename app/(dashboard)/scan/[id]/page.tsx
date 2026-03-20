import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ScanResults from '@/components/ScanResults'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ScanDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: scan } = await supabase
    .from('scans')
    .select(`
      *,
      protected_persons!inner(profile_id, full_name),
      scan_results(*)
    `)
    .eq('id', id)
    .eq('protected_persons.profile_id', user.id)
    .single()

  if (!scan) notFound()

  const results = scan.scan_results || []

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-white/40 hover:text-white transition-colors text-sm"
        >
          ← Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">Scanresultat</h1>
        <p className="text-white/40 text-sm">
          {(scan.protected_persons as { full_name: string } | null)?.full_name} ·{' '}
          {new Date(scan.created_at).toLocaleDateString('sv-SE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {results.length > 0 ? (
        <ScanResults results={results} scanId={scan.id} />
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12 text-center">
          <p className="text-white/40">Inga resultat för denna scan.</p>
        </div>
      )}
    </div>
  )
}
