// ============================================================
// ChurchFlow Liberia — Free Bible Learning Resources
//
// Tabs:
//   • BibleProject
//   • WVBS Bible Videos
//   • Apps & YouTube
//   • Downloads & Study Guides
//
// Videos play inside an in-app MediaPlayerModal. Non-embeddable
// resources (apps, websites, channels, downloads) open in a new tab.
// ============================================================
import React, { useEffect, useMemo, useState } from 'react'
import {
  Search, Play, ExternalLink, Filter, Loader2, BookOpen,
  Video, GraduationCap, Download, Smartphone, PlaySquare, Baby,
  FileText, Star, AlertCircle, X,
} from 'lucide-react'
import { listMediaResources, isFeatureEnabled, resolveEmbed, listMyWatchHistory, logMediaView } from '../../services/mediaService'
import MediaPlayerModal from '../../components/media/MediaPlayerModal'

const TABS = [
  { key: 'bibleproject', label: 'BibleProject',         provider: 'bibleproject', flag: 'bible_learning_bibleproject' },
  { key: 'wvbs',         label: 'WVBS Bible Videos',    provider: 'wvbs',         flag: 'bible_learning_wvbs' },
  { key: 'apps',         label: 'Apps & YouTube',       providerFilter: (r) => r.category === 'app' || r.category === 'youtube_channel' },
  { key: 'downloads',    label: 'Downloads & Guides',   providerFilter: (r) => r.category === 'download' || r.category === 'study_guide' },
]

const CATEGORY_META = {
  video:           { icon: Video,        label: 'Bible Videos' },
  course:          { icon: GraduationCap,label: 'Bible Courses' },
  study_guide:     { icon: FileText,     label: 'Bible Study Guides' },
  download:        { icon: Download,     label: 'Downloads' },
  app:             { icon: Smartphone,   label: 'Apps' },
  youtube_channel: { icon: PlaySquare,   label: 'YouTube Channels' },
  children:        { icon: Baby,         label: "Children's Bible Lessons" },
}

const PROVIDER_BADGE = {
  bibleproject: 'BibleProject',
  wvbs:         'WVBS',
  youtube:      'YouTube',
  vimeo:        'Vimeo',
  external:     'External',
  churchflow_upload: 'ChurchFlow',
}

