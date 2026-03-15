'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
  const [profile, setProfile] = useState<{
    full_name?: string | null
    subscription_status?: string
    subscription_tier?: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, subscription_status, subscription_tier')
        .eq('id', user.id)
        .single()

      setUser(user)
      setProfile(profile)
      setFullName(profile?.full_name || '')
      setLoading(false)
    }
    load()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user!.id!)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const tierLabels: Record<string, string> = {
    basic: 'Grundskydd',
    full: 'Fullständigt Skydd',
    family: 'Familjeskydd',
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">Inställningar</h1>
        <p className="text-white/40 text-sm">Hantera ditt konto och abonnemang.</p>
      </div>

      {/* Profile */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5">Profil</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              E-postadress
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white/50 text-sm cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Fullt namn
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Anna Svensson"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sparar...
              </>
            ) : saved ? (
              '✓ Sparat!'
            ) : (
              'Spara ändringar'
            )}
          </button>
        </form>
      </div>

      {/* Subscription */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5">Abonnemang</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  profile?.subscription_status === 'active' ? 'bg-emerald-400' : 'bg-yellow-400'
                }`}
              />
              <p className="text-white text-sm font-medium">
                {profile?.subscription_status === 'active'
                  ? 'Aktivt abonnemang'
                  : 'Inget aktivt abonnemang'}
              </p>
            </div>
            <p className="text-white/40 text-xs">
              {profile?.subscription_tier
                ? tierLabels[profile.subscription_tier] || profile.subscription_tier
                : 'Välj ett paket för att starta skyddet'}
            </p>
          </div>
          {profile?.subscription_status === 'active' ? (
            <button className="text-xs text-white/40 hover:text-white transition-colors border border-white/[0.06] hover:border-white/10 px-4 py-2 rounded-lg">
              Hantera via Stripe →
            </button>
          ) : (
            <a
              href="/#priser"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              Välj paket →
            </a>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-500/[0.03] border border-red-500/15 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-2">Logga ut</h2>
        <p className="text-white/40 text-sm mb-4">
          Loggar ut dig från alla enheter.
        </p>
        <button
          onClick={handleSignOut}
          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          Logga ut
        </button>
      </div>
    </div>
  )
}
