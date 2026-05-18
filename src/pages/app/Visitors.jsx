// ============================================================
// ChurchFlow Liberia — Visitors Management Page
// ============================================================
import { useState, useEffect } from 'react'
import {
  UserPlus,
  Phone,
  MapPin,
  Calendar,
  ChevronDown,
  LayoutGrid,
  Table2,
  MessageSquare,
  UserCheck,
  Clock,
  X,
  ChevronRight,
  Users,
  Eye,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Button, Modal, Avatar } from '../../components/ui'
import { formatDate } from '../../utils/helpers'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'

// ─── Constants ───────────────────────────────────────────────
const HOW_FOUND_OPTIONS = [
  'Friend / Family Referral',
  'Social Media',
  'Street Evangelism',
  'Radio / TV Programme',
  'Online Search',
  'Flyer / Poster',
  'Walking Past',
  'Other',
]

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badge: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    dot: 'bg-yellow-500',
    column: 'bg-yellow-50 border-yellow-100',
    header: 'bg-yellow-500',
  },
  contacted: {
    label: 'Contacted',
    badge: 'bg-purple-100 text-purple-700 border border-purple-200',
    dot: 'bg-purple-500',
    column: 'bg-purple-50 border-purple-100',
    header: 'bg-purple-500',
  },
  converted: {
    label: 'Converted',
    badge: 'bg-green-100 text-green-700 border border-green-200',
    dot: 'bg-green-500',
    column: 'bg-green-50 border-green-100',
    header: 'bg-green-500',
  },
}

