'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'basic'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte.')
      return
    }
    if (password.length < 8) {
      setError('Lösenordet måste vara minst 8 tecken.')
      return
    }
    if (!acceptTerms) {
      setError('Du måste godkänna villkoren för att fortsätta.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            selected_plan: plan,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
        },
      })

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          setError('Det finns redan ett konto med den e-postadressen. Logga in istället.')
        } else if (error.message.includes('Password should be')) {
          setError('Lösenordet är för svagt. Välj ett starkare lösenord.')
        } else {
          setError('Registreringen misslyckades. Försök igen.')
        }
        return
      }

      setSuccess(true)
    } catch {
      setError('Något gick fel. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  const planLabels: Record<string, string> = {
    basic: 'Grundskydd — 99 kr/mån',
    full: 'Fullständigt Skydd — 149 kr/mån',
    family: 'Familjeskydd — 249 kr/mån',
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
        <div className="relative w-full max-w-md text-center">
          <div className="text-5xl mb-6">📬</div>
          <h1 className="text-2xl font-semibold text-white mb-3">Kolla din inbox!</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            Vi har skickat en bekräftelselänk till{' '}
            <span className="text-white font-medium">{email}</span>.
            Klicka på länken för att aktivera ditt konto och börja skydda din integritet.
          </p>
          <p className="text-white/30 text-xs">
            Inget mail? Kolla skräpposten eller{' '}
            <button
              onClick={() => setSuccess(false)}
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              försök igen
            </button>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 py-12">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[5%] w-[400px] h-[400px] rounded-full bg-indigo-600/6 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-base font-bold">
              D
            </div>
            <span className="font-semibold text-white text-lg">Dölj Mig</span>
          </Link>
          <h1 className="text-2xl font-semibold text-white mb-2">Skapa ditt konto</h1>
          <p className="text-white/40 text-sm">Börja skydda dina personuppgifter idag</p>
        </div>

        {/* Selected plan badge */}
        {plan && planLabels[plan] && (
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
              {planLabels[plan]}
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-white/50 mb-1.5">
                Fullt namn
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Anna Svensson"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-white/50 mb-1.5">
                E-postadress
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="du@exempel.se"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-white/50 mb-1.5">
                Lösenord
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Minst 8 tecken"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-white/50 mb-1.5">
                Bekräfta lösenord
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Upprepa lösenordet"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border transition-all ${
                    acceptTerms
                      ? 'bg-violet-500 border-violet-500'
                      : 'bg-white/[0.04] border-white/[0.15] group-hover:border-white/30'
                  }`}
                >
                  {acceptTerms && (
                    <svg className="w-4 h-4 text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-white/50 leading-relaxed">
                Jag godkänner{' '}
                <Link href="/terms" className="text-violet-400 hover:text-violet-300 transition-colors">
                  användarvillkoren
                </Link>{' '}
                och{' '}
                <Link href="/integritetspolicy" className="text-violet-400 hover:text-violet-300 transition-colors">
                  integritetspolicyn
                </Link>
              </span>
            </label>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Skapar konto...
                </>
              ) : (
                'Skapa konto →'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-sm mt-6">
          Har du redan ett konto?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
            Logga in
          </Link>
        </p>
      </div>
    </div>
  )
}
