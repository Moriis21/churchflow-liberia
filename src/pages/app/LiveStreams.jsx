// ============================================================
// ChurchFlow Liberia — Live Streams Page
// Full CRUD for church live streams (YouTube, Facebook, Zoom)
// ============================================================
import { useState, useEffect } from 'react'
import {
  Radio, Plus, Pencil, Trash2, ExternalLink, Calendar,
  Clock, X, Save, PlayCircle, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { Button, Modal, Input, Badge } from '../../components/ui'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import { createAuditLog, buildActor, AUDIT_ACTIONS } from '../../services/auditLog'
import toast from 'react-hot-toast'

const PLATFORMS = [
  { key: 'youtube',  label: 'YouTube Live',  color: 'bg-red-100 text-red-700',     icon: '▶️' },
  { key: 'facebook', label: 'Facebook Live', color: 'bg-blue-100 text-blue-700',   icon: '📘' },
  { key: 'zoom',     label: 'Zoom',          color: 'bg-indigo-100 text-indigo-700', icon: '📹' },
  { key: 'other',    label: 'Other',         color: 'bg-slate-100 text-slate-700', icon: '🌐' },
]

const STATUS_MAP = {
  scheduled: { label: 'Scheduled', color: 'bg-amber-100 text-amber-700' },
  live:      { label: '🔴 Live Now', color: 'bg-red-100 text-red-700' },
  ended:     { label: 'Ended',     color: 'bg-slate-100 text-slate-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-400' },
}

const EMPTY = {
  title: '', description: '', platform: 'youtube',
  stream_url: '', thumbnail_url: '',
  start_time: '', end_time: '', status: 'scheduled',
}

function extractEmbedUrl(url, platform) {
  if (!url) return null
  if (platform === 'youtube') {
    const m = url.match(/(?:youtu\.be\/|v=|live\/)([A-Za-z0-9_-]{11})/)
    return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=0` : null
  }
  if (platform === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&width=640&autoplay=false`
  }
  return null
}

function StreamCard({ stream, onEdit, onDelete }) {
  const [showEmbed, setShowEmbed] = useState(false)
  const p = PLATFORMS.find(x => x.key === stream.platform) || PLATFORMS[3]
  const s = STATUS_MAP[stream.status] || STATUS_MAP.scheduled
  const embedUrl = extractEmbedUrl(stream.stream_url, stream.platform)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Thumbnail or gradient */}
      <div className="h-36 relative overflow-hidden bg-gradient-to-br from-[#151022] to-purple-700 flex items-center justify-center">
        {stream.thumbnail_url ? (
          <img src={stream.thumbnail_url} alt={stream.title}
            className="w-full h-full object-cover" />
        ) : (
          <Radio className="w-12 h-12 text-white/40" />
        )}
        {stream.status === 'live' && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
            ● LIVE
          </span>
        )}
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${p.color}`}>
          {p.icon} {p.label}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-slate-800 leading-snug">{stream.title}</h3>
          {stream.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{stream.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${s.color}`}>
            {s.label}
          </span>
          {stream.start_time && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="w-3 h-3" />
              {new Date(stream.start_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
          {embedUrl && (
            <button onClick={() => setShowEmbed(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
              <PlayCircle className="w-3.5 h-3.5" />
              {showEmbed ? 'Hide' : 'Preview'}
            </button>
          )}
          <a href={stream.stream_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Open
          </a>
          <button onClick={() => onEdit(stream)}
            className="ml-auto p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(stream)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Embed preview */}
        {showEmbed && embedUrl && (
          <div className="rounded-xl overflow-hidden border border-slate-100">
            <iframe src={embedUrl} width="100%" height="200" frameBorder="0"
              allow="autoplay; encrypted-media" allowFullScreen title={stream.title} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function LiveStreams() {
  const { user } = useAuth()
  const { church, currentBranch } = useChurch()
  const [streams, setStreams]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { loadStreams() }, [church?.id])

  async function loadStreams() {
    if (!church?.id) { setLoading(false); return }
    setLoading(true)
    try {
      const { data, error } = await insforge.database
        .from('live_streams')
        .select('*')
        .eq('church_id', church.id)
        .order('start_time', { ascending: false })
      if (error) throw error
      setStreams(data || [])
    } catch (err) {
      toast.error('Failed to load streams: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setForm(EMPTY)
    setEditing(null)
    setShowModal(true)
  }

  function openEdit(stream) {
    setForm({
      title:         stream.title || '',
      description:   stream.description || '',
      platform:      stream.platform || 'youtube',
      stream_url:    stream.stream_url || '',
      thumbnail_url: stream.thumbnail_url || '',
      start_time:    stream.start_time ? stream.start_time.slice(0, 16) : '',
      end_time:      stream.end_time   ? stream.end_time.slice(0, 16) : '',
      status:        stream.status || 'scheduled',
    })
    setEditing(stream)
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.title.trim())     { toast.error('Title is required.'); return }
    if (!form.stream_url.trim()) { toast.error('Stream URL is required.'); return }
    if (!church?.id)             { toast.error('Church not configured.'); return }

    setSaving(true)
    try {
      if (editing) {
        // Update existing
        const { error } = await insforge.database
          .from('live_streams')
          .update({
            title:         form.title.trim(),
            description:   form.description.trim() || null,
            platform:      form.platform,
            stream_url:    form.stream_url.trim(),
            thumbnail_url: form.thumbnail_url.trim() || null,
            start_time:    form.start_time || null,
            end_time:      form.end_time   || null,
            status:        form.status,
            updated_at:    new Date().toISOString(),
          })
          .eq('id', editing.id)
        if (error) throw error
        toast.success('Live stream updated.')
      } else {
        // Create new via SECURITY DEFINER RPC
        const { error } = await insforge.database
          .rpc('insert_live_stream', {
            p_church_id:     church.id,
            p_branch_id:     currentBranch?.id || null,
            p_title:         form.title.trim(),
            p_description:   form.description.trim() || null,
            p_platform:      form.platform,
            p_stream_url:    form.stream_url.trim(),
            p_thumbnail_url: form.thumbnail_url.trim() || null,
            p_start_time:    form.start_time || null,
            p_end_time:      form.end_time   || null,
            p_status:        form.status,
            p_created_by:    user?.id || null,
          })
        if (error) throw error

        await createAuditLog({
          action:     AUDIT_ACTIONS.CHURCH_UPDATED,
          actor:      buildActor(user, church),
          entityType: 'live_stream',
          description: `Live stream created: ${form.title}`,
        })
        toast.success('Live stream created.')
      }

      setShowModal(false)
      await loadStreams()
    } catch (err) {
      toast.error(err.message || 'Failed to save live stream.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(stream) {
    try {
      const { error } = await insforge.database
        .from('live_streams').delete().eq('id', stream.id)
      if (error) throw error
      setDeleteTarget(null)
      await loadStreams()
      toast.success('Live stream deleted.')
    } catch (err) {
      toast.error(err.message || 'Failed to delete.')
    }
  }

  const tabs = [
    { key: 'all',       label: 'All' },
    { key: 'live',      label: '🔴 Live Now' },
    { key: 'scheduled', label: 'Upcoming' },
    { key: 'ended',     label: 'Past' },
  ]

  const filtered = activeTab === 'all' ? streams : streams.filter(s => s.status === activeTab)

  if (!church) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Radio className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-slate-500">Church not configured.</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Live Streams</h1>
          <p className="text-sm text-slate-500 mt-1">
            Schedule and manage church live streams on YouTube, Facebook, and Zoom.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openCreate}>Add Live Stream</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 self-start">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.key
                ? 'bg-white text-[#151022] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t.label}
            {t.key !== 'all' && (
              <span className="ml-1.5 text-xs opacity-60">
                ({streams.filter(s => s.status === t.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center">
          <Radio className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-base font-bold text-slate-600 mb-1">
            {activeTab === 'all' ? 'No live streams yet' : `No ${activeTab} streams`}
          </p>
          <p className="text-sm text-slate-400 mb-5">
            {activeTab === 'all' ? 'Add your first live stream to get started.' : 'Nothing to show in this category.'}
          </p>
          {activeTab === 'all' && (
            <Button variant="primary" icon={Plus} onClick={openCreate}>Add Live Stream</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(s => (
            <StreamCard key={s.id} stream={s} onEdit={openEdit}
              onDelete={t => setDeleteTarget(t)} />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editing ? 'Edit Live Stream' : 'Add Live Stream'} size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleSave} icon={Save}>
              {editing ? 'Save Changes' : 'Create Stream'}
            </Button>
          </div>
        }>
        <div className="space-y-4">
          <Input label="Title *" value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Sunday Service — May 19, 2026" />

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Platform *</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button key={p.key} type="button"
                  onClick={() => setForm(prev => ({ ...prev, platform: p.key }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    form.platform === p.key
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          <Input label="Stream URL *" value={form.stream_url}
            onChange={e => setForm(p => ({ ...p, stream_url: e.target.value }))}
            placeholder="https://youtube.com/live/..." />

          <Input label="Thumbnail URL (optional)" value={form.thumbnail_url}
            onChange={e => setForm(p => ({ ...p, thumbnail_url: e.target.value }))}
            placeholder="https://..." />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Time</label>
              <input type="datetime-local" value={form.start_time}
                onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Time</label>
              <input type="datetime-local" value={form.end_time}
                onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
            <select value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description (optional)</label>
            <textarea value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Brief description of this stream..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        title="Delete Live Stream" size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => handleDelete(deleteTarget)}>Delete</Button>
          </div>
        }>
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
