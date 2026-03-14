import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch protected persons
  const { data: persons } = await supabase
    .from('protected_persons')
    .select('*')
    .eq('profile_id', user!.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Fetch profile/subscription info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Stats
  const personIds = (persons || []).map((p) => p.id)

  let totalScans = 0
  let sitesFound = 0
  let takedownsSent = 0
  let recentScans: Array<{
    id: string
    created_at: string
    status: string
    google_query: string | null
    protected_persons: { full_name: string } | null
  }> = []

  if (personIds.length > 0) {
    const { count: scansCount } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .in('person_id', personIds)

    const { count: foundCount } = await supabase
      .from('scan_results')
      .select('*', { count: 'exact', head: true })
      .eq('found', true)

    const { count: takedownCount } = await supabase
      .from('takedown_requests')
      .select('*', { count: 'exact', head: true })
      .in('person_id', personIds)

    totalScans = scansCount || 0
    sitesFound = foundCount || 0
    takedownsSent = takedownCount || 0

    const { data: scans } = await supabase
      .from('scans')
      .select('id, created_at, status, google_query, protected_persons(full_name)')
      .in('person_id', personIds)
      .order('created_at', { ascending: false })
      .limit(5)

    recentScans = ((scans as unknown) as typeof recentScans) || []
  }

  const noPerson = !persons || persons.length === 0
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'där'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">
            Hej, {firstName} 👋
          </h1>
          <p className="text-white/40 text-sm">
            {noPerson
              ? 'Lägg till en person för att börja skydda dina uppgifter'
              : `Du skyddar ${persons.length} person${persons.length > 1 ? 'er' : ''}`}
          </p>
        </div>
        <Link
          href="/scan"
          className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-violet-500/20"
        >
          🔍 Starta ny scan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Genomförda scanningar', value: totalScans, icon: '🔍' },
          { label: 'Sajter hittade', value: sitesFound, icon: '⚠️' },
          { label: 'Borttagningskrav skickade', value: takedownsSent, icon: '📨' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-semibold text-white mb-1">{stat.value}</div>
            <div className="text-white/40 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Subscription status */}
      {profile && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${
                profile.subscription_status === 'active'
                  ? 'bg-emerald-400'
                  : 'bg-yellow-400'
              }`}
            />
            <div>
              <p className="text-white text-sm font-medium">
                {profile.subscription_status === 'active'
                  ? 'Abonnemang aktivt'
                  : 'Inget aktivt abonnemang'}
              </p>
              <p className="text-white/40 text-xs">
                {profile.subscription_tier
                  ? `Plan: ${
                      ({ basic: 'Grundskydd', full: 'Fullständigt Skydd', family: 'Familjeskydd' } as Record<string, string>)[
                        profile.subscription_tier
                      ] || profile.subscription_tier
                    }`
                  : 'Välj ett paket för att starta skyddet'}
              </p>
            </div>
          </div>
          {profile.subscription_status !== 'active' && (
            <Link
              href="/pricing"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              Välj paket →
            </Link>
          )}
        </div>
      )}

      {/* Empty state / CTA */}
      {noPerson ? (
        <div className="bg-white/[0.02] border border-dashed border-white/[0.10] rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h2 className="text-white font-semibold text-lg mb-2">
            Inga skyddade personer ännu
          </h2>
          <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
            Starta din första scan för att se var dina personuppgifter syns på internet och skicka
            borttagningskrav.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/20"
          >
            🔍 Starta ny scan
          </Link>
        </div>
      ) : (
        <>
          {/* Protected persons */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Skyddade personer</h2>
              <Link
                href="/scan"
                className="text-violet-400 hover:text-violet-300 transition-colors text-sm font-medium"
              >
                + Lägg till
              </Link>
            </div>
            <div className="space-y-3">
              {persons.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center text-sm font-semibold text-violet-300">
                      {person.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{person.full_name}</p>
                      <p className="text-white/30 text-xs">
                        {[person.city, person.address].filter(Boolean).join(' · ') || 'Ingen adress angiven'}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/scan"
                    className="text-xs text-white/40 hover:text-violet-400 transition-colors border border-white/[0.06] hover:border-violet-500/30 px-3 py-1.5 rounded-lg"
                  >
                    Scanna →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recent scans */}
          {recentScans.length > 0 && (
            <div>
              <h2 className="text-white font-semibold mb-4">Senaste scanningar</h2>
              <div className="space-y-2">
                {recentScans.map((scan) => (
                  <Link
                    key={scan.id}
                    href={`/scan/${scan.id}`}
                    className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-white/10 hover:bg-white/[0.03] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          scan.status === 'completed'
                            ? 'bg-emerald-400'
                            : scan.status === 'failed'
                            ? 'bg-red-400'
                            : scan.status === 'running'
                            ? 'bg-yellow-400 animate-pulse'
                            : 'bg-white/20'
                        }`}
                      />
                      <div>
                        <p className="text-white text-sm font-medium">
                          {scan.protected_persons?.full_name || 'Okänd person'}
                        </p>
                        <p className="text-white/30 text-xs">
                          {new Date(scan.created_at).toLocaleDateString('sv-SE', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        scan.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : scan.status === 'failed'
                          ? 'bg-red-500/10 text-red-400'
                          : scan.status === 'running'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-white/5 text-white/40'
                      }`}
                    >
                      {scan.status === 'completed'
                        ? 'Klar'
                        : scan.status === 'failed'
                        ? 'Misslyckades'
                        : scan.status === 'running'
                        ? 'Pågår...'
                        : 'Väntar'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Mobile CTA */}
      <div className="sm:hidden">
        <Link
          href="/scan"
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all"
        >
          🔍 Starta ny scan
        </Link>
      </div>
    </div>
  )
}
