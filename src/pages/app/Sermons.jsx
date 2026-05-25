// ============================================================
// ChurchFlow Liberia — Sermons & Media Page
// ============================================================
import { useState, useEffect } from 'react'
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
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  ChevronDown,
  Tag,
  BookMarked,
} from 'lucide-react'
import { Button, Badge, Modal, Input } from '../../components/ui'
import { formatDate } from '../../utils/helpers'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'
import SermonBuilderAI from '../../components/ai/SermonBuilderAI'
import BibleLearning from './BibleLearning'
import { useAIFeature } from '../../hooks/useAIFeature'
import toast from 'react-hot-toast'

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
  { key: 'transcription', label: 'Transcription', icon: FileText },
  { key: 'bible_learning', label: 'Bible Learning', icon: BookMarked },
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
          <span>{formatDate(sermon.sermon_date || sermon.date)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 mt-auto">
          <a
            href={sermon.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-[#151022] to-[#5B00B8] px-3 py-2 rounded-xl hover:from-[#5B00B8] hover:to-[#3D108A] transition-all"
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
function AddContentModal({ isOpen, onClose, onSaved, user }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    const { data: newSermon, error } = await insforge.database
      .from('sermons')
      .insert([{
        church_id: user?.churchId || user?.profile?.church_id,
        title: form.title,
        preacher: form.preacher,
        sermon_date: form.date || null,
        type: form.type,
        platform: form.platform,
        url: form.url,
        description: form.description,
        duration: form.duration,
      }])
      .select()
      .single()
    setSaving(false)
    if (error) {
      console.error('[AddContentModal]', error.message)
      toast.error('Failed to save sermon.')
      return
    }
    if (newSermon) onSaved(newSermon)
    setForm(EMPTY_FORM)
    onClose()
  }

  const handleClose = () => {
    setForm(EMPTY_FORM)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Sermon / Media Content"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>Save Content</Button>
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

// ─── Generate Transcript Modal ─────────────────────────────────
function GenerateTranscriptModal({ isOpen, onClose, sermon, onGenerate }) {
  const [mode, setMode] = useState('url')
  const [audioUrl, setAudioUrl] = useState('')
  const [manualText, setManualText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setMode('url')
    setAudioUrl('')
    setManualText('')
    onClose()
  }

  const handleGenerate = async () => {
    if (mode === 'url' && !audioUrl.trim()) {
      toast.error('Please enter an audio URL.')
      return
    }
    if (mode === 'manual' && !manualText.trim()) {
      toast.error('Please paste the sermon text.')
      return
    }

    setLoading(true)
    try {
      await onGenerate(sermon, mode === 'url' ? audioUrl.trim() : null, mode === 'manual' ? manualText.trim() : null)
      handleClose()
    } catch {
      // error handled in parent
    } finally {
      setLoading(false)
    }
  }

  if (!sermon) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate Transcript"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleGenerate} loading={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Sermon</p>
          <p className="text-sm font-bold text-slate-800">{sermon.title}</p>
          <p className="text-xs text-slate-500">{sermon.preacher} — {formatDate(sermon.sermon_date || sermon.date)}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">Transcription source</p>
          <div className="space-y-2.5">
            <label className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-purple-200 hover:bg-purple-50/30" style={{ borderColor: mode === 'url' ? '#8A19FF' : undefined, backgroundColor: mode === 'url' ? '#F5F3FF' : undefined }}>
              <input
                type="radio"
                name="transcribe-mode"
                value="url"
                checked={mode === 'url'}
                onChange={() => setMode('url')}
                className="mt-0.5 accent-violet-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">Transcribe from audio file URL</p>
                <p className="text-xs text-slate-500">Provide a direct link to the audio recording</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-purple-200 hover:bg-purple-50/30" style={{ borderColor: mode === 'manual' ? '#8A19FF' : undefined, backgroundColor: mode === 'manual' ? '#F5F3FF' : undefined }}>
              <input
                type="radio"
                name="transcribe-mode"
                value="manual"
                checked={mode === 'manual'}
                onChange={() => setMode('manual')}
                className="mt-0.5 accent-violet-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">Paste sermon text manually</p>
                <p className="text-xs text-slate-500">Enter the sermon text to summarize and extract key points</p>
              </div>
            </label>
          </div>
        </div>

        {mode === 'url' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Audio File URL</label>
            <Input
              placeholder="https://..."
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1.5">Supported: MP3, WAV, M4A, or any direct audio link</p>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sermon Text</label>
            <textarea
              rows={7}
              placeholder="Paste the full sermon text here..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
            />
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── View Transcript Modal ────────────────────────────────────
function ViewTranscriptModal({ isOpen, onClose, sermon, data }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    copyToClipboard(data?.transcript || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!sermon || !data) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sermon Transcript"
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <p className="text-xs text-slate-400 italic">Transcription powered by AI — ChurchFlow Liberia</p>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-purple-100">
          <h2 className="text-base font-extrabold text-slate-900">{sermon.title}</h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <Mic2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-medium">{sermon.preacher}</span>
            <span className="text-slate-300">·</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(sermon.sermon_date || sermon.date)}</span>
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Summary</h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              {data.summary}
            </p>
          </div>
        )}

        {/* Key Points */}
        {data.keyPoints && data.keyPoints.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Key Points</h3>
            <ol className="space-y-2">
              {data.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Scripture References */}
        {data.scriptureReferences && data.scriptureReferences.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Scripture References</h3>
            <div className="flex flex-wrap gap-2">
              {data.scriptureReferences.map((ref, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  <BookMarked className="w-3 h-3" />
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Keywords */}
        {data.keywords && data.keywords.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                >
                  <Tag className="w-3 h-3" />
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Full Transcript */}
        {data.transcript && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Transcript</h3>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-800 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{data.transcript}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── Transcript Status Badge ──────────────────────────────────
function TranscriptStatusBadge({ status }) {
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" />
        Completed
      </span>
    )
  }
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Processing
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <AlertCircle className="w-3.5 h-3.5" />
        Failed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
      <FileText className="w-3.5 h-3.5" />
      No Transcript
    </span>
  )
}

// ─── Transcription Card ────────────────────────────────────────
function TranscriptionCard({ sermon, transcriptInfo, onGenerate, onView }) {
  const status = transcriptInfo?.status || 'none'

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-5 flex flex-col gap-4 hover:shadow-[0_4px_20px_-3px_rgba(124,58,237,0.1)] transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 leading-snug truncate">{sermon.title}</h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
            <Mic2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span className="font-medium truncate">{sermon.preacher}</span>
            <span className="text-slate-300 flex-shrink-0">·</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="flex-shrink-0">{formatDate(sermon.sermon_date || sermon.date)}</span>
          </div>
        </div>
        <TranscriptStatusBadge status={status} />
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
        {status === 'done' ? (
          <button
            onClick={() => onView(sermon)}
            className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-[#151022] to-[#5B00B8] px-3 py-2 rounded-xl hover:from-[#5B00B8] hover:to-[#3D108A] transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            View Transcript
          </button>
        ) : (
          <button
            onClick={() => onGenerate(sermon)}
            disabled={status === 'processing'}
            className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:hover:bg-purple-50"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                Generate
              </>
            )}
          </button>
        )}
        {status === 'done' && (
          <button
            onClick={() => onGenerate(sermon)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors"
            title="Re-generate transcript"
          >
            Re-generate
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Transcription Tab ─────────────────────────────────────────
function TranscriptionTab({ sermons, transcriptData, setTranscriptData }) {
  const [generateTarget, setGenerateTarget] = useState(null)
  const [viewTarget, setViewTarget] = useState(null)

  const handleOpenGenerate = (sermon) => setGenerateTarget(sermon)
  const handleCloseGenerate = () => setGenerateTarget(null)

  const handleOpenView = (sermon) => setViewTarget(sermon)
  const handleCloseView = () => setViewTarget(null)

  const handleGenerate = async (sermon, audioUrl, manualText) => {
    // Optimistic: set processing
    setTranscriptData((prev) => ({
      ...prev,
      [sermon.id]: { ...(prev[sermon.id] || {}), status: 'processing' },
    }))

    try {
      const { data, error } = await insforge.functions.invoke('transcribe-sermon', {
        body: {
          action: audioUrl ? 'transcribe_url' : 'summarize',
          audioUrl: audioUrl || undefined,
          rawText: manualText || undefined,
          sermonTitle: sermon.title,
          preacher: sermon.preacher,
        },
      })

      if (error) throw error

      setTranscriptData((prev) => ({
        ...prev,
        [sermon.id]: {
          transcript: data?.transcript || data?.text || '',
          summary: data?.summary || '',
          keyPoints: data?.keyPoints || data?.key_points || [],
          scriptureReferences: data?.scriptureReferences || data?.scripture_references || [],
          keywords: data?.keywords || [],
          status: 'done',
        },
      }))

      toast.success('Transcript generated successfully.')
    } catch (err) {
      console.error('Transcription error:', err)
      setTranscriptData((prev) => ({
        ...prev,
        [sermon.id]: { ...(prev[sermon.id] || {}), status: 'failed' },
      }))
      toast.error('Failed to generate transcript. Please try again.')
      throw err
    }
  }

  return (
    <div className="space-y-5">
      {/* Info strip */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-purple-100">
        <FileText className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-purple-900">AI-Powered Sermon Transcription</p>
          <p className="text-xs text-purple-600 mt-0.5">
            Generate transcripts from audio recordings or pasted text. Each transcript includes a summary, key points, scripture references, and keywords.
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>
          <span className="font-semibold text-slate-700">
            {Object.values(transcriptData).filter((t) => t.status === 'done').length}
          </span>{' '}
          completed
        </span>
        <span className="text-slate-300">|</span>
        <span>
          <span className="font-semibold text-slate-700">{sermons.length}</span> total sermons
        </span>
      </div>

      {/* Grid or empty state */}
      {sermons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-purple-300" />
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-1">No sermons yet</h3>
          <p className="text-sm text-slate-400">Add your first sermon or live stream to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sermons.map((sermon) => (
            <TranscriptionCard
              key={sermon.id}
              sermon={sermon}
              transcriptInfo={transcriptData[sermon.id]}
              onGenerate={handleOpenGenerate}
              onView={handleOpenView}
            />
          ))}
        </div>
      )}

      {/* Generate Modal */}
      <GenerateTranscriptModal
        isOpen={!!generateTarget}
        onClose={handleCloseGenerate}
        sermon={generateTarget}
        onGenerate={handleGenerate}
      />

      {/* View Modal */}
      <ViewTranscriptModal
        isOpen={!!viewTarget}
        onClose={handleCloseView}
        sermon={viewTarget}
        data={viewTarget ? transcriptData[viewTarget.id] : null}
      />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function Sermons() {
  const { user } = useAuth()
  const { enabled: sermonAiEnabled } = useAIFeature('sermon_ai')
  const role = user?.profile?.role || user?.role || 'member'
  const canUseSermonAI = sermonAiEnabled && ['pastor', 'church_admin', 'super_admin'].includes(role)
  const [sermons, setSermons] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Transcript state — keyed by sermon id
  const [transcriptData, setTranscriptData] = useState({})

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await insforge.database
        .from('sermons')
        .select('*')
        .order('sermon_date', { ascending: false })
      if (error) console.error('[Sermons]', error.message)
      setSermons(data || [])
      setLoading(false)
    }
    load()
  }, [])

  // Check for live sermons (type === 'live')
  const liveSermons = sermons.filter((s) => s.type === 'live')
  const hasLive = liveSermons.length > 0

  // Filter logic (not applied to transcription tab)
  const filtered = sermons.filter((s) => {
    const sermonDate = s.sermon_date || s.date || ''
    if (activeTab !== 'all' && s.type !== activeTab) return false
    if (platformFilter !== 'all' && s.platform !== platformFilter) return false
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !(s.preacher || '').toLowerCase().includes(search.toLowerCase())) return false
    if (dateFrom && sermonDate < dateFrom) return false
    if (dateTo && sermonDate > dateTo) return false
    return true
  })

  const isTranscriptionTab   = activeTab === 'transcription'
  const isBibleLearningTab   = activeTab === 'bible_learning'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Sermon Companion AI — pastors and admins only */}
        {canUseSermonAI && (
          <SermonBuilderAI />
        )}

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
            <p className="text-sm text-slate-500 mt-1">{sermons.length} messages archived</p>
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
                  ? 'bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {/* Transcription Tab Content */}
        {!loading && isTranscriptionTab && (
          <TranscriptionTab
            sermons={sermons}
            transcriptData={transcriptData}
            setTranscriptData={setTranscriptData}
          />
        )}

        {/* Bible Learning Tab — embeds the standalone page */}
        {!loading && isBibleLearningTab && (
          <div className="-mx-4 sm:-mx-6 lg:-mx-8">
            <BibleLearning />
          </div>
        )}

        {!loading && !isTranscriptionTab && !isBibleLearningTab && (
          <>
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
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of {sermons.length} messages
            </p>

            {/* Sermon Grid or Empty State */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((sermon) => (
                  <SermonCard key={sermon.id} sermon={sermon} />
                ))}
              </div>
            ) : sermons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-purple-300" />
                </div>
                <h3 className="text-base font-bold text-slate-700 mb-1">No sermons yet</h3>
                <p className="text-sm text-slate-400">Add your first sermon or live stream to get started.</p>
                <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)} className="mt-4">
                  Add Content
                </Button>
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
          </>
        )}
      </div>

      <AddContentModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={(newSermon) => setSermons((prev) => [newSermon, ...prev])}
        user={user}
      />
    </div>
  )
}
