import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Rapporter',
  robots: { index: false },
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: reports } = await supabase
    .from('monthly_reports')
    .select('*')
    .eq('profile_id', user!.id)
    .order('report_month', { ascending: false })
    .limit(12)

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">Rapporter</h1>
        <p className="text-white/40 text-sm">
          Dina månatliga skyddsrapporter sammanfattar vad som hittats och tagits bort.
        </p>
      </div>

      {!reports || reports.length === 0 ? (
        <div className="bg-white/[0.02] border border-dashed border-white/[0.10] rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-white font-semibold text-lg mb-2">Inga rapporter ännu</h2>
          <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
            Din första rapport genereras automatiskt efter den första månatliga scanningen.
            Starta en scan för att komma igång.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/20"
          >
            🔍 Starta scan
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">📄</div>
                <div>
                  <p className="text-white text-sm font-medium">
                    Rapport — {new Date(report.report_month).toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-white/30 text-xs">
                    {new Date(report.created_at).toLocaleDateString('sv-SE')}
                  </p>
                </div>
              </div>
              {report.pdf_url ? (
                <a
                  href={report.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors border border-violet-500/20 px-3 py-1.5 rounded-lg"
                >
                  Ladda ner PDF →
                </a>
              ) : (
                <span className="text-xs text-white/20 border border-white/[0.06] px-3 py-1.5 rounded-lg">
                  Genereras...
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
