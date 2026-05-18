// ============================================================
// ChurchFlow Liberia — Sermons & Media Page
// ============================================================
import { useState } from 'react'
import {
  Play,
  Plus,
  Share2,
  ExternalLink,
  PlayCircle,
  Radio,
  Video,
  Headphones,
  BookOpen,
  Filter,
  Search,
  X,
  Clock,
  Calendar,
  Mic2,
} from 'lucide-react'
import { Button, Badge, Modal, Input } from '../../components/ui'
import { SERMONS } from '../../data/dummyData'
import { formatDate } from '../../utils/helpers'

// ─── Platform config ──────────────────────────────────────────
const PLATFORM_CONFIG = {
  youtube: {
    label: 'YouTube',
    color: 'bg-red-50 text-red-700 border border-red-200',
    icon: PlayCircle,
    gradient: 'from-red-500 to-rose-600',
  },
  facebook: {
    label: 'Facebook',
    color: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: Radio,
    gradient: 'from-blue-500 to-indigo-600',
  },
  zoom: {
    label: 'Zoom',
    color: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    icon: Video,
    gradient: 'from-indigo-500 to-violet-600',
  },
}

const TYPE_TABS = [
  { key: 'all', label: 'All Sermons', icon: BookOpen },
  { key: 'live', label: 'Live Streams', icon: Radio },
  { key: 'audio', label: 'Audio', icon: Headphones },
  { key: 'devotional', label: 'Devotionals', icon: Mic2 },
]

// Empty add-content form
const EMPTY_FORM = {
  title: '',
  preacher: '',
  date: '',
  type: 'video',
  platform: 'youtube',
  url: '',
  description: '',
  duration: '',
}

// ─── Custom Tooltip (share) ───────────────────────────────────
function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).catch(() => {})
}

// ─── Sermon Card ──────────────────────────────────────────────
function SermonCard({ sermon }) {
  const platform = PLATFORM_CONFIG[sermon.platform] || PLATFORM_CONFIG.youtube
  const PlatformIcon = platform.icon
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    copyToClipboard(sermon.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.12)] transition-all duration-300 flex flex-col">
      {/* Thumbnail area */}
      <div className={`relative h-40 bg-gradient-to-br ${platform.gradient} flex items-center justify-center flex-shrink-0`}>
        {/* Platform badge */}
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${platform.color}`}>
          <PlatformIcon className="w-3.5 h-3.5" />
          {platform.label}
        </span>

        {/* Type badge */}
        <span className="absolute top-3 right-3 inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-slate-700 capitalize">
          {sermon.type}
        </span>

        {/* Play button */}
        <a
          href={sermon.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        >
          <Play className="w-6 h-6 text-slate-800 ml-0.5" fill="currentColor" />
        </a>

        {/* Duration */}
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 text-[11px] font-semibold text-white/90 bg-black/30 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" />
          {sermon.duration}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{sermon.title}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{sermon.description}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Mic2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span className="truncate font-medium">{sermon.preacher}</span>
          <span className="mx-1 text-slate-300">·</span>
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{formatDate(sermon.date)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 mt-auto">
          <a
            href={sermon.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 px-3 py-2 rounded-xl hover:from-violet-700 hover:to-purple-800 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Watch Now
          </a>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Content Modal ─────────────────────────────────────────
function AddContentModal({ isOpen, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Sermon / Media Content"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose}>Save Content</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title *</label>
          <Input placeholder="Sermon title..." value={form.title} onChange={set('title')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Preacher</label>
            <Input placeholder="Preacher name..." value={form.preacher} onChange={set('preacher')} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date *</label>
            <Input type="date" value={form.date} onChange={set('date')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={set('type')}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
            >
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="live">Live Stream</option>
              <option value="devotional">Devotional</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Platform</label>
            <select
              value={form.platform}
              onChange={set('platform')}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
            >
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
              <option value="zoom">Zoom</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">URL *</label>
          <Input placeholder="https://..." value={form.url} onChange={set('url')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Duration</label>
            <Input placeholder="e.g. 45 min" value={form.duration} onChange={set('duration')} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
          <textarea
            rows={3}
            placeholder="Brief description of the message..."
            value={form.description}
            onChange={set('description')}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
          />
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function Sermons() {
  const [activeTab, setActiveTab] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Check for live sermons (type === 'live')
  const liveSermons = SERMONS.filter((s) => s.type === 'live')
  const hasLive = liveSermons.length > 0

  // Filter logic
  const filtered = SERMONS.filter((s) => {
    if (activeTab !== 'all' && s.type !== activeTab) return false
    if (platformFilter !== 'all' && s.platform !== platformFilter) return false
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.preacher.toLowerCase().includes(search.toLowerCase())) return false
    if (dateFrom && s.date < dateFrom) return false
    if (dateTo && s.date > dateTo) return false
    return true
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Live Now Banner */}
        {hasLive && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-4 shadow-xl shadow-amber-400/25">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
            <div className="relative flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-amber-950">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                LIVE NOW:
              </span>
              <span className="text-sm font-semibold text-amber-900">
                {liveSermons[0].title} — {liveSermons[0].preacher}
              </span>
              <a
                href={liveSermons[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold bg-amber-950 text-amber-100 px-3 py-1.5 rounded-xl hover:bg-amber-800 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Join Stream
              </a>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Sermons & Media</h1>
            <p className="text-sm text-slate-500 mt-1">{SERMONS.length} messages archived</p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)}>
            Add Content
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit overflow-x-auto">
          {TYPE_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === key
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search sermons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white"
            />
          </div>

          {/* Platform filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white"
          >
            <option value="all">All Platforms</option>
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
            <option value="zoom">Zoom</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
              showFilters
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            Date Filter
          </button>

          {(search || platformFilter !== 'all' || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearch(''); setPlatformFilter('all'); setDateFrom(''); setDateTo('') }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-2 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Date Range Filter Panel */}
        {showFilters && (
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-purple-400 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-purple-400 outline-none"
              />
            </div>
          </div>
        )}

        {/* Results count */}
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of {SERMONS.length} messages
        </p>

        {/* Sermon Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-purple-300" />
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">No messages found</h3>
            <p className="text-sm text-slate-400">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <AddContentModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