function ResourceCard({ resource, onWatch }) {
  const embed = resolveEmbed(resource)
  const canEmbed = embed && resource.resource_type !== 'app' && resource.resource_type !== 'website' && resource.resource_type !== 'channel' && resource.resource_type !== 'download'
  const meta = CATEGORY_META[resource.category] || CATEGORY_META.video
  const Icon = meta.icon
  // Everything opens in the in-app modal now — the modal iframes external URLs
  // when there's no proper video embed.
  const ctaLabel = canEmbed ? 'Watch' : 'Open'

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.18)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-[#151022] to-[#5B00B8] overflow-hidden">
        {resource.thumbnail_url ? (
          <img
            src={resource.thumbnail_url} alt={resource.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-10 h-10 text-white/40" />
          </div>
        )}
        {resource.featured && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-950">
            <Star className="w-3 h-3" /> Featured
          </span>
        )}
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-purple-700">
          {PROVIDER_BADGE[resource.provider] || resource.provider}
        </span>
        <button
          onClick={() => onWatch(resource)}
          aria-label={ctaLabel}
          className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center"
        >
          <span className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-6 h-6 text-purple-700 ml-1" fill="currentColor" />
          </span>
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icon className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
            {meta.label}
          </span>
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1 line-clamp-2">{resource.title}</h3>
        {resource.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-3">
            {resource.description}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center gap-2">
          <button
            onClick={() => onWatch(resource)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white hover:opacity-95 transition-opacity"
          >
            <Play className="w-3.5 h-3.5" /> {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BibleLearning() {
  const [resources, setResources] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState('bibleproject')
  const [category,  setCategory]  = useState('')
  const [search,    setSearch]    = useState('')
  const [active,    setActive]    = useState(null)
  const [moduleEnabled, setModuleEnabled] = useState(true)
  const [enabledMap, setEnabledMap]       = useState({})
  const [history,   setHistory]   = useState([])

  // Refresh recently watched after every modal close (in case they watched)
  async function reloadHistory() {
    setHistory(await listMyWatchHistory(8))
  }

  function handleOpen(resource) {
    setActive(resource)
    logMediaView(resource.id)   // fire and forget
  }
  function handleClose() {
    setActive(null)
    reloadHistory()
  }

  // Load + feature flags
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const moduleOn = await isFeatureEnabled('bible_learning')
      if (cancelled) return
      setModuleEnabled(moduleOn)
      if (!moduleOn) { setLoading(false); return }

      const bp   = await isFeatureEnabled('bible_learning_bibleproject')
      const wv   = await isFeatureEnabled('bible_learning_wvbs')
      const [list, hist] = await Promise.all([
        listMediaResources(),
        listMyWatchHistory(8),
      ])
      if (cancelled) return
      setEnabledMap({ bibleproject: bp, wvbs: wv })
      setResources(list)
      setHistory(hist)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Tab visibility
  const visibleTabs = useMemo(() => TABS.filter((t) => {
    if (t.flag === 'bible_learning_bibleproject' && !enabledMap.bibleproject) return false
    if (t.flag === 'bible_learning_wvbs' && !enabledMap.wvbs) return false
    return true
  }), [enabledMap])

  // Filter by tab + category + search
  const filtered = useMemo(() => {
    const def = TABS.find((t) => t.key === tab)
    if (!def) return []
    let rows = resources
    if (def.provider) {
      rows = rows.filter((r) => r.provider === def.provider)
    } else if (def.providerFilter) {
      rows = rows.filter(def.providerFilter)
    }
    if (category) rows = rows.filter((r) => r.category === category)
    const q = search.trim().toLowerCase()
    if (q) {
      rows = rows.filter((r) =>
        (r.title || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (Array.isArray(r.tags) && r.tags.some((t) => t.toLowerCase().includes(q)))
      )
    }
    return rows
  }, [resources, tab, category, search])

  const availableCategories = useMemo(() => {
    const set = new Set(filtered.map((r) => r.category))
    return Array.from(set).map((c) => ({ value: c, ...(CATEGORY_META[c] || { label: c }) }))
  }, [filtered])

  if (!moduleEnabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-700 mb-2">Bible Learning Resources are unavailable</h1>
          <p className="text-sm text-slate-500">
            The platform administrator has temporarily disabled this section.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Free Bible Learning Resources</h1>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            Trusted free Bible videos, courses, study guides, and apps from BibleProject and WVBS — all watchable inside ChurchFlow.
          </p>
        </div>

        {/* Continue Watching */}
        {history.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">
              Continue Watching
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {history.slice(0, 4).map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleOpen(r)}
                  className="group text-left bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md overflow-hidden transition-shadow"
                >
                  <div className="relative aspect-video bg-gradient-to-br from-[#151022] to-[#5B00B8]">
                    {r.thumbnail_url ? (
                      <img src={r.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : null}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" fill="currentColor" />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2">{r.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{r.provider}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex gap-1 overflow-x-auto">
          {visibleTabs.map((t) => {
            const isActive = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setCategory('') }}
                className={[
                  'flex-1 min-w-[160px] px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white shadow-md shadow-purple-500/25'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
                ].join(' ')}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="search" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search videos, topics, tags…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
              />
            </div>
            {availableCategories.length > 0 && (
              <select
                value={category} onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 min-w-[180px]"
              >
                <option value="">All categories</option>
                {availableCategories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            )}
            {(search || category) && (
              <button
                onClick={() => { setSearch(''); setCategory('') }}
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600 px-3"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <Filter className="inline w-3 h-3 mr-1" />
            {filtered.length} resource{filtered.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
            <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">No resources found.</p>
            <p className="text-xs text-slate-400 mt-1">Try a different tab, category, or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((r) => (
              <ResourceCard key={r.id} resource={r} onWatch={handleOpen} />
            ))}
          </div>
        )}

        {/* Single disclaimer at the bottom */}
        <p className="text-xs text-slate-400 text-center pt-4 flex items-center justify-center gap-1.5">
          <AlertCircle className="w-3 h-3" />
          External resources open outside ChurchFlow.
        </p>
      </div>

      <MediaPlayerModal resource={active} onClose={handleClose} />
    </div>
  )
}
