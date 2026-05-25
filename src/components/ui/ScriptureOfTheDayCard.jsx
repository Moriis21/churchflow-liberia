// ============================================================
// ChurchFlow Liberia — Scripture of the Day Card
//
// • Pulls the verse from services/dailyScripture (role-aware,
//   deterministic per day, cached in InsForge).
// • Auto-refreshes when the local date rolls over (e.g. user
//   left the dashboard open past midnight).
// ============================================================
import React, { useEffect, useState } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import { getDailyScripture, todayKey } from '../../services/dailyScripture'

export default function ScriptureOfTheDayCard({ className = '' }) {
  const { user } = useAuth()
  const { church } = useChurch()

  const role     = user?.role ?? user?.profile?.role ?? user?.user_metadata?.role ?? 'member'
  const churchId = church?.id ?? null

  const [scripture, setScripture] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [dateKey,   setDateKey]   = useState(todayKey())

  // ── Load scripture whenever role / church / date changes ──
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getDailyScripture({ role, churchId, date: dateKey })
      .then((v) => { if (!cancelled) setScripture(v) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [role, churchId, dateKey])

  // ── Midnight watcher: tick every minute, swap on date change
  useEffect(() => {
    const id = setInterval(() => {
      const now = todayKey()
      if (now !== dateKey) setDateKey(now)
    }, 60_000)
    return () => clearInterval(id)
  }, [dateKey])

  return (
    <div className={[
      'relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
      'p-8 shadow-xl shadow-amber-400/25',
      className,
    ].join(' ')}>
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-amber-600/20 rounded-full translate-y-1/2 blur-xl" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-amber-950/15 backdrop-blur-sm flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-amber-950" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800">
              Scripture of the Day
            </p>
            {scripture?.theme && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/15 text-amber-900">
                {scripture.theme}
              </span>
            )}
          </div>

          {loading || !scripture ? (
            <div className="flex items-center gap-2 text-amber-950/80 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Loading today's verse…</span>
            </div>
          ) : (
            <>
              <p className="text-base sm:text-lg font-semibold text-amber-950 leading-relaxed mb-2">
                {scripture.text}
              </p>
              <p className="text-sm font-bold text-amber-800">
                — {scripture.reference}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
