// ============================================================
// ChurchFlow Liberia — Super Admin: Tutorials & Webinars Manager
//
// Two embedded CRUD panels for /tutorials and /webinars content.
// Tables are tutorials + webinars (RLS allows authenticated all-access).
// ============================================================
import React, { useEffect, useState } from 'react'
import {
  Plus, Pencil, Trash2, Save, X, ExternalLink, Eye, EyeOff,
  Video, Mic2, Loader2, Search,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { insforge } from '../../lib/insforge'

const CATEGORY_OPTIONS = [
  'general', 'members', 'attendance', 'finance', 'events', 'sermons', 'admin',
]
const LEVEL_OPTIONS  = ['beginner', 'intermediate', 'advanced']
const TUT_STATUS     = ['published', 'draft']
const WEB_STATUS     = ['upcoming', 'live', 'past', 'cancelled']

// ════════════════════════════════════════════════════════════════
// TUTORIALS MANAGER
// ════════════════════════════════════════════════════════════════
export function TutorialsManager() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // null | {} (new) | row (edit)
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, error } = await insforge.database
      .from('tutorials')
      .select('*')
      .order('display_order', { ascending: true })
    if (error) toast.error(error.message)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async (row) => {
    const payload = {
      title:         row.title?.trim() || '',
      description:   row.description?.trim() || '',
      video_url:     row.video_url?.trim() || '',
      thumbnail_url: row.thumbnail_url?.trim() || '',
      duration_min:  Number(row.duration_min) || 0,
      category:      row.category || 'general',
      level:         row.level || 'beginner',
      status:        row.status || 'published',
      display_order: Number(row.display_order) || 0,
    }
    if (!payload.title || !payload.video_url) {
      toast.error('Title and video URL are required'); return
    }

    if (row.id) {
      const { error } = await insforge.database.from('tutorials').update(payload).eq('id', row.id)
      if (error) return toast.error(error.message)
      toast.success('Tutorial updated')
    } else {
      const { error } = await insforge.database.from('tutorials').insert(payload)
      if (error) return toast.error(error.message)
      toast.success('Tutorial added')
    }
    setEditing(null)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Delete this tutorial permanently?')) return
    const { error } = await insforge.database.from('tutorials').delete().eq('id', id)
    if (error) return toast.error(error.message)
    toast.success('Tutorial deleted')
    load()
  }

  const togglePublish = async (row) => {
    const next = row.status === 'published' ? 'draft' : 'published'
    const { error } = await insforge.database.from('tutorials').update({ status: next }).eq('id', row.id)
    if (error) return toast.error(error.message)
    toast.success(next === 'published' ? 'Published' : 'Unpublished')
    load()
  }

  const filtered = items.filter(t =>
    !query.trim() || t.title?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <Header
        icon={Video}
        title="Tutorials"
        subtitle="Manage the videos shown at /tutorials"
        count={items.length}
        query={query} setQuery={setQuery}
        onAdd={() => setEditing({})}
      />

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <Empty icon={Video} title="No tutorials yet"
          hint="Click 'Add tutorial' to create your first." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map(row => (
            <TutorialRow key={row.id} row={row}
              onEdit={() => setEditing(row)}
              onDelete={() => remove(row.id)}
              onToggle={() => togglePublish(row)} />
          ))}
        </div>
      )}

      {editing && <TutorialDialog row={editing} onCancel={() => setEditing(null)} onSave={save} />}
    </div>
  )
}

