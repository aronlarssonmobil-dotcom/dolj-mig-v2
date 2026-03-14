'use client'

import { useState, useEffect, useRef } from 'react'
import ScanResults, { ScanResult } from '@/components/ScanResults'

const PROGRESS_MESSAGES = [
  'Söker på Ratsit.se...',
  'Söker på MrKoll.se...',
  'Söker på Merinfo.se...',
  'Söker på Hitta.se...',
  'Söker på Eniro.se...',
  'Söker på Birthday.se...',
  'Söker på Upplysning.se...',
  'Analyserar resultat...',
  'Sammanställer rapport...',
]

type Step = 'form' | 'scanning' | 'results'

interface FormData {
  fullName: string
  personnummer: string
  address: string
  city: string
}

export default function ScanPage() {
  const [step, setStep] = useState<Step>('form')
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    personnummer: '',
    address: '',
    city: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState(PROGRESS_MESSAGES[0])
  const [scanId, setScanId] = useState<string | null>(null)
  const [results, setResults] = useState<ScanResult[]>([])
  const [scanError, setScanError] = useState<string | null>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const startFakeProgress = () => {
    setProgress(0)
    let step = 0
    const totalMs = 15000
    const intervalMs = 200
    const totalSteps = totalMs / intervalMs

    progressInterval.current = setInterval(() => {
      step++
      const raw = step / totalSteps
      // Ease-out: slows down near 100
      const eased = Math.min(raw * (2 - raw), 0.97)
      setProgress(Math.round(eased * 100))

      // Cycle through messages
      const msgIndex = Math.floor((eased * 0.97) / (1 / PROGRESS_MESSAGES.length))
      setProgressMessage(PROGRESS_MESSAGES[Math.min(msgIndex, PROGRESS_MESSAGES.length - 1)])

      if (step >= totalSteps) {
        clearInterval(progressInterval.current!)
      }
    }, intervalMs)
  }

  const stopProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
      progressInterval.current = null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.fullName.trim()) {
      setFormError('Ange fullständigt namn.')
      return
    }

    setStep('scanning')
    startFakeProgress()
    setScanError(null)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        stopProgress()
        setScanError(data.error || 'Scanningen misslyckades. Försök igen.')
        setStep('form')
        return
      }

      setScanId(data.scanId)

      // Poll for results if needed or use returned results
      if (data.results) {
        stopProgress()
        setProgress(100)
        setProgressMessage('Klar!')
        setTimeout(() => {
          setResults(data.results)
          setStep('results')
        }, 500)
      } else {
        // Poll
        pollScan(data.scanId)
      }
    } catch {
      stopProgress()
      setScanError('Nätverksfel. Kontrollera din anslutning och försök igen.')
      setStep('form')
    }
  }

  const pollScan = async (id: string) => {
    const maxAttempts = 30
    let attempts = 0

    const poll = async () => {
      try {
        const res = await fetch(`/api/scan/${id}`)
        const data = await res.json()

        if (data.status === 'completed' && data.results) {
          stopProgress()
          setProgress(100)
          setProgressMessage('Klar!')
          setTimeout(() => {
            setResults(data.results)
            setStep('results')
          }, 500)
          return
        }

        if (data.status === 'failed') {
          stopProgress()
          setScanError('Scanningen misslyckades. Försök igen.')
          setStep('form')
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000)
        } else {
          stopProgress()
          setScanError('Scanningen tog för lång tid. Försök igen.')
          setStep('form')
        }
      } catch {
        attempts++
        if (attempts < maxAttempts) setTimeout(poll, 3000)
      }
    }

    setTimeout(poll, 2000)
  }

  const handleReset = () => {
    setStep('form')
    setResults([])
    setScanId(null)
    setProgress(0)
  }

  useEffect(() => {
    return () => stopProgress()
  }, [])

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">Ny scan</h1>
        <p className="text-white/40 text-sm">
          Vi söker igenom 7 svenska sajter och hittar var dina personuppgifter syns.
        </p>
      </div>

      {/* FORM */}
      {step === 'form' && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Fullständigt namn <span className="text-violet-400">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                placeholder="Anna Svensson"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Personnummer{' '}
                <span className="text-white/20 font-normal">(valfritt, YYMMDDXXXX)</span>
              </label>
              <input
                type="text"
                value={formData.personnummer}
                onChange={(e) => setFormData({ ...formData, personnummer: e.target.value })}
                placeholder="8001011234"
                maxLength={10}
                pattern="[0-9]{10}"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
              <p className="text-white/20 text-xs mt-1.5">
                Ökar träffsäkerheten markant — lagras krypterat.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  Gatuadress <span className="text-white/20 font-normal">(valfritt)</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Storgatan 1"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  Stad <span className="text-white/20 font-normal">(valfritt)</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Stockholm"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
                {formError}
              </div>
            )}

            {scanError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
                {scanError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
            >
              🔍 Starta scan
            </button>
          </form>
        </div>
      )}

      {/* SCANNING */}
      {step === 'scanning' && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-2xl mx-auto mb-6">
            🔍
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">Scannar nu...</h2>
          <p className="text-white/40 text-sm mb-8">{progressMessage}</p>

          <div className="w-full bg-white/[0.06] rounded-full h-2 mb-3 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-white/30">
            <span>Söker igenom 7 sajter</span>
            <span>{progress}%</span>
          </div>

          <div className="mt-8 grid grid-cols-4 md:grid-cols-7 gap-2">
            {['Ratsit', 'MrKoll', 'Merinfo', 'Hitta', 'Eniro', 'Birthday', 'Upplysning'].map(
              (site, i) => {
                const threshold = ((i + 1) / 7) * 100
                const done = progress >= threshold
                return (
                  <div
                    key={site}
                    className={`text-center transition-all ${done ? 'opacity-100' : 'opacity-20'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg mx-auto mb-1 flex items-center justify-center text-xs ${
                        done
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'bg-white/5 text-white/20'
                      }`}
                    >
                      {done ? '✓' : '…'}
                    </div>
                    <p className="text-[9px] text-white/30">{site}</p>
                  </div>
                )
              }
            )}
          </div>
        </div>
      )}

      {/* RESULTS */}
      {step === 'results' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Scanresultat</h2>
            <button
              onClick={handleReset}
              className="text-sm text-white/40 hover:text-white transition-colors border border-white/[0.06] hover:border-white/10 px-4 py-2 rounded-lg"
            >
              + Ny scan
            </button>
          </div>
          <ScanResults results={results} scanId={scanId || ''} />
        </div>
      )}
    </div>
  )
}
