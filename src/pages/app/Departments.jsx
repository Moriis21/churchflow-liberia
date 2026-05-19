// ============================================================
// ChurchFlow Liberia — Departments Page
// ============================================================
import { useState, useEffect } from 'react'
import {
  Music,
  Users,
  Video,
  Zap,
  Heart,
  Shield,
  Baby,
  Globe,
  Hand,
  Plus,
  Eye,
  UserPlus,
  X,
  Loader2,
} from 'lucide-react'
import { Button, Card, Badge, Avatar, Modal, Input } from '../../components/ui'
import { formatDate } from '../../utils/helpers'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import toast from 'react-hot-toast'

// ─── Icon map per department ──────────────────────────────────
const DEPT_ICONS = {
  Choir: Music,
  Ushering: Users,
  Media: Video,
  'Youth Ministry': Zap,
  'Women Ministry': Heart,
  'Men Ministry': Shield,
  'Children Ministry': Baby,
  Evangelism: Globe,
  'Prayer Team': Hand,
}

// ─── Default form ─────────────────────────────────────────────
const EMPTY_FORM = {
  name: '',
  description: '',
  color: '#7C3AED',
}

// ─── Department Card ─────────────────────────────────────────
function DeptCard({ dept, memberCount, onView }) {
  const Icon = DEPT_ICONS[dept.name] || Users

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.12)] transition-all duration-300"
    >
      {/* Colored top border */}
      <div className="h-1.5 w-full" style={{ backgroundColor: dept.color || '#7C3AED' }} />

      <div className="p-5 flex flex-col gap-4">
        {/* Icon + Name */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: (dept.color || '#7C3AED') + '20' }}
          >
            <Icon className="w-5 h-5" style={{ color: dept.color || '#7C3AED' }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-800 truncate">{dept.name}</h3>
            <p className="text-xs text-slate-400 line-clamp-1">{dept.description}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <Badge variant="purple" dot>
            {memberCount} Members
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            icon={Eye}
            onClick={() => onView(dept)}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────
function DeptDetailModal({ dept, members, isOpen, onClose }) {
  const [addMember, setAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')

  if (!dept) return null
  const Icon = DEPT_ICONS[dept.name] || Users
  const deptMembers = members.filter((m) => m.department_id === dept.id)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={dept.name} size="xl">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: (dept.color || '#7C3AED') + '25' }}
          >
            <Icon className="w-6 h-6" style={{ color: dept.color || '#7C3AED' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-600 leading-relaxed">{dept.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="purple" dot>{deptMembers.length} Members</Badge>
              <Badge variant="gold">Active</Badge>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-700">Members ({deptMembers.length})</h4>
            <Button size="sm" variant="secondary" icon={UserPlus} onClick={() => setAddMember(true)}>
              Add Member
            </Button>
          </div>

          {addMember && (
            <div className="flex items-center gap-2 mb-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
              <Input
                placeholder="Search member name..."
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" variant="primary" onClick={() => setAddMember(false)}>Add</Button>
              <button
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                onClick={() => setAddMember(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {deptMembers.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Member</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {deptMembers.map((m) => {
                    const name = m.full_name || m.name || ''
                    const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    return (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <span className="font-medium text-slate-800">{name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              m.membership_status === 'active' || m.membershipStatus === 'active'
                                ? 'success'
                                : m.membership_status === 'new' || m.membershipStatus === 'new'
                                ? 'info'
                                : 'gray'
                            }
                            dot
                          >
                            {m.membership_status || m.membershipStatus || 'active'}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic text-center py-4">
              No members currently listed under this department.
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ─── Add Department Modal ────────────────────────────────────
function AddDeptModal({ isOpen, onClose, onSaved, churchId, branchId, userId }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Department name is required.')
      return
    }
    const churchId_prop = churchId
    if (!churchId_prop) {
      toast.error('Church not configured.')
      return
    }
    setSaving(true)
    // Use SECURITY DEFINER RPC — direct INSERT blocked by RLS
    const { data: newDept, error } = await insforge.database
      .rpc('insert_department', {
        p_church_id:   churchId_prop,
        p_branch_id:   branchId || null,
        p_name:        form.name,
        p_description: form.description,
        p_color:       form.color,
      })
      .select()
      .single()
    setSaving(false)
    if (error) {
      toast.error(error.message || 'Failed to create department.')
      console.error('[AddDept]', error)
      return
    }
    if (newDept) {
      // Generate invitation
      const token = crypto.randomUUID().replace(/-/g, '')
      const baseUrl = window.location.origin
      const inviteLink = `${baseUrl}/department/join?token=${token}`
      await insforge.database.from('department_invitations').insert([{
        church_id: churchId_prop,
        department_id: newDept.id,
        invite_token: token,
        invite_link: inviteLink,
        created_by: userId,
      }])
      onSaved(newDept, inviteLink)
    }
    setForm(EMPTY_FORM)
    onClose()
  }

  const handleClose = () => {
    setForm(EMPTY_FORM)
    onClose()
  }

  const COLOR_SWATCHES = ['#7C3AED', '#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#EF4444', '#06B6D4', '#F97316']

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Department"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>Save Department</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department Name *</label>
          <Input
            placeholder="e.g. Hospitality"
            value={form.name}
            onChange={handleChange('name')}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
          <textarea
            rows={3}
            placeholder="Brief description of this department..."
            value={form.description}
            onChange={handleChange('description')}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Department Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, color: c }))}
                className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Department Invite Modal ──────────────────────────────────
function DeptInviteModal({ data, onClose }) {
  if (!data) return null
  const { dept, inviteLink } = data
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteLink)}&bgcolor=ffffff&color=1E1B4B`

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-[#1E1B4B] text-base">Department Join Link Ready</h3>
            <p className="text-xs text-slate-500 mt-0.5">Share this link for members to join {dept.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-center mb-5">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <img src={qrUrl} alt="QR Code" className="w-40 h-40 rounded-xl" />
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
          <input readOnly value={inviteLink}
            className="flex-1 bg-transparent text-xs text-purple-800 font-mono outline-none truncate" />
          <button
            onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success('Link copied!') }}
            className="flex-shrink-0 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors">
            Copy
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-5">
          <a href={`https://wa.me/?text=${encodeURIComponent('Join our ' + dept.name + ' department: ' + inviteLink)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors">
            <span className="text-xl">💬</span>
            <span className="text-xs font-semibold text-green-700">WhatsApp</span>
          </a>
          <a href={`sms:?body=${encodeURIComponent('Join our ' + dept.name + ' department: ' + inviteLink)}`}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors">
            <span className="text-xl">📱</span>
            <span className="text-xs font-semibold text-blue-700">SMS</span>
          </a>
          <a href={`mailto:?subject=${encodeURIComponent('Join ' + dept.name)}&body=${encodeURIComponent('You are invited to join our ' + dept.name + ' department: ' + inviteLink)}`}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
            <span className="text-xl">✉️</span>
            <span className="text-xs font-semibold text-slate-700">Email</span>
          </a>
        </div>
        <div className="flex gap-3">
          <a href={qrUrl} download={`dept-${dept.name}.png`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            ⬇️ Download QR
          </a>
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-[#1E1B4B] hover:bg-purple-900 text-white rounded-xl text-sm font-semibold transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function Departments() {
  const { user } = useAuth()
  const { church, currentBranch } = useChurch()
  const [departments, setDepartments] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDept, setSelectedDept] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [deptInviteModal, setDeptInviteModal] = useState(null)

  async function loadData() {
    if (!church?.id) return
    setLoading(true)
    const [dRes, mRes] = await Promise.all([
      insforge.database.from('departments').select('*').eq('church_id', church.id).order('name'),
      insforge.database.from('members').select('id, full_name, department_id, membership_status')
        .eq('church_id', church.id).order('full_name'),
    ])
    if (dRes.error) console.error('[Departments]', dRes.error.message)
    if (mRes.error) console.error('[Members]', mRes.error.message)
    setDepartments(dRes.data || [])
    setMembers(mRes.data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [church?.id])

  const getMemberCount = (deptId) => members.filter((m) => m.department_id === deptId).length
  const totalMembers = members.length

  const handleView = (dept) => {
    setSelectedDept(dept)
    setShowDetail(true)
  }

  const largestDept = departments.reduce(
    (max, d) => {
      const count = getMemberCount(d.id)
      return count > max.count ? { name: d.name, count } : max
    },
    { name: '—', count: 0 }
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Departments</h1>
            <p className="text-sm text-slate-500 mt-1">
              {loading
                ? 'Loading departments...'
                : `Manage all church departments — ${departments.length} departments, ${totalMembers} total members`}
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)}>
            Add Department
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Departments', value: departments.length, color: 'text-purple-700 bg-purple-50 border-purple-100' },
                { label: 'Total Members', value: totalMembers, color: 'text-amber-700 bg-amber-50 border-amber-100' },
                {
                  label: 'Avg Members / Dept',
                  value: departments.length > 0 ? Math.round(totalMembers / departments.length) : 0,
                  color: 'text-blue-700 bg-blue-50 border-blue-100',
                },
                {
                  label: 'Largest Dept',
                  value: largestDept.count > 0 ? `${largestDept.name} (${largestDept.count})` : '—',
                  color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
                },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-2xl border p-4 ${color}`}>
                  <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
                  <p className="text-xl font-extrabold">{value}</p>
                </div>
              ))}
            </div>

            {/* Departments Grid or Empty State */}
            {departments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-base font-bold text-slate-700 mb-1">No departments created yet</h3>
                <p className="text-sm text-slate-400">Create your first department to organize church ministry.</p>
                <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)} className="mt-4">
                  Add Department
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {departments.map((dept) => (
                  <DeptCard
                    key={dept.id}
                    dept={dept}
                    memberCount={getMemberCount(dept.id)}
                    onView={handleView}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <DeptDetailModal
        dept={selectedDept}
        members={members}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />

      {/* Add Department Modal */}
      <AddDeptModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={(newDept, inviteLink) => {
          loadData()
          if (inviteLink) setDeptInviteModal({ dept: newDept, inviteLink })
          toast.success(`${newDept.name} department created!`)
        }}
        churchId={church?.id}
        branchId={currentBranch?.id}
        userId={user?.id}
      />

      {/* Department Invite Modal */}
      {deptInviteModal && <DeptInviteModal data={deptInviteModal} onClose={() => setDeptInviteModal(null)} />}
    </div>
  )
}
