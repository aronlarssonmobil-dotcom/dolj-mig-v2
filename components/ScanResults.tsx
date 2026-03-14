'use client'

import { useState } from 'react'

const SITE_META: Record<string, { icon: string; displayName: string; color: string }> = {
  'ratsit.se': { icon: '📋', displayName: 'Ratsit.se', color: 'text-blue-400' },
  'mrkoll.se': { icon: '🔎', displayName: 'MrKoll.se', color: 'text-purple-400' },
  'merinfo.se': { icon: '📊', displayName: 'Merinfo.se', color: 'text-cyan-400' },
  'hitta.se': { icon: '📍', displayName: 'Hitta.se', color: 'text-orange-400' },
  'eniro.se': { icon: '🏢', displayName: 'Eniro.se', color: 'text-yellow-400' },
  'birthday.se': { icon: '🎂', displayName: 'Birthday.se', color: 'text-pink-400' },
  'upplysning.se': { icon: '💡', displayName: 'Upplysning.se', color: 'text-emerald-400' },
}

export interface ScanResult {
  id: string
  site: string
  found: boolean
  profile_url?: string | null
  title?: string | null
  snippet?: string | null
}

interface ScanResultsProps {
  results: ScanResult[]
  scanId: string
  onTakedownSent?: (siteId: string) => void
}

export default function ScanResults({ results, scanId, onTakedownSent }: ScanResultsProps) {
  const foundResults = results.filter((r) => r.found)
  const notFoundResults = results.filter((r) => !r.found)

  const foundCount = foundResults.length
  const totalCount = results.length

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Dina uppgifter hittades på</span>
            <span className="text-sm font-semibold text-white">
              {foundCount}/{totalCount} sajter
            </span>
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                foundCount === 0
                  ? 'bg-emerald-500'
                  : foundCount <= 2
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${totalCount > 0 ? (foundCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="flex-shrink-0 text-2xl">
          {foundCount === 0 ? '✅' : foundCount <= 2 ? '⚠️' : '🚨'}
        </div>
      </div>

      {/* Found sites */}
      {foundResults.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wide">
            Hittade ({foundResults.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {foundResults.map((result) => (
              <FoundCard
                key={result.id}
                result={result}
                scanId={scanId}
                onTakedownSent={onTakedownSent}
              />
            ))}
          </div>
        </div>
      )}

      {/* Not found sites */}
      {notFoundResults.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wide">
            Ej hittade ({notFoundResults.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notFoundResults.map((result) => (
              <NotFoundCard key={result.id} result={result} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FoundCard({
  result,
  scanId,
  onTakedownSent,
}: {
  result: ScanResult
  scanId: string
  onTakedownSent?: (siteId: string) => void
}) {
  const meta = SITE_META[result.site] || {
    icon: '🌐',
    displayName: result.site,
    color: 'text-white',
  }
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const handleTakedown = async () => {
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch('/api/takedown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_result_id: result.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        setSendError(data.error || 'Misslyckades')
      } else {
        setSent(true)
        onTakedownSent?.(result.id)
      }
    } catch {
      setSendError('Nätverksfel. Försök igen.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-red-500/[0.04] border border-red-500/20 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{meta.icon}</span>
          <div>
            <p className={`font-semibold text-sm ${meta.color}`}>{meta.displayName}</p>
            {result.title && (
              <p className="text-white/40 text-xs truncate max-w-[160px]">{result.title}</p>
            )}
          </div>
        </div>
        <span className="bg-red-500/15 text-red-400 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Hittad
        </span>
      </div>

      {result.snippet && (
        <p className="text-white/30 text-xs leading-relaxed line-clamp-2">{result.snippet}</p>
      )}

      <div className="flex flex-col gap-2">
        {result.profile_url && (
          <a
            href={result.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white transition-colors truncate"
          >
            🔗 {result.profile_url.replace(/^https?:\/\//, '').slice(0, 50)}
          </a>
        )}

        {sent ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <span>✓</span>
            <span>Borttagningskrav skickat</span>
          </div>
        ) : (
          <button
            onClick={handleTakedown}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <span className="w-3 h-3 border border-red-400/50 border-t-red-400 rounded-full animate-spin" />
                Skickar...
              </>
            ) : (
              '📨 Skicka borttagningskrav'
            )}
          </button>
        )}
        {sendError && <p className="text-red-400 text-xs">{sendError}</p>}
      </div>
    </div>
  )
}

function NotFoundCard({ result }: { result: ScanResult }) {
  const meta = SITE_META[result.site] || {
    icon: '🌐',
    displayName: result.site,
    color: 'text-white',
  }

  return (
    <div className="bg-emerald-500/[0.03] border border-emerald-500/15 rounded-2xl p-5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-base">{meta.icon}</span>
        <p className="font-medium text-sm text-white/70">{meta.displayName}</p>
      </div>
      <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
        <span>✓</span>
        Ej synlig
      </span>
    </div>
  )
}