function TutorialRow({ row, onEdit, onDelete, onToggle }) {
  const isPublished = row.status === 'published'
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E4E7EC]">
      <div className="w-14 h-14 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC] flex items-center justify-center flex-shrink-0 overflow-hidden">
        {row.thumbnail_url
          ? <img src={row.thumbnail_url} className="w-full h-full object-cover" onError={e => e.currentTarget.style.display='none'} />
          : <Video className="w-6 h-6 text-[#98A4B3]" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#151022] truncate">{row.title}</p>
        <p className="text-xs text-[#98A4B3] truncate">
          <span className="capitalize">{row.level}</span> · {row.category} · {row.duration_min || 0} min
        </p>
      </div>
      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
        isPublished
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-slate-50 text-slate-500 border-slate-200'
      }`}>
        {row.status}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={onToggle}
          title={isPublished ? 'Unpublish' : 'Publish'}
          className="w-8 h-8 rounded-lg text-[#98A4B3] hover:text-[#5B00B8] hover:bg-[#F7F4FF] flex items-center justify-center transition-colors">
          {isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button onClick={onEdit}
          className="w-8 h-8 rounded-lg text-[#98A4B3] hover:text-[#5B00B8] hover:bg-[#F7F4FF] flex items-center justify-center transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={onDelete}
          className="w-8 h-8 rounded-lg text-[#98A4B3] hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function TutorialDialog({ row, onCancel, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', video_url: '', thumbnail_url: '',
    duration_min: 0, category: 'general', level: 'beginner',
    status: 'published', display_order: 0,
    ...row,
  })
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <Dialog title={row.id ? 'Edit tutorial' : 'Add tutorial'} onClose={onCancel}>
      <div className="space-y-4">
        <Field label="Title *"><input value={form.title} onChange={set('title')} className={inputCls} placeholder="e.g. How to add your first member" /></Field>
        <Field label="Video URL *" hint="YouTube or Vimeo">
          <input value={form.video_url} onChange={set('video_url')} className={inputCls} placeholder="https://youtube.com/watch?v=..." />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={set('description')} rows={2} className={inputCls + ' resize-none'} placeholder="One or two sentences describing what they'll learn" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select value={form.category} onChange={set('category')} className={inputCls}>
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </Field>
          <Field label="Level">
            <select value={form.level} onChange={set('level')} className={inputCls}>
              {LEVEL_OPTIONS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Duration (min)">
            <input type="number" min={0} value={form.duration_min} onChange={set('duration_min')} className={inputCls} />
          </Field>
          <Field label="Sort order">
            <input type="number" value={form.display_order} onChange={set('display_order')} className={inputCls} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={set('status')} className={inputCls}>
              {TUT_STATUS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Custom thumbnail URL" hint="(optional — YouTube thumb auto-used)">
          <input value={form.thumbnail_url} onChange={set('thumbnail_url')} className={inputCls} placeholder="https://…/image.jpg" />
        </Field>
      </div>
      <DialogFooter onCancel={onCancel} onSave={() => onSave(form)} />
    </Dialog>
  )
}

// ════════════════════════════════════════════════════════════════
// WEBINARS MANAGER
// ════════════════════════════════════════════════════════════════
export function WebinarsManager() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, error } = await insforge.database
      .from('webinars')
      .select('*')
      .order('scheduled_at', { ascending: false })
    if (error) toast.error(error.message)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async (row) => {
    const payload = {
      title:            row.title?.trim() || '',
      description:      row.description?.trim() || '',
      host:             row.host?.trim() || '',
      scheduled_at:     row.scheduled_at ? new Date(row.scheduled_at).toISOString() : null,
      duration_min:     Number(row.duration_min) || 60,
      registration_url: row.registration_url?.trim() || '',
      recording_url:    row.recording_url?.trim() || '',
      thumbnail_url:    row.thumbnail_url?.trim() || '',
      status:           row.status || 'upcoming',
    }
    if (!payload.title || !payload.scheduled_at) {
      toast.error('Title and scheduled date are required'); return
    }

    if (row.id) {
      const { error } = await insforge.database.from('webinars').update(payload).eq('id', row.id)
      if (error) return toast.error(error.message)
      toast.success('Webinar updated')
    } else {
      const { error } = await insforge.database.from('webinars').insert(payload)
      if (error) return toast.error(error.message)
      toast.success('Webinar added')
    }
    setEditing(null)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Delete this webinar permanently?')) return
    const { error } = await insforge.database.from('webinars').delete().eq('id', id)
    if (error) return toast.error(error.message)
    toast.success('Webinar deleted')
    load()
  }

  const filtered = items.filter(t =>
    !query.trim() || t.title?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <Header
        icon={Mic2}
        title="Webinars"
        subtitle="Manage the live sessions shown at /webinars"
        count={items.length}
        query={query} setQuery={setQuery}
        onAdd={() => setEditing({})}
      />

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <Empty icon={Mic2} title="No webinars yet"
          hint="Click 'Add webinar' to schedule the first one." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map(row => (
            <WebinarRow key={row.id} row={row}
              onEdit={() => setEditing(row)}
              onDelete={() => remove(row.id)} />
          ))}
        </div>
      )}

      {editing && <WebinarDialog row={editing} onCancel={() => setEditing(null)} onSave={save} />}
    </div>
  )
}

function WebinarRow({ row, onEdit, onDelete }) {
  const date = new Date(row.scheduled_at)
  const isPast = date.getTime() < Date.now()
  const statusColor = ({
    upcoming:  'bg-amber-50 text-amber-700 border-amber-200',
    live:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    past:      'bg-slate-50 text-slate-500 border-slate-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
  })[row.status] || 'bg-slate-50 text-slate-500 border-slate-200'

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E4E7EC]">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#151022] to-[#5B00B8] text-white flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-wider">
          {date.toLocaleDateString('en-US', { month: 'short' })}
        </span>
        <span className="text-lg font-extrabold leading-none">{date.getDate()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#151022] truncate">{row.title}</p>
        <p className="text-xs text-[#98A4B3] truncate">
          {date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          {row.host ? ` · ${row.host}` : ''}
        </p>
      </div>
      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${statusColor}`}>
        {row.status}
      </span>
      <div className="flex items-center gap-1">
        {row.registration_url && (
          <a href={row.registration_url} target="_blank" rel="noopener noreferrer"
            title="Registration link"
            className="w-8 h-8 rounded-lg text-[#98A4B3] hover:text-[#5B00B8] hover:bg-[#F7F4FF] flex items-center justify-center transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <button onClick={onEdit}
          className="w-8 h-8 rounded-lg text-[#98A4B3] hover:text-[#5B00B8] hover:bg-[#F7F4FF] flex items-center justify-center transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={onDelete}
          className="w-8 h-8 rounded-lg text-[#98A4B3] hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function WebinarDialog({ row, onCancel, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', host: '',
    scheduled_at: row.scheduled_at
      ? new Date(row.scheduled_at).toISOString().slice(0, 16)
      : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    duration_min: 60,
    registration_url: '', recording_url: '', thumbnail_url: '',
    status: 'upcoming',
    ...row,
    // Re-normalize scheduled_at for the datetime-local input format
    ...(row.scheduled_at ? { scheduled_at: new Date(row.scheduled_at).toISOString().slice(0, 16) } : {}),
  })
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <Dialog title={row.id ? 'Edit webinar' : 'Add webinar'} onClose={onCancel}>
      <div className="space-y-4">
        <Field label="Title *"><input value={form.title} onChange={set('title')} className={inputCls} placeholder="e.g. Building a strong giving culture" /></Field>
        <Field label="Description">
          <textarea value={form.description} onChange={set('description')} rows={2} className={inputCls + ' resize-none'} placeholder="What attendees will learn" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Host">
            <input value={form.host} onChange={set('host')} className={inputCls} placeholder="e.g. Pastor John Doe" />
          </Field>
          <Field label="Duration (min)">
            <input type="number" min={15} value={form.duration_min} onChange={set('duration_min')} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Scheduled date & time *">
            <input type="datetime-local" value={form.scheduled_at} onChange={set('scheduled_at')} className={inputCls} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={set('status')} className={inputCls}>
              {WEB_STATUS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Registration URL" hint="(optional — Zoom, Google Meet, Eventbrite)">
          <input value={form.registration_url} onChange={set('registration_url')} className={inputCls} placeholder="https://zoom.us/webinar/register/…" />
        </Field>
        <Field label="Recording URL" hint="(after the webinar — YouTube link)">
          <input value={form.recording_url} onChange={set('recording_url')} className={inputCls} placeholder="https://youtube.com/watch?v=…" />
        </Field>
        <Field label="Thumbnail URL" hint="(optional)">
          <input value={form.thumbnail_url} onChange={set('thumbnail_url')} className={inputCls} placeholder="https://…/image.jpg" />
        </Field>
      </div>
      <DialogFooter onCancel={onCancel} onSave={() => onSave(form)} />
    </Dialog>
  )
}

