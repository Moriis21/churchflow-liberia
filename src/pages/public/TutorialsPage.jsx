// ============================================================
// ChurchFlow Liberia, Tutorials (/tutorials)
// Public-facing video tutorial gallery managed by Super Admin.
// ============================================================
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PlayCircle, Search, Clock, BookOpen, ChevronRight, X, Video,
} from 'lucide-react'
import PublicLayout from './PublicLayout'
import { insforge } from '../../lib/insforge'

const CATEGORY_OPTIONS = [
  { value: 'all',           label: 'All' },
  { value: 'general',       label: 'Getting Started' },
  { value: 'members',       label: 'Members' },
  { value: 'attendance',    label: 'Attendance' },
  { value: 'finance',       label: 'Finance' },
  { value: 'events',        label: 'Events' },
  { value: 'sermons',       label: 'Sermons' },
  { value: 'admin',         label: 'Administration' },
]

const LEVEL_STYLES = {
  beginner:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  advanced:     'bg-rose-50 text-rose-700 border-rose-200',
}

// Convert a YouTube / Vimeo URL → embed URL
function toEmbedUrl(url = '') {
  if (!url) return ''
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^?&]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`
  return url
}

function ytThumbnail(url = '') {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^?&]+)/)
  return yt ? `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg` : ''
}

export default function TutorialsPage() {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]   = useState('')
  const [cat, setCat]       = useState('all')
  const [playing, setPlaying] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await insforge.database
          .from('tutorials')
          .select('*')
          .eq('status', 'published')
          .order('display_order', { ascending: true })
        if (!cancelled) {
          if (error) console.warn('[Tutorials] load error:', error)
          setItems(data || [])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    return items.filter(t => {
      if (cat !== 'all' && t.category !== cat) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        return (t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
      }
      return true
    })
  }, [items, cat, query])

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#151022] to-[#5B00B8] py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/60 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-5 border border-white/70">
            Tutorials
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111827] leading-tight mb-4">
            Learn ChurchFlow at your own pace
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Short, focused video tutorials covering every feature, from your first member to advanced reports.
          </p>
        </div>
      </section>

      {/* Search + Categories */}
      <section className="bg-[#F7F8FA] py-8 px-4 border-b border-[#E4E7EC]">
        <div className="max-w-5xl mx-auto">
          <div className="relative mb-5 max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A4B3]" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search tutorials…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#D0D5DD] bg-white text-sm placeholder:text-[#98A4B3] focus:outline-none focus:border-[#8A19FF] focus:ring-2 focus:ring-[#8A19FF]/20"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 justify-start sm:justify-center">
            {CATEGORY_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setCat(opt.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  cat === opt.value
                    ? 'bg-[#8A19FF] text-white shadow-[0_2px_8px_rgba(138,25,255,0.30)]'
                    : 'bg-white text-[#475467] border border-[#E4E7EC] hover:border-[#8A19FF] hover:text-[#5B00B8]'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-[#8A19FF] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#F7F4FF] flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-[#8A19FF]" />
              </div>
              <h3 className="text-base font-bold text-[#151022] mb-1">No tutorials yet</h3>
              <p className="text-sm text-[#98A4B3]">
                {query || cat !== 'all'
                  ? 'Nothing matches your search. Try a different keyword or category.'
                  : 'Check back soon, new tutorials are added regularly.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(t => (
                <TutorialCard key={t.id} tutorial={t} onPlay={() => setPlaying(t)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Help-center CTA */}
      <section className="bg-[#F7F8FA] py-14 px-4 border-t border-[#E4E7EC]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-extrabold text-[#151022] mb-2">Prefer to read?</h2>
          <p className="text-sm text-[#475467] mb-6">
            Our written guides cover every feature step-by-step.
          </p>
          <Link to="/docs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8A19FF] text-white text-sm font-semibold shadow-[0_4px_14px_rgba(138,25,255,0.30)] hover:bg-[#5B00B8] transition-colors">
            <BookOpen className="w-4 h-4" /> Read the documentation
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Video lightbox */}
      {playing && (
        <div
          className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPlaying(null)}
        >
          <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPlaying(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={toEmbedUrl(playing.video_url)}
                title={playing.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="text-white mt-4">
              <h3 className="font-bold text-lg">{playing.title}</h3>
              {playing.description && (
                <p className="text-sm text-white/70 mt-1">{playing.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  )
}

// ─── Card ─────────────────────────────────────────────────────
function TutorialCard({ tutorial, onPlay }) {
  const thumb = tutorial.thumbnail_url || ytThumbnail(tutorial.video_url)
  const levelStyle = LEVEL_STYLES[tutorial.level] || LEVEL_STYLES.beginner

  return (
    <button onClick={onPlay}
      className="group bg-white rounded-[20px] border border-[#E4E7EC] overflow-hidden text-left transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_-4px_rgba(21,16,34,0.10)]">
      <div className="relative aspect-video bg-[#F7F8FA] overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={tutorial.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-12 h-12 text-[#D0D5DD]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="w-14 h-14 rounded-full bg-[#8A19FF] shadow-[0_8px_28px_rgba(138,25,255,0.50)] flex items-center justify-center">
            <PlayCircle className="w-7 h-7 text-white" />
          </div>
        </div>
        {tutorial.duration_min > 0 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-semibold">
            <Clock className="w-3 h-3" /> {tutorial.duration_min} min
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${levelStyle}`}>
            {tutorial.level || 'beginner'}
          </span>
          {tutorial.category && tutorial.category !== 'general' && (
            <span className="text-[10px] font-semibold text-[#98A4B3] uppercase tracking-wide">
              {tutorial.category}
            </span>
          )}
        </div>
        <h3 className="font-bold text-[#151022] text-base mb-1 leading-snug group-hover:text-[#5B00B8] transition-colors line-clamp-2">
          {tutorial.title}
        </h3>
        {tutorial.description && (
          <p className="text-xs text-[#475467] leading-relaxed line-clamp-2">{tutorial.description}</p>
        )}
      </div>
    </button>
  )
}
