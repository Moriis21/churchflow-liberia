// ============================================================
// ChurchFlow Liberia — Members Management Page
// ============================================================
import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Cross,
  LayoutGrid,
  List,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Camera,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import {
  Button,
  Card,
  Badge,
  Avatar,
  Input,
  Modal,
  StatsCard,
  EmptyState,
} from '../../components/ui'
import {
  formatDate,
  getInitials,
  getStatusColor,
  formatPhone,
  calculateAge,
} from '../../utils/helpers'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'

// ─── Constants ───────────────────────────────────────────────
const PAGE_SIZE = 10

const STATUS_OPTIONS = ['active', 'inactive', 'new']
const GENDER_OPTIONS = ['male', 'female']
const MARITAL_OPTIONS = ['single', 'married', 'widowed', 'divorced']

// ─── Blank form state ─────────────────────────────────────────
const blankForm = {
  name: '',
  gender: 'male',
  phone: '',
  email: '',
  address: '',
  dateOfBirth: '',
  department: '',
  membershipStatus: 'active',
  baptismStatus: false,
  maritalStatus: 'single',
  emergencyContact: '',
  notes: '',
  profilePhoto: '',
}

// ─── Toast component ──────────────────────────────────────────
function Toast({ message, type, onClose }) {
  return (
    <div
      className={[
        'fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl',
        'animate-[slideUp_0.3s_ease-out]',
        type === 'success'
          ? 'bg-emerald-600 text-white'
          : 'bg-red-600 text-white',
      ].join(' ')}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" style={{ width: '1.1rem', height: '1.1rem' }} />
      ) : (
        <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" style={{ width: '1.1rem', height: '1.1rem' }} />
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── Status badge helper ──────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active: 'success',
    inactive: 'gray',
    new: 'info',
  }
  return (
    <Badge variant={map[status] || 'gray'} dot>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

// ─── Member Form (reused in Add & Edit modals) ────────────────
function MemberForm({ form, onChange, errors, deptNames = [] }) {
  const fileRef = useRef(null)

  const handleField = (key) => (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    onChange({ ...form, [key]: value })
  }

  return (
    <div className="space-y-5">
      {/* Photo upload */}
      <div className="flex flex-col items-center gap-3 pb-2">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-dashed border-purple-300 flex items-center justify-center">
            {form.profilePhoto ? (
              <img
                src={form.profilePhoto}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-purple-400">
                {form.name ? getInitials(form.name) : '?'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md hover:bg-purple-700 transition-colors"
            title="Upload photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const url = URL.createObjectURL(file)
              onChange({ ...form, profilePhoto: url })
            }
          }}
        />
        <p className="text-xs text-slate-400">Click camera icon to upload photo</p>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Full Name"
            required
            value={form.name}
            onChange={handleField('name')}
            placeholder="e.g. James Kollie"
            error={errors?.name}
          />
        </div>

        {/* Gender radio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Gender
          </label>
          <div className="flex gap-5 mt-1">
            {GENDER_OPTIONS.map((g) => (
              <label
                key={g}
                className="flex items-center gap-2 cursor-pointer text-sm text-slate-700"
              >
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={form.gender === g}
                  onChange={handleField('gender')}
                  className="accent-purple-600 w-4 h-4"
                />
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Marital Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Marital Status
          </label>
          <select
            value={form.maritalStatus}
            onChange={handleField('maritalStatus')}
            className="w-full rounded-xl border border-slate-200 text-sm text-slate-800 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-slate-300 transition-all"
          >
            {MARITAL_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone"
          required
          value={form.phone}
          onChange={handleField('phone')}
          placeholder="+231-770-000-000"
          error={errors?.phone}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={handleField('email')}
          placeholder="email@example.com"
        />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          type="date"
          value={form.dateOfBirth}
          onChange={handleField('dateOfBirth')}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Department</label>
          <select
            value={form.department}
            onChange={handleField('department')}
            className="w-full rounded-xl border border-slate-200 text-sm text-slate-800 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-slate-300 transition-all"
          >
            <option value="">— Select Department —</option>
            {deptNames.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Membership Status</label>
          <select
            value={form.membershipStatus}
            onChange={handleField('membershipStatus')}
            className="w-full rounded-xl border border-slate-200 text-sm text-slate-800 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-slate-300 transition-all"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Baptism */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Baptism</label>
          <label className="flex items-center gap-3 cursor-pointer mt-1">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.baptismStatus}
                onChange={handleField('baptismStatus')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-purple-600 transition-colors" />
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm text-slate-700">
              {form.baptismStatus ? 'Baptized' : 'Not baptized'}
            </span>
          </label>
        </div>
      </div>

      {/* Address */}
      <Input
        label="Address"
        value={form.address}
        onChange={handleField('address')}
        placeholder="e.g. Sinkor, Monrovia, Liberia"
      />

      {/* Emergency Contact */}
      <Input
        label="Emergency Contact"
        value={form.emergencyContact}
        onChange={handleField('emergencyContact')}
        placeholder="Name — Phone"
      />

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Notes</label>
        <textarea
          value={form.notes}
          onChange={handleField('notes')}
          placeholder="Any additional notes about this member..."
          rows={3}
          className="w-full rounded-xl border border-slate-200 text-sm text-slate-800 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-slate-300 transition-all resize-none"
        />
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────
function DeleteConfirmModal({ member, onConfirm, onCancel }) {
  return (
    <Modal isOpen={!!member} onClose={onCancel} title="Delete Member" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-800">{member?.name || member?.full_name}</span>? This
          action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            Delete Member
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Grid Card ────────────────────────────────────────────────
function MemberCard({ member, onView, onEdit, onDelete }) {
  const deptColors = {
    Choir: 'bg-violet-100 text-violet-700',
    Ushering: 'bg-amber-100 text-amber-700',
    Media: 'bg-blue-100 text-blue-700',
    'Youth Ministry': 'bg-pink-100 text-pink-700',
    'Women Ministry': 'bg-orange-100 text-orange-700',
    'Men Ministry': 'bg-cyan-100 text-cyan-700',
    'Children Ministry': 'bg-emerald-100 text-emerald-700',
    Evangelism: 'bg-red-100 text-red-700',
    'Prayer Team': 'bg-indigo-100 text-indigo-700',
  }
  const mName = member.name || member.full_name || '—'
  const mDept = member.department || member.departments?.name || ''
  const mStatus = member.membershipStatus || member.membership_status || 'active'
  const deptClass = deptColors[mDept] || 'bg-slate-100 text-slate-700'

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.12)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Card top gradient strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 to-purple-700" />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Avatar + name */}
        <div className="flex items-start gap-3">
          <Avatar src={member.profilePhoto || member.profile_photo} name={mName} size="lg" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800 truncate">{mName}</h3>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">{member.gender}</p>
            <div className="mt-1.5">
              <StatusBadge status={mStatus} />
            </div>
          </div>
        </div>

        {/* Dept badge */}
        {mDept && (
          <span
            className={[
              'self-start inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
              deptClass,
            ].join(' ')}
          >
            {mDept}
          </span>
        )}

        {/* Contact */}
        <div className="space-y-1.5 text-xs text-slate-500">
          {member.phone && (
            <div className="flex items-center gap-2 truncate">
              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span className="truncate">{formatPhone(member.phone)}</span>
            </div>
          )}
          {member.email && (
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Eye}
            onClick={() => onView(member)}
            className="flex-1"
          >
            View
          </Button>
          <button
            onClick={() => onEdit(member)}
            className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(member)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Table Row ────────────────────────────────────────────────
function MemberRow({ member, onView, onEdit, onDelete }) {
  const mName = member.name || member.full_name || '—'
  const mDept = member.department || member.departments?.name || ''
  const mStatus = member.membershipStatus || member.membership_status || 'active'
  const mJoinDate = member.joinDate || member.join_date || ''
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      {/* Name + Avatar */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Avatar src={member.profilePhoto || member.profile_photo} name={mName} size="sm" />
          <div>
            <p className="text-sm font-semibold text-slate-800">{mName}</p>
            <p className="text-xs text-slate-400 capitalize">{member.gender}</p>
          </div>
        </div>
      </td>

      {/* Department */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-xs text-slate-600">{mDept || '—'}</span>
      </td>

      {/* Phone */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-xs text-slate-600">{formatPhone(member.phone)}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge status={mStatus} />
      </td>

      {/* Join Date */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-xs text-slate-500">{formatDate(mJoinDate)}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(member)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            title="View Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(member)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(member)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Pagination ───────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPage(1)}
            className="min-w-[2rem] h-8 px-2 rounded-lg text-sm text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className="text-slate-400 text-sm px-1">…</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={[
            'min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors',
            p === page
              ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-sm shadow-purple-500/25'
              : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50',
          ].join(' ')}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-slate-400 text-sm px-1">…</span>
          )}
          <button
            onClick={() => onPage(totalPages)}
            className="min-w-[2rem] h-8 px-2 rounded-lg text-sm text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────
export default function Members() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // ── State ────────────────────────────────────────────────────
  const [members, setMembers] = useState([])
  const [departments, setDepartments] = useState([])
  const [dbLoading, setDbLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [page, setPage] = useState(1)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [deleteMember, setDeleteMember] = useState(null)

  const [form, setForm] = useState(blankForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // ── Load members + departments from InsForge ──────────────────
  useEffect(() => {
    async function load() {
      try {
        const [mRes, dRes] = await Promise.all([
          insforge.database
            .from('members')
            .select('*, departments(name, color)')
            .order('full_name', { ascending: true }),
          insforge.database
            .from('departments')
            .select('id, name, color')
            .order('name', { ascending: true }),
        ])
        setMembers(mRes.data || [])
        setDepartments(dRes.data || [])
      } catch (err) {
        console.error('Members load error:', err)
      } finally {
        setDbLoading(false)
      }
    }
    load()
  }, [])

  // ── Derived dept names for dropdowns ─────────────────────────
  const deptNames = useMemo(() => departments.map((d) => d.name), [departments])

  // ── Derived stats ─────────────────────────────────────────────
  const totalCount = members.length
  const activeCount = members.filter((m) => (m.membershipStatus || m.membership_status) === 'active').length
  const newThisMonth = useMemo(() => {
    const now = new Date()
    return members.filter((m) => {
      const jd = m.joinDate || m.join_date
      if (!jd) return false
      const d = new Date(jd + 'T00:00:00')
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
  }, [members])
  const baptizedCount = members.filter((m) => m.baptismStatus || m.baptism_status).length

  // ── Filtered + paginated ──────────────────────────────────────
  const filtered = useMemo(() => {
    return members.filter((m) => {
      const q = searchTerm.toLowerCase()
      const mName = m.name || m.full_name || ''
      const mDept = m.department || m.departments?.name || ''
      const mStatus = m.membershipStatus || m.membership_status || ''
      const mGender = m.gender || ''
      const matchSearch =
        !q ||
        mName.toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.phone || '').includes(q) ||
        mDept.toLowerCase().includes(q)
      const matchDept = !filterDept || mDept === filterDept
      const matchStatus = !filterStatus || mStatus === filterStatus
      const matchGender = !filterGender || mGender === filterGender
      return matchSearch && matchDept && matchStatus && matchGender
    })
  }, [members, searchTerm, filterDept, filterStatus, filterGender])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // ── Reset page on filter change ───────────────────────────────
  const handleSearch = (val) => { setSearchTerm(val); setPage(1) }
  const handleDept = (val) => { setFilterDept(val); setPage(1) }
  const handleStatus = (val) => { setFilterStatus(val); setPage(1) }
  const handleGender = (val) => { setFilterGender(val); setPage(1) }

  // ── Toast helper ──────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Open Add modal ────────────────────────────────────────────
  const handleOpenAdd = () => {
    setForm(blankForm)
    setFormErrors({})
    setShowAddModal(true)
  }

  // ── Open Edit modal ───────────────────────────────────────────
  const handleOpenEdit = (member) => {
    setForm({
      name: member.name || member.full_name || '',
      gender: member.gender || 'male',
      phone: member.phone || '',
      email: member.email || '',
      address: member.address || '',
      dateOfBirth: member.dateOfBirth || member.date_of_birth || '',
      department: member.department || member.departments?.name || '',
      membershipStatus: member.membershipStatus || member.membership_status || 'active',
      baptismStatus: member.baptismStatus ?? member.baptism_status ?? false,
      maritalStatus: member.maritalStatus || member.marital_status || 'single',
      emergencyContact: member.emergencyContact || member.emergency_contact || '',
      notes: member.notes || '',
      profilePhoto: member.profilePhoto || member.profile_photo || '',
    })
    setFormErrors({})
    setEditMember(member)
  }

  // ── Validate form ─────────────────────────────────────────────
  const validate = (f) => {
    const errs = {}
    if (!f.name.trim()) errs.name = 'Full name is required'
    if (!f.phone.trim()) errs.phone = 'Phone number is required'
    return errs
  }

  // ── Save (Add) ────────────────────────────────────────────────
  const handleSaveAdd = async () => {
    const errs = validate(form)
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      const churchId = user?.churchId || user?.profile?.church_id
      const { data, error } = await insforge.database
        .from('members')
        .insert([{
          church_id: churchId,
          full_name: form.name,
          gender: form.gender,
          phone: form.phone,
          email: form.email,
          address: form.address,
          date_of_birth: form.dateOfBirth || null,
          membership_status: form.membershipStatus || 'active',
          baptism_status: form.baptismStatus || false,
          marital_status: form.maritalStatus,
          join_date: new Date().toISOString().split('T')[0],
          notes: form.notes,
          emergency_contact: form.emergencyContact,
        }])
        .select()
        .single()

      if (error) throw error

      if (data) {
        setMembers((prev) => [data, ...prev])
        showToast(`${form.name} has been added successfully.`)
      }
    } catch (err) {
      // Fallback: add locally so UI stays consistent
      const newMember = {
        ...form,
        id: `mem-${Date.now()}`,
        full_name: form.name,
        join_date: new Date().toISOString().split('T')[0],
        church_id: user?.churchId || user?.profile?.church_id || 'church-001',
      }
      setMembers((prev) => [newMember, ...prev])
      showToast(`${form.name} added (offline).`)
      console.error('Insert member error:', err)
    } finally {
      setSaving(false)
      setShowAddModal(false)
    }
  }

  // ── Save (Edit) ───────────────────────────────────────────────
  const handleSaveEdit = async () => {
    const errs = validate(form)
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      const { data, error } = await insforge.database
        .from('members')
        .update({
          full_name: form.name,
          gender: form.gender,
          phone: form.phone,
          email: form.email,
          address: form.address,
          date_of_birth: form.dateOfBirth || null,
          membership_status: form.membershipStatus || 'active',
          baptism_status: form.baptismStatus || false,
          marital_status: form.maritalStatus,
          notes: form.notes,
          emergency_contact: form.emergencyContact,
        })
        .eq('id', editMember.id)
        .select()
        .single()

      if (error) throw error

      setMembers((prev) =>
        prev.map((m) => (m.id === editMember.id ? { ...m, ...(data || form) } : m))
      )
      showToast(`${form.name}'s profile has been updated.`)
    } catch (err) {
      setMembers((prev) =>
        prev.map((m) => (m.id === editMember.id ? { ...m, ...form } : m))
      )
      showToast(`${form.name}'s profile updated (offline).`)
      console.error('Update member error:', err)
    } finally {
      setSaving(false)
      setEditMember(null)
    }
  }

  // ── Delete ────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    const memberName = deleteMember.name || deleteMember.full_name || 'Member'
    try {
      const { error } = await insforge.database
        .from('members')
        .delete()
        .eq('id', deleteMember.id)
      if (error) throw error
    } catch (err) {
      console.error('Delete member error:', err)
    }
    setMembers((prev) => prev.filter((m) => m.id !== deleteMember.id))
    showToast(`${memberName} has been removed.`, 'success')
    setDeleteMember(null)
  }

  // ── View profile ──────────────────────────────────────────────
  const handleView = (member) => {
    navigate(`/app/members/${member.id}`)
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Page Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Members
            </h1>
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-sm shadow-purple-500/25">
              {totalCount}
            </span>
          </div>
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={handleOpenAdd}
          >
            Add Member
          </Button>
        </div>

        {/* ── Stats Row ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Total Members"
            value={totalCount}
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="Active Members"
            value={activeCount}
            icon={UserCheck}
            color="green"
          />
          <StatsCard
            title="New This Month"
            value={newThisMonth}
            icon={UserPlus}
            color="gold"
          />
          <StatsCard
            title="Baptized Members"
            value={baptizedCount}
            icon={Users}
            color="navy"
          />
        </div>

        {/* ── Filters + View Toggle ────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, phone, email, department…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-slate-300 transition-all"
              />
            </div>

            {/* Dept filter */}
            <select
              value={filterDept}
              onChange={(e) => handleDept(e.target.value)}
              className="rounded-xl border border-slate-200 text-sm text-slate-700 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-slate-300 transition-all min-w-[160px]"
            >
              <option value="">All Departments</option>
              {deptNames.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => handleStatus(e.target.value)}
              className="rounded-xl border border-slate-200 text-sm text-slate-700 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-slate-300 transition-all min-w-[140px]"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            {/* Gender filter */}
            <select
              value={filterGender}
              onChange={(e) => handleGender(e.target.value)}
              className="rounded-xl border border-slate-200 text-sm text-slate-700 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-slate-300 transition-all min-w-[130px]"
            >
              <option value="">All Genders</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={[
                  'p-2 rounded-lg transition-all',
                  viewMode === 'grid'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600',
                ].join(' ')}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={[
                  'p-2 rounded-lg transition-all',
                  viewMode === 'table'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600',
                ].join(' ')}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Clear filters */}
            {(searchTerm || filterDept || filterStatus || filterGender) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterDept('')
                  setFilterStatus('')
                  setFilterGender('')
                  setPage(1)
                }}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Result count */}
          <div className="mt-3 text-xs text-slate-400">
            Showing{' '}
            <span className="font-semibold text-slate-600">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-600">{totalCount}</span> members
          </div>
        </div>

        {/* ── Members Grid / Table ─────────────────────────── */}
        {filtered.length === 0 ? (
          <EmptyState
            title="No members found"
            description="Try adjusting your search or filter criteria, or add a new member to get started."
            action={
              <Button variant="primary" icon={UserPlus} onClick={handleOpenAdd}>
                Add First Member
              </Button>
            }
          />
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onView={handleView}
                  onEdit={handleOpenEdit}
                  onDelete={setDeleteMember}
                />
              ))}
            </div>
            <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50">
                    {['Member', 'Department', 'Phone', 'Status', 'Join Date', 'Actions'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      onView={handleView}
                      onEdit={handleOpenEdit}
                      onDelete={setDeleteMember}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100">
              <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
            </div>
          </div>
        )}
      </div>

      {/* ── Add Member Modal ────────────────────────────────── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Member"
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={saving}
              onClick={handleSaveAdd}
            >
              Save Member
            </Button>
          </div>
        }
      >
        <MemberForm form={form} onChange={setForm} errors={formErrors} deptNames={deptNames} />
      </Modal>

      {/* ── Edit Member Modal ───────────────────────────────── */}
      <Modal
        isOpen={!!editMember}
        onClose={() => setEditMember(null)}
        title={`Edit — ${editMember?.name || ''}`}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setEditMember(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={saving}
              onClick={handleSaveEdit}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <MemberForm form={form} onChange={setForm} errors={formErrors} deptNames={deptNames} />
      </Modal>

      {/* ── Delete Confirm ──────────────────────────────────── */}
      <DeleteConfirmModal
        member={deleteMember}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteMember(null)}
      />

      {/* ── Toast ───────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