const EMPTY_FORM = {
  name: '',
  phone: '',
  address: '',
  visitDate: '',
  howFound: '',
  assignedTo: '',
  notes: '',
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── Visitor Card (Kanban) ────────────────────────────────────
function VisitorCard({ visitor, onView, onStatusChange }) {
  const name = visitor.name || visitor.full_name || ''
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const followUpStatus = visitor.follow_up_status || visitor.followUpStatus || 'pending'
  const visitDate = visitor.visit_date || visitor.visitDate || ''
  const assignedTo = visitor.assigned_to || visitor.assignedTo || ''

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 cursor-pointer group">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-purple-500/25">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1E1B4B] leading-tight truncate group-hover:text-purple-700 transition-colors">
            {name}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{visitor.phone}</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Visited {formatDate(visitDate)}</span>
        </div>
        {visitor.address && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{visitor.address}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">Assigned: {assignedTo || '—'}</span>
        </div>
      </div>

      {visitor.notes && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 italic bg-slate-50 rounded-lg p-2">
          {visitor.notes}
        </p>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
        <button
          onClick={() => onView(visitor)}
          className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-1.5 rounded-lg transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
        {followUpStatus !== 'converted' && (
          <button
            onClick={() =>
              onStatusChange(
                visitor.id,
                followUpStatus === 'pending' ? 'contacted' : 'converted'
              )
            }
            className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 px-2 py-1.5 rounded-lg hover:from-violet-700 hover:to-purple-800 shadow-sm shadow-purple-500/20 transition-all"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            {followUpStatus === 'pending' ? 'Mark Contacted' : 'Convert'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Add Visitor Modal ────────────────────────────────────────
function AddVisitorModal({ isOpen, onClose, onSave, members, user }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!form.visitDate) e.visitDate = 'Visit date is required'
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
    const { data: newVisitor, error } = await insforge.database
      .from('visitors')
      .insert([{
        church_id: user?.churchId || user?.profile?.church_id,
        name: form.name,
        phone: form.phone,
        address: form.address,
        visit_date: form.visitDate,
        how_found: form.howFound,
        assigned_to: form.assignedTo,
        notes: form.notes,
        follow_up_status: 'pending',
      }])
      .select()
      .single()
    setSaving(false)
    if (error) {
      console.error('[AddVisitor]', error.message)
      return
    }
    if (newVisitor) onSave(newVisitor)
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Visitor" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls('name')}
              placeholder="e.g. Tamba Sirleaf"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls('phone')}
              placeholder="+231-770-000-000"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* Address + Visit Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address</label>
            <input
              className={inputCls('address')}
              placeholder="e.g. Sinkor, Monrovia"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Visit Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className={inputCls('visitDate')}
              value={form.visitDate}
              onChange={(e) => handleChange('visitDate', e.target.value)}
            />
            {errors.visitDate && <p className="text-xs text-red-500 mt-1">{errors.visitDate}</p>}
          </div>
        </div>

        {/* How Found + Assigned To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              How They Found Us
            </label>
            <div className="relative">
              <select
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent appearance-none"
                value={form.howFound}
                onChange={(e) => handleChange('howFound', e.target.value)}
              >
                <option value="">Select an option</option>
                {HOW_FOUND_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Follow-up Leader
            </label>
            <div className="relative">
              <select
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent appearance-none"
                value={form.assignedTo}
                onChange={(e) => handleChange('assignedTo', e.target.value)}
              >
                <option value="">Select a leader</option>
                {members.map((m) => (
                  <option key={m.id} value={m.full_name || m.name}>
                    {m.full_name || m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes</label>
          <textarea
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors resize-none"
            rows={3}
            placeholder="Any observations or notes about this visitor..."
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </div>

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
            Add Visitor
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Visitor Detail Modal ─────────────────────────────────────
function VisitorDetailModal({ visitor, isOpen, onClose, onStatusChange, onConvert }) {
  const [newNote, setNewNote] = useState('')
  const [notes, setNotes] = useState(
    visitor
      ? [{ text: visitor.notes, time: formatDate(visitor.visit_date || visitor.visitDate || ''), system: true }]
      : []
  )

  const handleAddNote = () => {
    if (!newNote.trim()) return
    setNotes((prev) => [
      ...prev,
      { text: newNote.trim(), time: 'Just now', system: false },
    ])
    setNewNote('')
  }

  if (!visitor) return null

  const name = visitor.name || visitor.full_name || ''
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const followUpStatus = visitor.follow_up_status || visitor.followUpStatus || 'pending'
  const visitDate = visitor.visit_date || visitor.visitDate || ''
  const assignedTo = visitor.assigned_to || visitor.assignedTo || ''

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Visitor Details" size="xl">
      <div className="space-y-5">
        {/* Profile header */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-purple-500/30">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#1E1B4B]">{name}</h3>
            <p className="text-sm text-slate-500">{visitor.phone}</p>
            <div className="mt-1">
              <StatusBadge status={followUpStatus} />
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Visit Date</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{formatDate(visitDate)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Assigned To</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{assignedTo || '—'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 col-span-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Address</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{visitor.address || '—'}</p>
          </div>
        </div>

        {/* Status update */}
        <div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Update Status</p>
          <div className="flex gap-2">
            {['pending', 'contacted', 'converted'].map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(visitor.id, s)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all capitalize ${
                  followUpStatus === s
                    ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white border-transparent shadow-md shadow-purple-500/20'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Follow-up notes timeline */}
        <div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
            Follow-up Notes
          </p>
          <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
            {notes.filter((n) => n.text).map((note, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-1" />
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed">{note.text}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {note.time}
                  </p>
                </div>
              </div>
            ))}
            {notes.filter((n) => n.text).length === 0 && (
              <p className="text-sm text-slate-400 italic py-2">No follow-up notes yet.</p>
            )}
          </div>

          {/* Add note */}
          <div className="flex gap-2 mt-3">
            <input
              className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors"
              placeholder="Add a follow-up note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
            />
            <button
              onClick={handleAddNote}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl hover:from-violet-700 hover:to-purple-800 shadow-md shadow-purple-500/20 transition-all"
            >
              Add
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
          {followUpStatus !== 'converted' && (
            <button
              onClick={() => { onConvert(visitor.id); onClose(); }}
              className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              Convert to Member
            </button>
          )}
          <button
            onClick={() => {}}
            className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl hover:bg-amber-100 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Send SMS Reminder
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Visitors Page ────────────────────────────────────────────
export default function Visitors() {
  const { user } = useAuth()
  const [visitors, setVisitors] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' | 'table'
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedVisitor, setSelectedVisitor] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [vRes, mRes] = await Promise.all([
        insforge.database.from('visitors').select('*').order('visit_date', { ascending: false }),
        insforge.database.from('members').select('id, full_name').order('full_name'),
      ])
      if (vRes.error) console.error('[Visitors]', vRes.error.message)
      if (mRes.error) console.error('[Members]', mRes.error.message)
      setVisitors(vRes.data || [])
      setMembers(mRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const getStatus = (v) => v.follow_up_status || v.followUpStatus || 'pending'

  // Stats
  const total = visitors.length
  const pending = visitors.filter((v) => getStatus(v) === 'pending').length
  const contacted = visitors.filter((v) => getStatus(v) === 'contacted').length
  const converted = visitors.filter((v) => getStatus(v) === 'converted').length

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await insforge.database
      .from('visitors')
      .update({ follow_up_status: newStatus })
      .eq('id', id)
    if (error) {
      console.error('[StatusChange]', error.message)
      return
    }
    setVisitors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, follow_up_status: newStatus } : v))
    )
    if (selectedVisitor?.id === id) {
      setSelectedVisitor((prev) => ({ ...prev, follow_up_status: newStatus }))
    }
  }

  const handleConvert = (id) => {
    handleStatusChange(id, 'converted')
  }

  const handleView = (visitor) => {
    setSelectedVisitor(visitor)
    setShowDetail(true)
  }

  const handleAdd = (newVisitor) => {
    setVisitors((prev) => [newVisitor, ...prev])
  }

  // Filter for table view
  const filteredVisitors =
    filterStatus === 'all' ? visitors : visitors.filter((v) => getStatus(v) === filterStatus)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Page Header ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] leading-tight">
              Visitors
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track and follow up with first-time and returning visitors.
            </p>
          </div>
          <Button icon={UserPlus} onClick={() => setShowAdd(true)}>
            Add Visitor
          </Button>
        </div>

        {/* ── Stats ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Visitors',
              value: total,
              icon: Users,
              color: 'from-violet-600 to-purple-700',
              shadow: 'shadow-purple-500/20',
              iconBg: 'bg-white/20',
            },
            {
              label: 'Pending Follow-up',
              value: pending,
              icon: Clock,
              color: 'from-amber-400 to-yellow-500',
              shadow: 'shadow-amber-400/20',
              iconBg: 'bg-white/20',
            },
            {
              label: 'Contacted',
              value: contacted,
              icon: Phone,
              color: 'from-blue-500 to-indigo-600',
              shadow: 'shadow-blue-500/20',
              iconBg: 'bg-white/20',
            },
            {
              label: 'Converted to Members',
              value: converted,
              icon: UserCheck,
              color: 'from-emerald-500 to-teal-600',
              shadow: 'shadow-emerald-500/20',
              iconBg: 'bg-white/20',
            },
          ].map(({ label, value, icon: Icon, color, shadow, iconBg }) => (
            <div
              key={label}
              className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg ${shadow} flex items-start gap-3`}
            >
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/70 leading-none">{label}</p>
                <p className="text-3xl font-extrabold mt-1 leading-none">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Loading State ─────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* ── View Toggle + Filter ─────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* View Mode Buttons */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-1 inline-flex gap-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    viewMode === 'kanban'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-purple-500/25'
                      : 'text-slate-500 hover:text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Kanban
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-purple-500/25'
                      : 'text-slate-500 hover:text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <Table2 className="w-4 h-4" />
                  Table
                </button>
              </div>

              {/* Table-mode filter */}
              {viewMode === 'table' && (
                <div className="relative">
                  <select
                    className="pl-3.5 pr-8 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 appearance-none shadow-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Empty state when no visitors at all */}
            {visitors.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-base font-bold text-slate-700 mb-1">No visitors recorded yet</h3>
                <p className="text-sm text-slate-400">Add your first visitor to start tracking follow-ups.</p>
                <Button icon={UserPlus} onClick={() => setShowAdd(true)} className="mt-4">
                  Add Visitor
                </Button>
              </div>
            )}

            {/* ── Kanban View ──────────────────────────────────── */}
            {visitors.length > 0 && viewMode === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {(['pending', 'contacted', 'converted']).map((status) => {
                  const cfg = STATUS_CONFIG[status]
                  const colVisitors = visitors.filter((v) => getStatus(v) === status)
                  return (
                    <div
                      key={status}
                      className={`rounded-2xl border ${cfg.column} overflow-hidden`}
                    >
                      {/* Column header */}
                      <div className={`${cfg.header} px-4 py-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white capitalize">{status}</span>
                          <span className="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">
                            {colVisitors.length}
                          </span>
                        </div>
                      </div>

                      {/* Column cards */}
                      <div className="p-3 space-y-3 min-h-[200px]">
                        {colVisitors.map((v) => (
                          <VisitorCard
                            key={v.id}
                            visitor={v}
                            onView={handleView}
                            onStatusChange={handleStatusChange}
                          />
                        ))}
                        {colVisitors.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-2 opacity-50">
                              <Users className="w-5 h-5 text-slate-400" />
                            </div>
                            <p className="text-xs text-slate-400">No visitors here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Table View ───────────────────────────────────── */}
            {visitors.length > 0 && viewMode === 'table' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-5 py-3.5">
                          Visitor
                        </th>
                        <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-5 py-3.5">
                          Phone
                        </th>
                        <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-5 py-3.5">
                          Visit Date
                        </th>
                        <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-5 py-3.5">
                          Status
                        </th>
                        <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-5 py-3.5">
                          Assigned To
                        </th>
                        <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-5 py-3.5">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredVisitors.map((visitor) => {
                        const name = visitor.name || visitor.full_name || ''
                        const initials = name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                        const followUpStatus = getStatus(visitor)
                        const visitDate = visitor.visit_date || visitor.visitDate || ''
                        const assignedTo = visitor.assigned_to || visitor.assignedTo || ''
                        return (
                          <tr
                            key={visitor.id}
                            className="hover:bg-purple-50/30 transition-colors group"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-500/20 flex-shrink-0">
                                  {initials}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#1E1B4B] group-hover:text-purple-700 transition-colors">
                                    {name}
                                  </p>
                                  {visitor.address && (
                                    <p className="text-xs text-slate-400 truncate max-w-[140px]">
                                      {visitor.address}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-600 font-medium">{visitor.phone}</td>
                            <td className="px-5 py-4 text-slate-600">{formatDate(visitDate)}</td>
                            <td className="px-5 py-4">
                              <StatusBadge status={followUpStatus} />
                            </td>
                            <td className="px-5 py-4 text-slate-600">{assignedTo || '—'}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleView(visitor)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2.5 py-1.5 rounded-lg transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </button>
                                {followUpStatus !== 'converted' && (
                                  <button
                                    onClick={() =>
                                      handleStatusChange(
                                        visitor.id,
                                        followUpStatus === 'pending' ? 'contacted' : 'converted'
                                      )
                                    }
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 px-2.5 py-1.5 rounded-lg hover:from-violet-700 hover:to-purple-800 shadow-sm shadow-purple-500/20 transition-all"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                    {followUpStatus === 'pending' ? 'Contacted' : 'Converted'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      {filteredVisitors.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-400" />
                              </div>
                              <p className="text-sm font-semibold text-slate-500">No visitors found</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Add Visitor Modal ─────────────────────────────────── */}
      <AddVisitorModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAdd}
        members={members}
        user={user}
      />

      {/* ── Visitor Detail Modal ──────────────────────────────── */}
      {selectedVisitor && (
        <VisitorDetailModal
          key={selectedVisitor.id}
          visitor={
            visitors.find((v) => v.id === selectedVisitor.id) || selectedVisitor
          }
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          onStatusChange={handleStatusChange}
          onConvert={handleConvert}
        />
      )}
    </div>
  )
}