// ════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ════════════════════════════════════════════════════════════════
const inputCls = 'w-full px-3 py-2 rounded-lg border border-[#D0D5DD] text-sm bg-white focus:outline-none focus:border-[#8A19FF] focus:ring-2 focus:ring-[#8A19FF]/20'

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#475467] mb-1.5">
        {label} {hint && <span className="text-[#98A4B3] font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function Header({ icon: Icon, title, subtitle, count, query, setQuery, onAdd }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#F7F4FF] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#8A19FF]" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-[#151022]">{title}</h3>
          <p className="text-xs text-[#98A4B3]">{subtitle} · {count} total</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A4B3]" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search…"
            className="pl-9 pr-3 py-2 rounded-lg border border-[#D0D5DD] text-sm bg-white w-48 focus:outline-none focus:border-[#8A19FF] focus:ring-2 focus:ring-[#8A19FF]/20" />
        </div>
        <button onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#8A19FF] text-white text-xs font-bold shadow-[0_2px_8px_rgba(138,25,255,0.30)] hover:bg-[#5B00B8] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add {title.slice(0, -1).toLowerCase()}
        </button>
      </div>
    </div>
  )
}

function Loader() {
  return (
    <div className="text-center py-12">
      <Loader2 className="w-6 h-6 text-[#8A19FF] animate-spin mx-auto" />
    </div>
  )
}

function Empty({ icon: Icon, title, hint }) {
  return (
    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[#D0D5DD]">
      <div className="w-12 h-12 rounded-xl bg-[#F7F4FF] flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-[#8A19FF]" />
      </div>
      <p className="text-sm font-bold text-[#151022] mb-1">{title}</p>
      <p className="text-xs text-[#98A4B3]">{hint}</p>
    </div>
  )
}

function Dialog({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E7EC]">
          <h3 className="text-base font-extrabold text-[#151022]">{title}</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#98A4B3] hover:text-[#151022] hover:bg-[#F7F8FA] flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function DialogFooter({ onCancel, onSave }) {
  return (
    <div className="flex justify-end gap-2 mt-6 pt-5 border-t border-[#E4E7EC]">
      <button onClick={onCancel}
        className="px-4 py-2 rounded-lg text-sm font-semibold text-[#475467] hover:bg-[#F7F8FA] transition-colors">
        Cancel
      </button>
      <button onClick={onSave}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8A19FF] text-white text-sm font-bold shadow-[0_2px_8px_rgba(138,25,255,0.30)] hover:bg-[#5B00B8] transition-colors">
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  )
}
