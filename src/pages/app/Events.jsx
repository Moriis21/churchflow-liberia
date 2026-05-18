// ============================================================
// ChurchFlow Liberia — Events Management Page
// ============================================================
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Pencil,
  Eye,
  CheckCircle2,
  X,
  ChevronDown,
  Megaphone,
  Music,
  Cross,
  BookOpen,
  Heart,
  Baby,
  Star,
  Church,
  Loader2,
} from 'lucide-react'
import { Button, Card, Badge, Modal } from '../../components/ui'
import { formatDate, formatTime } from '../../utils/helpers'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'

// ─── Colour helpers ──────────────────────────────────────────
const STATUS_STYLES = {
  upcoming: {
    badge: 'bg-blue-100 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
    label: 'Upcoming',
  },
  ongoing: {
    badge: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    dot: 'bg-indigo-500',
    label: 'Ongoing',
  },
  completed: {
    badge: 'bg-slate-100 text-slate-600 border border-slate-200',
    dot: 'bg-slate-400',
    label: 'Completed',
  },
}

const EVENT_TYPE_ICONS = {
  Convention: Church,
  'Youth Event': Star,
  Outreach: Megaphone,
  'Special Service': Heart,
  Retreat: BookOpen,
  Prayer: Cross,
  'Children Event': Baby,
  Crusade: Megaphone,
  Conference: BookOpen,
  'Sunday Service': Church,
  'Youth Program': Star,
  'Prayer Meeting': Heart,
  Wedding: Heart,
  Funeral: Cross,
  Choir: Music,
}

const EVENT_TYPES = [
  'Crusade',
  'Conference',
  'Sunday Service',
  'Youth Program',
  'Prayer Meeting',
  'Wedding',
  'Funeral',
  'Choir',
  'Convention',
  'Youth Event',
  'Outreach',
  'Special Service',
  'Retreat',
  'Prayer',
  'Children Event',
]

const FILTER_TABS = ['All', 'Upcoming', 'Ongoing', 'Completed']

