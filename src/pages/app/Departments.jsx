// ============================================================
// ChurchFlow Liberia — Departments Page
// ============================================================
import { useState } from 'react'
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
} from 'lucide-react'
import { Button, Card, Badge, Avatar, Modal, Input } from '../../components/ui'
import { DEPARTMENTS, MEMBERS } from '../../data/dummyData'
import { formatDate } from '../../utils/helpers'

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

// ─── Attendance stub per department ──────────────────────────
const DEPT_ATTENDANCE = {
  'dept-001': [
    { date: '2026-05-17', present: 24, total: 28 },
    { date: '2026-05-10', present: 22, total: 28 },
    { date: '2026-05-03', present: 26, total: 28 },
  ],
  'dept-002': [
    { date: '2026-05-17', present: 13, total: 15 },
    { date: '2026-05-10', present: 12, total: 15 },
    { date: '2026-05-03', present: 15, total: 15 },
  ],
  'dept-003': [
    { date: '2026-05-17', present: 7, total: 8 },
    { date: '2026-05-10', present: 6, total: 8 },
    { date: '2026-05-03', present: 8, total: 8 },
  ],
  'dept-004': [
    { date: '2026-05-17', present: 38, total: 45 },
    { date: '2026-05-10', present: 35, total: 45 },
    { date: '2026-05-03', present: 40, total: 45 },
  ],
  'dept-005': [
    { date: '2026-05-17', present: 30, total: 38 },
    { date: '2026-05-10', present: 32, total: 38 },
    { date: '2026-05-03', present: 35, total: 38 },
  ],
  'dept-006': [
    { date: '2026-05-17', present: 25, total: 32 },
    { date: '2026-05-10', present: 27, total: 32 },
    { date: '2026-05-03', present: 28, total: 32 },
  ],
  'dept-007': [
    { date: '2026-05-17', present: 44, total: 52 },
    { date: '2026-05-10', present: 46, total: 52 },
    { date: '2026-05-03', present: 48, total: 52 },
  ],
  'dept-008': [
    { date: '2026-05-17', present: 16, total: 20 },
    { date: '2026-05-10', present: 18, total: 20 },
    { date: '2026-05-03', present: 15, total: 20 },
  ],
  'dept-009': [
    { date: '2026-05-17', present: 14, total: 18 },
    { date: '2026-05-10', present: 15, total: 18 },
    { date: '2026-05-03', present: 16, total: 18 },
  ],
}

// ─── Default form ─────────────────────────────────────────────
const EMPTY_FORM = {
  name: '',
  leader: '',
  description: '',
  color: '#7C3AED',
}

// ─── Department Card ─────────────────────────────────────────
function DeptCard({ dept, onView }) {
  const Icon = DEPT_ICONS[dept.name] || Users
  const leader = MEMBERS.find((m) => m.name === dept.leader)

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.12)] transition-all duration-300"
    >
      {/* Colored top border */}
      <div className="h-1.5 w-full" style={{ backgroundColor: dept.color }} />

      <div className="p-5 flex flex-col gap-4">
        {/* Icon + Name */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: dept.color + '20' }}
          >
            <Icon className="w-5 h-5" style={{ color: dept.color }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-800 truncate">{dept.name}</h3>
            <p className="text-xs text-slate-400 line-clamp-1">{dept.description}</p>
          </div>
        </div>

        {/* Leader */}
        <div className="flex items-center gap-2.5">
          <Avatar
            src={leader?.profilePhoto}
            name={dept.leader}
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">{dept.leader}</p>
            <p className="text-[11px] text-slate-400">Department Leader</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <Badge variant="purple" dot>
            {dept.memberCount} Members
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
function DeptDetailModal({ dept, isOpen, onClose }) {
  const [addMember, setAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')

  if (!dept) return null
  const Icon = DEPT_ICONS[dept.name] || Users
  const deptMembers = MEMBERS.filter((m) => m.department === dept.name)
  const leader = MEMBERS.find((m) => m.name === dept.leader)
  const attendance = DEPT_ATTENDANCE[dept.id] || []

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={dept.name} size="xl">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: dept.color + '25' }}
          >
            <Icon className="w-6 h-6" style={{ color: dept.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-600 leading-relaxed">{dept.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="purple" dot>{dept.memberCount} Members</Badge>
              <Badge variant="gold">Active</Badge>
            </div>
          </div>
        </div>

        {/* Leader */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3">Department Leader</h4>
          {leader ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
              <Avatar src={leader.profilePhoto} name={leader.name} size="md" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{leader.name}</p>
                <p className="text-xs text-slate-500">{leader.phone} · {leader.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Leader not found in members list.</p>
          )}
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
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Phone</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Role</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {deptMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={m.profilePhoto} name={m.name} size="sm" />
                          <span className="font-medium text-slate-800">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{m.phone}</td>
                      <td className="px-4 py-3">
                        {m.name === dept.leader ? (
                          <Badge variant="gold">Leader</Badge>
                        ) : (
                          <Badge variant="gray">Member</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            m.membershipStatus === 'active'
                              ? 'success'
                              : m.membershipStatus === 'new'
                              ? 'info'
                              : 'gray'
                          }
                          dot
                        >
                          {m.membershipStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic text-center py-4">
              No members currently listed under this department.
            </p>
          )}
        </div>

        {/* Recent Attendance */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3">Recent Attendance</h4>
          <div className="space-y-2">
            {attendance.map((a, i) => {
              const pct = Math.round((a.present / a.total) * 100)
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">{formatDate(a.date)}</span>
                      <span className="text-xs font-bold text-slate-800">{a.present}/{a.total}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: dept.color }}
                      />
                    </div>
                  </div>
                  <Badge
                    variant={pct >= 80 ? 'success' : pct >= 60 ? 'warning' : 'danger'}
                    size="sm"
                  >
                    {pct}%
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Add Department Modal ────────────────────────────────────
function AddDeptModal({ isOpen, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = () => {
    // UI only – no backend
    onClose()
    setForm(EMPTY_FORM)
  }

  const COLOR_SWATCHES = ['#7C3AED', '#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#EF4444', '#06B6D4', '#F97316']

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Department"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Save Department</Button>
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
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Leader Name *</label>
          <select
            value={form.leader}
            onChange={handleChange('leader')}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
          >
            <option value="">Select leader...</option>
            {MEMBERS.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
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

// ─── Main Page ────────────────────────────────────────────────
export default function Departments() {
  const [selectedDept, setSelectedDept] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  const handleView = (dept) => {
    setSelectedDept(dept)
    setShowDetail(true)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Departments</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage all church departments — {DEPARTMENTS.length} departments,{' '}
              {DEPARTMENTS.reduce((s, d) => s + d.memberCount, 0)} total members
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)}>
            Add Department
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Departments', value: DEPARTMENTS.length, color: 'text-purple-700 bg-purple-50 border-purple-100' },
            { label: 'Total Members', value: DEPARTMENTS.reduce((s, d) => s + d.memberCount, 0), color: 'text-amber-700 bg-amber-50 border-amber-100' },
            { label: 'Avg Members / Dept', value: Math.round(DEPARTMENTS.reduce((s, d) => s + d.memberCount, 0) / DEPARTMENTS.length), color: 'text-blue-700 bg-blue-50 border-blue-100' },
            { label: 'Largest Dept', value: 'Children (52)', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border p-4 ${color}`}>
              <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
              <p className="text-xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEPARTMENTS.map((dept) => (
            <DeptCard key={dept.id} dept={dept} onView={handleView} />
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <DeptDetailModal
        dept={selectedDept}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />

      {/* Add Department Modal */}
      <AddDeptModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
