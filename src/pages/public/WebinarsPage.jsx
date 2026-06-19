// ============================================================
// ChurchFlow Liberia — Webinars (/webinars)
// Public-facing list of upcoming and past webinars, managed by Super Admin.
// ============================================================
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar, Clock, Users, PlayCircle, ArrowRight, Mic2, ChevronRight,
} from 'lucide-react'
import PublicLayout from './PublicLayout'
import { insforge } from '../../lib/insforge'

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function WebinarsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await insforge.database
          .from('webinars')
          .select('*')
          .neq('status', 'cancelled')
          .order('scheduled_at', { ascending: false })
        if (!cancelled) {
          if (error) console.warn('[Webinars] load error:', error)
          setItems(data || [])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const { upcoming, past } = useMemo(() => {
    const now = Date.now()
    const upcoming = []
    const past = []
    for (const w of items) {
      const t = new Date(w.scheduled_at).getTime()
      if (w.status === 'past' || (t < now && w.status !== 'live')) past.push(w)
      else upcoming.push(w)
    }
    upcoming.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    return { upcoming, past }
  }, [items])

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#151022] to-[#5B00B8] py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/60 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-5 border border-white/70">
            Webinars
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111827] leading-tight mb-4">
            Live training for church leaders
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Join live sessions with the ChurchFlow team. Learn best practices, ask questions, and connect with other Liberian church leaders.
          </p>
        </div>
      </section>

      {/* Upcoming */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-[#151022]">Upcoming webinars</h2>
            {upcoming.length > 0 && (
              <span className="text-xs font-semibold text-[#98A4B3] uppercase tracking-wide">
                {upcoming.length} scheduled
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-[#8A19FF] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyUpcoming />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {upcoming.map(w => <UpcomingCard key={w.id} webinar={w} />)}
            </div>
          )}
        </div>
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section className="py-14 px-4 bg-[#F7F8FA] border-t border-[#E4E7EC]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-extrabold text-[#151022] mb-6">Past webinars — recordings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {past.map(w => <PastCard key={w.id} webinar={w} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="pastel-canvas py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Mic2 className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-[#111827] mb-2">Want a webinar for your topic?</h2>
          <p className="text-slate-600 text-sm mb-6">
            Suggest a topic you'd like covered — we'll add it to the calendar.
          </p>
          <Link to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8A19FF] text-[#111827] text-sm font-semibold shadow-[0_4px_14px_rgba(138,25,255,0.30)] hover:bg-[#5B00B8] transition-colors">
            Suggest a topic
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}

// ─── Upcoming card ────────────────────────────────────────────
function UpcomingCard({ webinar }) {
  const date = new Date(webinar.scheduled_at)
  const dayNum  = date.getDate()
  const monthAb = date.toLocaleDateString('en-US', { month: 'short' })

  return (
    <article className="bg-white rounded-[20px] border border-[#E4E7EC] p-6 shadow-[0_1px_3px_rgba(21,16,34,0.06)] flex flex-col sm:flex-row gap-5">
      <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#151022] to-[#5B00B8] text-[#111827] flex flex-col items-center justify-center shadow-[0_4px_14px_rgba(138,25,255,0.25)]">
        <span className="text-[10px] font-bold uppercase tracking-wider">{monthAb}</span>
        <span className="text-2xl font-extrabold leading-none">{dayNum}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-[#151022] leading-snug mb-1">{webinar.title}</h3>
        {webinar.description && (
          <p className="text-xs text-[#475467] leading-relaxed mb-3 line-clamp-2">{webinar.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#98A4B3] mb-4">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> {fmtDate(webinar.scheduled_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {fmtTime(webinar.scheduled_at)} · {webinar.duration_min} min
          </span>
          {webinar.host && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> {webinar.host}
            </span>
          )}
        </div>
        {webinar.registration_url ? (
          <a href={webinar.registration_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8A19FF] text-[#111827] text-xs font-semibold shadow-[0_2px_8px_rgba(138,25,255,0.30)] hover:bg-[#5B00B8] transition-colors">
            Register free <ArrowRight className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC] text-[#98A4B3] text-xs font-semibold">
            Registration opening soon
          </span>
        )}
      </div>
    </article>
  )
}

// ─── Past card ────────────────────────────────────────────────
function PastCard({ webinar }) {
  return (
    <article className="bg-white rounded-[20px] border border-[#E4E7EC] overflow-hidden shadow-[0_1px_3px_rgba(21,16,34,0.06)]">
      <div className="aspect-video pastel-canvas relative">
        {webinar.thumbnail_url ? (
          <img src={webinar.thumbnail_url} alt={webinar.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#151022] to-[#5B00B8] flex items-center justify-center">
            <Mic2 className="w-10 h-10 text-[#111827]/30" />
          </div>
        )}
        {webinar.recording_url && (
          <a href={webinar.recording_url} target="_blank" rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center group">
            <div className="w-14 h-14 rounded-full bg-[#8A19FF] shadow-[0_8px_28px_rgba(138,25,255,0.50)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlayCircle className="w-7 h-7 text-[#111827]" />
            </div>
          </a>
        )}
      </div>
      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#98A4B3] mb-1">
          {fmtDate(webinar.scheduled_at)}
        </p>
        <h3 className="font-bold text-[#151022] text-sm leading-snug mb-2 line-clamp-2">
          {webinar.title}
        </h3>
        {webinar.recording_url ? (
          <a href={webinar.recording_url} target="_blank" rel="noopener noreferrer"
            className="text-xs font-semibold text-[#5B00B8] hover:text-[#8A19FF] inline-flex items-center gap-1 transition-colors">
            Watch recording <ChevronRight className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-xs text-[#98A4B3]">Recording coming soon</span>
        )}
      </div>
    </article>
  )
}

// ─── Empty state ──────────────────────────────────────────────
function EmptyUpcoming() {
  return (
    <div className="text-center py-16 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-[#F7F4FF] flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-[#8A19FF]" />
      </div>
      <h3 className="text-base font-bold text-[#151022] mb-1">No upcoming webinars right now</h3>
      <p className="text-sm text-[#98A4B3]">
        Check back soon, or browse our past webinar recordings below.
      </p>
    </div>
  )
}