// ─── Empty form state ────────────────────────────────────────
const EMPTY_FORM = {
  title: '',
  type: 'Sunday Service',
  date: '',
  time: '',
  venue: '',
  description: '',
  expectedAttendees: '',
  volunteers: '',
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.upcoming
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

// ─── Event Card ───────────────────────────────────────────────
function EventCard({ event, onView, onEdit }) {
  const TypeIcon = EVENT_TYPE_ICONS[event.type] || Calendar
  const dateStr = event.event_date || event.date || ''
  const d = new Date(dateStr + 'T00:00:00')
  const dayNum = d.getDate()
  const monthAbbr = d.toLocaleDateString('en-US', { month: 'short' })
  const volunteers = Array.isArray(event.volunteers) ? event.volunteers : []

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_-5px_rgba(124,58,237,0.12)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
      {/* Header band */}
      <div className="h-2 w-full bg-gradient-to-r from-violet-600 to-purple-700" />

      <div className="p-5">
        {/* Top row: status + date chip */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <StatusBadge status={event.status} />
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex flex-col items-center justify-center text-white shadow-md shadow-purple-500/25">
            <span className="text-[9px] font-bold uppercase leading-none">{monthAbbr}</span>
            <span className="text-base font-extrabold leading-none">{dayNum}</span>
          </div>
        </div>

        {/* Type icon + title */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-100 border border-purple-100 flex items-center justify-center">
            <TypeIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#1E1B4B] leading-snug line-clamp-2 group-hover:text-purple-700 transition-colors">
              {event.title}
            </h3>
            <span className="text-xs text-purple-500 font-medium">{event.type}</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{formatDate(event.event_date || event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{formatTime(event.event_time || event.time)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              {event.status === 'upcoming'
                ? `${volunteers.length} volunteer${volunteers.length !== 1 ? 's' : ''}`
                : `${event.attendees || 0} attended`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
          <button
            onClick={() => onView(event)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 px-3 py-2 rounded-lg hover:from-violet-700 hover:to-purple-800 transition-all shadow-md shadow-purple-500/20"
          >
            <Eye className="w-3.5 h-3.5" />
            View Details
          </button>
          <button
            onClick={() => onEdit(event)}
            className="flex-shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-100 text-slate-500 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 transition-colors"
            title="Edit event"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Event Detail Modal ───────────────────────────────────────
function EventDetailModal({ event, isOpen, onClose, onMarkComplete }) {
  if (!event) return null
  const TypeIcon = EVENT_TYPE_ICONS[event.type] || Calendar
  const volunteers = Array.isArray(event.volunteers) ? event.volunteers : []

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event.title} size="xl">
      <div className="space-y-6">
        {/* Status + type */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={event.status} />
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full">
            <TypeIcon className="w-3.5 h-3.5" />
            {event.type}
          </span>
        </div>

        {/* Description */}
        {event.description && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-1">Description</p>
            <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4.5 h-4.5 text-purple-600" style={{ width: '1.1rem', height: '1.1rem' }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{formatDate(event.event_date || event.date)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4.5 h-4.5 text-amber-600" style={{ width: '1.1rem', height: '1.1rem' }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{formatTime(event.event_time || event.time)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4.5 h-4.5 text-blue-600" style={{ width: '1.1rem', height: '1.1rem' }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Venue</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{event.venue}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-4.5 h-4.5 text-green-600" style={{ width: '1.1rem', height: '1.1rem' }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {event.status === 'upcoming' ? 'RSVP / Expected' : 'Attendance'}
              </p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {event.status === 'upcoming' ? 'Pending' : `${event.attendees || 0} attended`}
              </p>
            </div>
          </div>
        </div>

        {/* Volunteers */}
        {volunteers.length > 0 && (
          <div>
            <p className="text-sm font-bold text-slate-800 mb-3">Volunteers ({volunteers.length})</p>
            <div className="flex flex-wrap gap-2">
              {volunteers.map((vol, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-full"
                >
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 text-white text-[10px] font-bold flex items-center justify-center">
                    {vol.charAt(0)}
                  </span>
                  {vol}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Attendance section for completed/ongoing */}
        {(event.status === 'completed' || event.status === 'ongoing') && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <p className="text-sm font-bold text-green-800 mb-1">Attendance Record</p>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-extrabold text-green-700">{event.attendees || 0}</div>
              <div>
                <p className="text-xs text-green-600 font-semibold">People attended</p>
                <p className="text-xs text-green-500">Great turnout!</p>
              </div>
            </div>
          </div>
        )}

        {/* Mark as Complete button */}
        {event.status !== 'completed' && (
          <div className="pt-2">
            <button
              onClick={() => onMarkComplete(event.id)}
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20 transition-all"
            >
              <CheckCircle2 className="w-4.5 h-4.5" style={{ width: '1.1rem', height: '1.1rem' }} />
              Mark as Complete
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── Create Event Modal ───────────────────────────────────────
function CreateEventModal({ isOpen, onClose, onSave, user }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.date) e.date = 'Date is required'
    if (!form.time) e.time = 'Time is required'
    if (!form.venue.trim()) e.venue = 'Venue is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const volunteersArr = form.volunteers
      ? form.volunteers.split(',').map((v) => v.trim()).filter(Boolean)
      : []
    const { data: newEvent, error } = await insforge.database
      .from('events')
      .insert([{
        church_id: user?.churchId || user?.profile?.church_id,
        title: form.title,
        type: form.type,
        event_date: form.date,
        event_time: form.time,
        venue: form.venue,
        description: form.description,
        expected_attendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : null,
        volunteers: volunteersArr,
        status: 'upcoming',
        attendees: 0,
      }])
      .select()
      .single()
    setSaving(false)
    if (error) {
      console.error('[CreateEvent]', error.message)
      return
    }
    if (newEvent) onSave(newEvent)
    setForm(EMPTY_FORM)
    setErrors({})
    onClose()
  }

  const handleClose = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    onClose()
  }

  const inputCls = (field) =>
    `w-full px-3.5 py-2.5 text-sm rounded-xl border ${
      errors[field]
        ? 'border-red-300 focus:ring-red-300 bg-red-50'
        : 'border-slate-200 focus:ring-purple-300 bg-white'
    } focus:outline-none focus:ring-2 focus:border-transparent transition-colors`

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Event" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls('title')}
            placeholder="e.g. Annual Youth Convention"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Event Type</label>
          <div className="relative">
            <select
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent appearance-none"
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className={inputCls('date')}
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              className={inputCls('time')}
              value={form.time}
              onChange={(e) => handleChange('time', e.target.value)}
            />
            {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
          </div>
        </div>

        {/* Venue */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Venue <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls('venue')}
            placeholder="e.g. Main Auditorium, Monrovia"
            value={form.venue}
            onChange={(e) => handleChange('venue', e.target.value)}
          />
          {errors.venue && <p className="text-xs text-red-500 mt-1">{errors.venue}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
          <textarea
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors resize-none"
            rows={3}
            placeholder="Brief description of the event..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        {/* Expected Attendees + Volunteers */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Expected Attendees
            </label>
            <input
              type="number"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors"
              placeholder="e.g. 200"
              value={form.expectedAttendees}
              onChange={(e) => handleChange('expectedAttendees', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Volunteers <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors"
              placeholder="John, Mary, Samuel"
              value={form.volunteers}
              onChange={(e) => handleChange('volunteers', e.target.value)}
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl hover:from-violet-700 hover:to-purple-800 shadow-md shadow-purple-500/25 transition-all inline-flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Event
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Events Page ──────────────────────────────────────────────
export default function Events() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await insforge.database
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
      if (error) console.error('[Events]', error.message)
      setEvents(data || [])
      setLoading(false)
    }
    load()
  }, [])

  // Filtered events
  const filteredEvents =
    activeFilter === 'All'
      ? events
      : events.filter((e) => e.status === activeFilter.toLowerCase())

  // Stats
  const counts = {
    All: events.length,
    Upcoming: events.filter((e) => e.status === 'upcoming').length,
    Ongoing: events.filter((e) => e.status === 'ongoing').length,
    Completed: events.filter((e) => e.status === 'completed').length,
  }

  const handleView = (event) => {
    setSelectedEvent(event)
    setShowDetail(true)
  }

  const handleEdit = (event) => {
    const volunteers = Array.isArray(event.volunteers) ? event.volunteers.join(', ') : (event.volunteers || '')
    setEditingEvent({
      ...event,
      volunteers,
      date: event.event_date || event.date || '',
      time: event.event_time || event.time || '',
    })
    setShowEdit(true)
  }

  const handleMarkComplete = async (id) => {
    const { error } = await insforge.database
      .from('events')
      .update({ status: 'completed' })
      .eq('id', id)
    if (error) {
      console.error('[MarkComplete]', error.message)
      return
    }
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'completed' } : e))
    )
    setShowDetail(false)
  }

  const handleCreate = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev])
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    setEditSaving(true)
    const volunteersArr =
      typeof editingEvent.volunteers === 'string'
        ? editingEvent.volunteers.split(',').map((v) => v.trim()).filter(Boolean)
        : editingEvent.volunteers || []

    const { data: updated, error } = await insforge.database
      .from('events')
      .update({
        title: editingEvent.title,
        event_date: editingEvent.date,
        event_time: editingEvent.time,
        venue: editingEvent.venue,
        description: editingEvent.description,
        volunteers: volunteersArr,
      })
      .eq('id', editingEvent.id)
      .select()
      .single()
    setEditSaving(false)
    if (error) {
      console.error('[EditEvent]', error.message)
      return
    }
    if (updated) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === updated.id ? updated : ev))
      )
    }
    setShowEdit(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Page Header ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] leading-tight">
              Events
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage all church events, programmes, and activities.
            </p>
          </div>
          <Button icon={Plus} onClick={() => setShowCreate(true)}>
            Create Event
          </Button>
        </div>

        {/* ── Stats Bar ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: counts.All, color: 'from-violet-600 to-purple-700', shadow: 'shadow-purple-500/20' },
            { label: 'Upcoming', value: counts.Upcoming, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
            { label: 'Ongoing', value: counts.Ongoing, color: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/20' },
            { label: 'Completed', value: counts.Completed, color: 'from-slate-500 to-slate-600', shadow: 'shadow-slate-500/20' },
          ].map(({ label, value, color, shadow }) => (
            <div
              key={label}
              className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-lg ${shadow}`}
            >
              <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">{label}</p>
              <p className="text-3xl font-extrabold mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-1.5 inline-flex gap-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeFilter === tab
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-500 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              {tab}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Loading State ─────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {/* ── Events Grid ─────────────────────────────────── */}
        {!loading && (
          filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">
                {events.length === 0 ? 'No events scheduled' : 'No events found'}
              </h3>
              <p className="text-sm text-slate-400">
                {events.length === 0
                  ? 'Create your first event to get started.'
                  : `No ${activeFilter.toLowerCase() !== 'all' ? activeFilter.toLowerCase() + ' ' : ''}events at the moment.`}
              </p>
              {events.length === 0 && (
                <Button icon={Plus} onClick={() => setShowCreate(true)} className="mt-4">
                  Create Event
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onView={handleView}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Event Detail Modal ──────────────────────────────── */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onMarkComplete={handleMarkComplete}
      />

      {/* ── Create Event Modal ──────────────────────────────── */}
      <CreateEventModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleCreate}
        user={user}
      />

      {/* ── Edit Event Modal ────────────────────────────────── */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Event"
        size="xl"
      >
        {editingEvent && (
          <form onSubmit={handleEditSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors"
                value={editingEvent.title}
                onChange={(e) => setEditingEvent((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
                <input
                  type="date"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors"
                  value={editingEvent.date}
                  onChange={(e) => setEditingEvent((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Time</label>
                <input
                  type="time"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors"
                  value={editingEvent.time}
                  onChange={(e) => setEditingEvent((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Venue</label>
              <input
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors"
                value={editingEvent.venue}
                onChange={(e) => setEditingEvent((prev) => ({ ...prev, venue: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors resize-none"
                rows={3}
                value={editingEvent.description || ''}
                onChange={(e) => setEditingEvent((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Volunteers <span className="text-slate-400 font-normal">(comma-separated)</span>
              </label>
              <input
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors"
                value={editingEvent.volunteers}
                onChange={(e) => setEditingEvent((prev) => ({ ...prev, volunteers: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                disabled={editSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editSaving}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl hover:from-violet-700 hover:to-purple-800 shadow-md shadow-purple-500/25 transition-all inline-flex items-center gap-2 disabled:opacity-60"
              >
                {editSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
