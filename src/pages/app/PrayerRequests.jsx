// ============================================================
// ChurchFlow Liberia — Prayer Requests Management Page
// ============================================================
import { useState, useEffect } from 'react'
import {
  Heart,
  Lock,
  Globe,
  Shield,
  CheckCircle2,
  Plus,
  MessageSquare,
  Calendar,
  X,
  ChevronDown,
  BookOpen,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { Button, Modal, Avatar } from '../../components/ui'
import { formatDate } from '../../utils/helpers'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'

// ─── Constants ───────────────────────────────────────────────
const FILTER_TABS = ['All', 'Public', 'Private', 'Pastor Only', 'Answered']

const TYPE_CONFIG = {
  public: {
    label: 'Public',
    badge: 'bg-sky-100 text-sky-700 border border-sky-200',
    icon: Globe,
    iconColor: 'text-sky-500',
  },
  private: {
    label: 'Private',
    badge: 'bg-slate-100 text-slate-600 border border-slate-200',
    icon: Lock,
    iconColor: 'text-slate-500',
  },
  pastor_only: {
    label: 'Pastor Only',
    badge: 'bg-purple-100 text-purple-700 border border-purple-200',
    icon: Shield,
    iconColor: 'text-purple-600',
  },
}

const STATUS_CONFIG = {
  open: {
    badge: 'bg-orange-100 text-orange-700 border border-orange-200',
    dot: 'bg-orange-500',
    label: 'Open',
  },
  answered: {
    badge: 'bg-green-100 text-green-700 border border-green-200',
    dot: 'bg-green-500',
    label: 'Answered',
  },
}

const EMPTY_SUBMIT_FORM = {
  request: '',
  visibility: 'public',
  memberName: '',
}

// ─── Type Badge ───────────────────────────────────────────────
function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.public
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
      <Icon className={`w-3 h-3 ${cfg.iconColor}`} />
      {cfg.label}
    </span>
  )
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── Prayer Card ──────────────────────────────────────────────
function PrayerCard({ prayerReq, prayerCounts, onPray, onAddResponse, onViewTestimony }) {
  const count = prayerCounts[prayerReq.id] || 0
  const hasPrayed = prayerCounts[`${prayerReq.id}_prayed`] || false

  const memberName = prayerReq.member_name || prayerReq.memberName || 'Anonymous'
  const reqType = prayerReq.visibility || prayerReq.type || 'public'
  const reqDate = prayerReq.created_at || prayerReq.date || ''

  const initials = memberName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={`bg-white rounded-2xl border shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_-5px_rgba(124,58,237,0.10)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden ${
      prayerReq.status === 'answered' ? 'border-green-200' : 'border-slate-100'
    }`}>
      {/* Accent line */}
      <div
        className={`h-1.5 w-full ${
          prayerReq.status === 'answered'
            ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
            : reqType === 'pastor_only'
            ? 'bg-gradient-to-r from-violet-600 to-purple-700'
            : reqType === 'private'
            ? 'bg-gradient-to-r from-slate-400 to-slate-500'
            : 'bg-gradient-to-r from-sky-400 to-blue-500'
        }`}
      />

      <div className="p-5">
        {/* Header: member + badges */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md shadow-purple-500/25">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1E1B4B] leading-tight">{memberName}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <TypeBadge type={reqType} />
              <StatusBadge status={prayerReq.status || 'open'} />
            </div>
          </div>
        </div>

        {/* Request text */}
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-3">
          {prayerReq.request}
        </p>

        {/* Answered: testimony box */}
        {prayerReq.status === 'answered' && prayerReq.response && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <p className="text-xs font-bold text-emerald-700">Testimony / Pastor's Response</p>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed line-clamp-2">
              {prayerReq.response}
            </p>
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          <Calendar className="w-3 h-3" />
          <span>Submitted {formatDate(reqDate)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
          {/* Pray button */}
          <button
            onClick={() => onPray(prayerReq.id)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
              hasPrayed
                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                : 'bg-white text-slate-500 border-slate-200 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-all ${hasPrayed ? 'fill-rose-500 text-rose-500' : ''}`}
            />
            Pray for this
            {count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${hasPrayed ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            )}
          </button>

          {/* Pastor-only: Add Response */}
          {reqType === 'pastor_only' && prayerReq.status === 'open' && (
            <button
              onClick={() => onAddResponse(prayerReq)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 px-3 py-2 rounded-xl hover:from-violet-700 hover:to-purple-800 shadow-md shadow-purple-500/20 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Add Response
            </button>
          )}

          {/* Answered: View Testimony */}
          {prayerReq.status === 'answered' && prayerReq.response && (
            <button
              onClick={() => onViewTestimony(prayerReq)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Full Testimony
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Submit Request Modal ─────────────────────────────────────
function SubmitRequestModal({ isOpen, onClose, onSave, user }) {
  const [form, setForm] = useState(EMPTY_SUBMIT_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.request.trim()) e.request = 'Please enter your prayer request'
    if (!form.memberName.trim()) e.memberName = 'Name is required'
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
    const { data: newRequest, error } = await insforge.database
      .from('prayer_requests')
      .insert([{
        church_id: user?.churchId || user?.profile?.church_id,
        member_name: form.memberName,
        request: form.request,
        visibility: form.visibility,
        status: 'open',
        response: '',
      }])
      .select()
      .single()
    setSaving(false)
    if (error) {
      console.error('[SubmitRequest]', error.message)
      return
    }
    if (newRequest) onSave(newRequest)
    setForm(EMPTY_SUBMIT_FORM)
    setErrors({})
    onClose()
  }

  const handleClose = () => {
    setForm(EMPTY_SUBMIT_FORM)
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Submit Prayer Request" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Member Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
              errors.memberName
                ? 'border-red-300 focus:ring-red-300 bg-red-50'
                : 'border-slate-200 focus:ring-purple-300 bg-white'
            } focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
            placeholder="e.g. James Kollie"
            value={form.memberName}
            onChange={(e) => handleChange('memberName', e.target.value)}
          />
          {errors.memberName && (
            <p className="text-xs text-red-500 mt-1">{errors.memberName}</p>
          )}
        </div>

        {/* Prayer Request Textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Prayer Request <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
              errors.request
                ? 'border-red-300 focus:ring-red-300 bg-red-50'
                : 'border-slate-200 focus:ring-purple-300 bg-white'
            } focus:outline-none focus:ring-2 focus:border-transparent transition-colors resize-none`}
            rows={5}
            placeholder="Share your prayer request here. Be as specific as you'd like..."
            value={form.request}
            onChange={(e) => handleChange('request', e.target.value)}
          />
          {errors.request && (
            <p className="text-xs text-red-500 mt-1">{errors.request}</p>
          )}
          <p className="text-xs text-slate-400 mt-1 text-right">{form.request.length} characters</p>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Who can see this request?
          </label>
          <div className="space-y-2.5">
            {[
              {
                value: 'public',
                label: 'Public',
                desc: 'Visible to all church members',
                icon: Globe,
                color: 'text-sky-600',
                bg: 'bg-sky-50',
                border: 'border-sky-200',
              },
              {
                value: 'private',
                label: 'Private',
                desc: 'Only visible to church leadership',
                icon: Lock,
                color: 'text-slate-600',
                bg: 'bg-slate-50',
                border: 'border-slate-200',
              },
              {
                value: 'pastor_only',
                label: 'Pastor Only',
                desc: 'Visible only to the senior pastor',
                icon: Shield,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                border: 'border-purple-200',
              },
            ].map(({ value, label, desc, icon: Icon, color, bg, border }) => (
              <label
                key={value}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  form.visibility === value
                    ? `${bg} ${border}`
                    : 'border-transparent hover:border-slate-100 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={value}
                  checked={form.visibility === value}
                  onChange={() => handleChange('visibility', value)}
                  className="sr-only"
                />
                <div className={`w-8 h-8 rounded-lg ${bg} ${border} border flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  form.visibility === value
                    ? 'border-purple-600 bg-purple-600'
                    : 'border-slate-300'
                }`}>
                  {form.visibility === value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </label>
            ))}
          </div>
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
            <Heart className="w-4 h-4" />
            Submit Request
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Add Response Modal (Pastor Only) ────────────────────────
function AddResponseModal({ prayerReq, isOpen, onClose, onSave }) {
  const [response, setResponse] = useState('')
  const [markAnswered, setMarkAnswered] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!response.trim()) return
    setSaving(true)
    await onSave(prayerReq.id, response, markAnswered)
    setSaving(false)
    setResponse('')
    setMarkAnswered(false)
    onClose()
  }

  const handleClose = () => {
    setResponse('')
    setMarkAnswered(false)
    onClose()
  }

  if (!prayerReq) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Pastor's Response" size="md">
      <div className="space-y-4">
        {/* Original request */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-xs font-bold text-purple-700 mb-1">Original Request — {prayerReq.member_name || prayerReq.memberName}</p>
          <p className="text-sm text-purple-800 leading-relaxed">{prayerReq.request}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pastor's Response / Guidance
            </label>
            <textarea
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-colors resize-none"
              rows={4}
              placeholder="Write your pastoral response, prayer, or guidance..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              required
            />
          </div>

          {/* Mark as answered toggle */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <div
              onClick={() => setMarkAnswered((prev) => !prev)}
              className={`w-11 h-6 rounded-full flex items-center transition-all duration-200 px-0.5 ${
                markAnswered ? 'bg-green-500' : 'bg-slate-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${markAnswered ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Mark as Answered</p>
              <p className="text-xs text-slate-400">This request will move to the answered tab</p>
            </div>
          </label>

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
              Save Response
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

// ─── Testimony Modal ──────────────────────────────────────────
function TestimonyModal({ prayerReq, isOpen, onClose }) {
  if (!prayerReq) return null

  const memberName = prayerReq.member_name || prayerReq.memberName || 'Anonymous'
  const reqDate = prayerReq.created_at || prayerReq.date || ''
  const initials = memberName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Prayer Testimony" size="md">
      <div className="space-y-5">
        {/* Member info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-purple-500/25">
            {initials}
          </div>
          <div>
            <p className="font-bold text-[#1E1B4B]">{memberName}</p>
            <p className="text-xs text-slate-400">{formatDate(reqDate)}</p>
          </div>
        </div>

        {/* Original request */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Original Prayer Request</p>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <p className="text-sm text-slate-700 leading-relaxed">{prayerReq.request}</p>
          </div>
        </div>

        {/* Answered banner */}
        <div className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span className="text-sm font-bold text-emerald-700">Prayer Answered!</span>
          <Sparkles className="w-4 h-4 text-emerald-500 ml-auto" />
        </div>

        {/* Testimony */}
        {prayerReq.response && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Testimony / Pastor's Response</p>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-sm text-emerald-800 leading-relaxed">{prayerReq.response}</p>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl hover:from-violet-700 hover:to-purple-800 shadow-md shadow-purple-500/25 transition-all"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}

// ─── Prayer Requests Page ─────────────────────────────────────
export default function PrayerRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [prayerCounts, setPrayerCounts] = useState({})
  const [showSubmit, setShowSubmit] = useState(false)
  const [showResponse, setShowResponse] = useState(false)
  const [showTestimony, setShowTestimony] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await insforge.database
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) console.error('[PrayerRequests]', error.message)
      setRequests(data || [])
      setLoading(false)
    }
    load()
  }, [])

  // Stats
  const openCount = requests.filter((r) => r.status === 'open').length
  const answeredThisMonth = requests.filter((r) => {
    if (r.status !== 'answered') return false
    const d = new Date(r.created_at || r.date || '')
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length
  const totalTestimonies = requests.filter((r) => r.status === 'answered' && r.response).length

  const getType = (r) => r.visibility || r.type || 'public'

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'All') return true
    if (activeTab === 'Public') return getType(r) === 'public'
    if (activeTab === 'Private') return getType(r) === 'private'
    if (activeTab === 'Pastor Only') return getType(r) === 'pastor_only'
    if (activeTab === 'Answered') return r.status === 'answered'
    return true
  })

  // Tab counts
  const tabCounts = {
    All: requests.length,
    Public: requests.filter((r) => getType(r) === 'public').length,
    Private: requests.filter((r) => getType(r) === 'private').length,
    'Pastor Only': requests.filter((r) => getType(r) === 'pastor_only').length,
    Answered: requests.filter((r) => r.status === 'answered').length,
  }

  const handlePray = (id) => {
    setPrayerCounts((prev) => {
      const alreadyPrayed = prev[`${id}_prayed`]
      if (alreadyPrayed) {
        return {
          ...prev,
          [id]: Math.max((prev[id] || 0) - 1, 0),
          [`${id}_prayed`]: false,
        }
      }
      return {
        ...prev,
        [id]: (prev[id] || 0) + 1,
        [`${id}_prayed`]: true,
      }
    })
  }

  const handleAddResponse = (req) => {
    setSelectedRequest(req)
    setShowResponse(true)
  }

  const handleViewTestimony = (req) => {
    setSelectedRequest(req)
    setShowTestimony(true)
  }

  const handleSaveResponse = async (id, response, markAnswered) => {
    const updatePayload = {
      response,
      ...(markAnswered && {
        status: 'answered',
        answered_at: new Date().toISOString(),
      }),
    }
    const { data: updated, error } = await insforge.database
      .from('prayer_requests')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('[SaveResponse]', error.message)
      return
    }
    if (updated) {
      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      )
    }
  }

  const handleSubmitRequest = (newRequest) => {
    setRequests((prev) => [newRequest, ...prev])
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Page Header ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] leading-tight">
              Prayer Requests
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Intercede for members and celebrate answered prayers.
            </p>
          </div>
          <Button icon={Plus} onClick={() => setShowSubmit(true)}>
            Submit Request
          </Button>
        </div>

        {/* ── Stats ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Open Requests',
              value: openCount,
              icon: Heart,
              color: 'from-rose-500 to-pink-600',
              shadow: 'shadow-rose-500/20',
              desc: 'Needs intercession',
            },
            {
              label: 'Answered This Month',
              value: answeredThisMonth,
              icon: CheckCircle2,
              color: 'from-emerald-500 to-teal-600',
              shadow: 'shadow-emerald-500/20',
              desc: 'Praise God!',
            },
            {
              label: 'Total Testimonies',
              value: totalTestimonies,
              icon: Sparkles,
              color: 'from-amber-400 to-yellow-500',
              shadow: 'shadow-amber-400/20',
              desc: 'God is faithful',
            },
          ].map(({ label, value, icon: Icon, color, shadow, desc }) => (
            <div
              key={label}
              className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg ${shadow} flex items-start gap-4`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/70 leading-none">{label}</p>
                <p className="text-3xl font-extrabold mt-1 leading-none">{value}</p>
                <p className="text-xs text-white/60 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-1.5 inline-flex flex-wrap gap-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-500 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              {tab}
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Scripture reminder banner ─────────────────────── */}
        {activeTab === 'All' && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E1B4B] to-[#312e81] p-5 flex items-center gap-4 shadow-lg shadow-indigo-900/20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div className="relative">
              <p className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-0.5">
                James 5:16
              </p>
              <p className="text-sm text-white/90 leading-relaxed">
                "The prayer of a righteous person is powerful and effective."
              </p>
            </div>
          </div>
        )}

        {/* ── Loading State ─────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {/* ── Prayer Cards Grid ────────────────────────────── */}
        {!loading && (
          filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-rose-300" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">
                {requests.length === 0 ? 'No prayer requests yet' : 'No requests found'}
              </h3>
              <p className="text-sm text-slate-400">
                {requests.length === 0
                  ? 'Be the first to submit a prayer request.'
                  : `No ${activeTab.toLowerCase() !== 'all' ? activeTab.toLowerCase() + ' ' : ''}prayer requests at the moment.`}
              </p>
              <button
                onClick={() => setShowSubmit(true)}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 px-5 py-2.5 rounded-xl shadow-md shadow-purple-500/25 hover:from-violet-700 hover:to-purple-800 transition-all"
              >
                <Plus className="w-4 h-4" />
                Submit First Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredRequests.map((req) => (
                <PrayerCard
                  key={req.id}
                  prayerReq={req}
                  prayerCounts={prayerCounts}
                  onPray={handlePray}
                  onAddResponse={handleAddResponse}
                  onViewTestimony={handleViewTestimony}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Submit Request Modal ──────────────────────────────── */}
      <SubmitRequestModal
        isOpen={showSubmit}
        onClose={() => setShowSubmit(false)}
        onSave={handleSubmitRequest}
        user={user}
      />

      {/* ── Add Response Modal ────────────────────────────────── */}
      {selectedRequest && (
        <AddResponseModal
          prayerReq={selectedRequest}
          isOpen={showResponse}
          onClose={() => { setShowResponse(false); setSelectedRequest(null) }}
          onSave={handleSaveResponse}
        />
      )}

      {/* ── Testimony Modal ───────────────────────────────────── */}
      {selectedRequest && (
        <TestimonyModal
          prayerReq={requests.find((r) => r.id === selectedRequest.id) || selectedRequest}
          isOpen={showTestimony}
          onClose={() => { setShowTestimony(false); setSelectedRequest(null) }}
        />
      )}
    </div>
  )
}
