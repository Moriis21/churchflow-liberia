// ============================================================
// ChurchFlow Liberia — Branches Page
// ============================================================
import { useState } from 'react'
import {
  MapPin,
  Users,
  UserCheck,
  DollarSign,
  Calendar,
  Plus,
  Eye,
  Pencil,
  Building2,
  Clock,
  TrendingUp,
  X,
} from 'lucide-react'
import { Button, Badge, Avatar, Modal, Input } from '../../components/ui'
import { BRANCHES, MEMBERS } from '../../data/dummyData'
import { formatDate, formatCurrency } from '../../utils/helpers'

// ─── Extended branch info (stats not in dummyData) ──────────
const BRANCH_STATS = {
  'branch-001': {
    lastSundayAttendance: 186,
    totalOfferings: 125750,
    currency: 'LRD',
    description:
      'The main campus of Grace Community Church, located in Sinkor, Monrovia. This is the founding branch and home of the senior pastor.',
    recentActivities: [
      { text: 'Mother\'s Day Celebration – 186 attended', date: '2026-05-17', type: 'event' },
      { text: 'Easter Sunday – record attendance 220', date: '2026-04-19', type: 'event' },
      { text: 'New member: Agnes Worjlah joined Youth Ministry', date: '2026-04-06', type: 'member' },
      { text: 'Building fund donation: LRD 25,000', date: '2026-05-10', type: 'finance' },
    ],
    departments: 9,
    color: 'from-violet-600 to-purple-700',
    borderColor: 'border-purple-200',
    accentBg: 'bg-purple-50',
    accentText: 'text-purple-700',
  },
  'branch-002': {
    lastSundayAttendance: 112,
    totalOfferings: 68400,
    currency: 'LRD',
    description:
      'East Branch serves the Paynesville community and surrounding areas. Growing congregation with a strong youth presence.',
    recentActivities: [
      { text: 'Youth fellowship – 48 young people attended', date: '2026-05-10', type: 'event' },
      { text: 'Outreach: Paynesville Waterside', date: '2026-04-27', type: 'outreach' },
      { text: 'New members: 3 joined this month', date: '2026-05-01', type: 'member' },
    ],
    departments: 6,
    color: 'from-amber-500 to-yellow-500',
    borderColor: 'border-amber-200',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-700',
  },
  'branch-003': {
    lastSundayAttendance: 74,
    totalOfferings: 32100,
    currency: 'LRD',
    description:
      'West Branch, Gardnersville — a newer plant established in 2019, growing steadily under Pastor Lydia Pewee\'s leadership.',
    recentActivities: [
      { text: 'Community Health Outreach planned', date: '2026-05-24', type: 'event' },
      { text: 'First Sunday communion service held', date: '2026-05-03', type: 'event' },
      { text: 'Received LRD 15,000 in building fund offerings', date: '2026-04-26', type: 'finance' },
    ],
    departments: 4,
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-200',
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-700',
  },
}

// Activity icon + color
function activityIcon(type) {
  if (type === 'event') return { icon: Calendar, bg: 'bg-purple-100 text-purple-600' }
  if (type === 'member') return { icon: Users, bg: 'bg-blue-100 text-blue-600' }
  if (type === 'finance') return { icon: DollarSign, bg: 'bg-emerald-100 text-emerald-600' }
  return { icon: TrendingUp, bg: 'bg-amber-100 text-amber-600' }
}

// ─── Branch Card ──────────────────────────────────────────────
function BranchCard({ branch, onView, onEdit }) {
  const stats = BRANCH_STATS[branch.id]

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.12)] transition-all duration-300">
      {/* Gradient header */}
      <div className={`relative h-24 bg-gradient-to-br ${stats.color} flex items-end p-5`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-3 right-8 w-20 h-20 rounded-full bg-white blur-xl" />
          <div className="absolute bottom-0 left-1/3 w-16 h-16 rounded-full bg-white blur-lg" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white leading-tight">{branch.name}</h3>
            <div className="flex items-center gap-1 text-white/80 text-xs">
              <MapPin className="w-3 h-3" />
              <span>{branch.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Pastor + Founded */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 ${stats.accentBg} border ${stats.borderColor}`}>
            <p className="text-[11px] font-semibold text-slate-500 mb-1">Senior Pastor</p>
            <p className={`text-sm font-bold ${stats.accentText} truncate`}>{branch.pastor}</p>
          </div>
          <div className="rounded-xl p-3 bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 mb-1">Established</p>
            <p className="text-sm font-bold text-slate-700">{formatDate(branch.established)}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-slate-50">
            <Users className="w-4 h-4 text-purple-500 mx-auto mb-1" />
            <p className="text-lg font-extrabold text-slate-800">{branch.memberCount}</p>
            <p className="text-[10px] text-slate-400 font-medium">Members</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-50">
            <UserCheck className="w-4 h-4 text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-extrabold text-slate-800">{stats.lastSundayAttendance}</p>
            <p className="text-[10px] text-slate-400 font-medium">Last Sunday</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-50">
            <Building2 className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-extrabold text-slate-800">{stats.departments}</p>
            <p className="text-[10px] text-slate-400 font-medium">Departments</p>
          </div>
        </div>

        {/* Offerings badge */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold text-emerald-700">{formatCurrency(stats.totalOfferings, stats.currency)}</span>
            <span className="text-slate-400">monthly offerings</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
          <Button
            size="sm"
            variant="primary"
            icon={Eye}
            className="flex-1"
            onClick={() => onView(branch)}
          >
            View Branch
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={Pencil}
            onClick={() => onEdit(branch)}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Branch Detail Modal ──────────────────────────────────────
function BranchDetailModal({ branch, isOpen, onClose }) {
  if (!branch) return null
  const stats = BRANCH_STATS[branch.id]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={branch.name} size="xl">
      <div className="space-y-6">
        {/* About */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed">{stats.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="purple" dot>{branch.memberCount} Members</Badge>
            <Badge variant="gold">{stats.departments} Departments</Badge>
            <Badge variant="success" dot>Active Branch</Badge>
          </div>
        </div>

        {/* Pastor */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3">Branch Pastor</h4>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stats.color} flex items-center justify-center text-white font-bold text-sm`}>
              {branch.pastor.split(' ').map((w) => w[0]).slice(1, 3).join('')}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{branch.pastor}</p>
              <p className="text-xs text-slate-500">Senior Pastor · {branch.location}</p>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3">Branch Statistics</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Members', value: branch.memberCount, icon: Users, color: 'text-purple-600 bg-purple-50' },
              { label: 'Last Attendance', value: stats.lastSundayAttendance, icon: UserCheck, color: 'text-amber-600 bg-amber-50' },
              { label: 'Monthly Offerings', value: formatCurrency(stats.totalOfferings, stats.currency), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-base font-extrabold text-slate-800">{value}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Location + Founded */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Location</span>
            </div>
            <p className="text-sm font-medium text-slate-700">{branch.location}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Established</span>
            </div>
            <p className="text-sm font-medium text-slate-700">{formatDate(branch.established)}</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3">Recent Activities</h4>
          <div className="space-y-2">
            {stats.recentActivities.map((act, i) => {
              const { icon: Icon, bg } = activityIcon(act.type)
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{act.text}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatDate(act.date)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Edit Branch Modal ────────────────────────────────────────
function EditBranchModal({ branch, isOpen, onClose }) {
  const [form, setForm] = useState(
    branch
      ? { name: branch.name, location: branch.location, pastor: branch.pastor, established: branch.established, description: BRANCH_STATS[branch.id]?.description || '' }
      : {}
  )

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit — ${branch?.name}`}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose}>Save Changes</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Branch Name *</label>
          <Input value={form.name || ''} onChange={set('name')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location *</label>
          <Input placeholder="City, County, Liberia" value={form.location || ''} onChange={set('location')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Senior Pastor</label>
          <Input placeholder="Pastor name..." value={form.pastor || ''} onChange={set('pastor')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Established Date</label>
          <Input type="date" value={form.established || ''} onChange={set('established')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
          <textarea
            rows={3}
            value={form.description || ''}
            onChange={set('description')}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
          />
        </div>
      </div>
    </Modal>
  )
}

// ─── Add Branch Modal ─────────────────────────────────────────
function AddBranchModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', location: '', pastor: '', established: '', description: '' })
  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Branch"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose}>Create Branch</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Branch Name *</label>
          <Input placeholder="e.g. North Branch" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location *</label>
          <Input placeholder="City, County, Liberia" value={form.location} onChange={set('location')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Senior Pastor</label>
          <select
            value={form.pastor}
            onChange={set('pastor')}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
          >
            <option value="">Select pastor...</option>
            {MEMBERS.filter((m) => m.membershipStatus === 'active').map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
            <option value="Pastor John Doe">Pastor John Doe</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Established Date</label>
          <Input type="date" value={form.established} onChange={set('established')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
          <textarea
            rows={3}
            placeholder="Brief description of this branch..."
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
export default function Branches() {
  const [viewBranch, setViewBranch] = useState(null)
  const [editBranch, setEditBranch] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const totalMembers = BRANCHES.reduce((s, b) => s + b.memberCount, 0)
  const totalOfferings = Object.values(BRANCH_STATS).reduce((s, b) => s + b.totalOfferings, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Branches</h1>
            <p className="text-sm text-slate-500 mt-1">
              {BRANCHES.length} active branches across Liberia
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)}>
            Add Branch
          </Button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Branches', value: BRANCHES.length, color: 'text-purple-700 bg-purple-50 border-purple-100' },
            { label: 'Total Members', value: totalMembers, color: 'text-amber-700 bg-amber-50 border-amber-100' },
            { label: 'Combined Offerings', value: `LRD ${totalOfferings.toLocaleString()}`, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
            { label: 'Countries', value: '1 (Liberia)', color: 'text-blue-700 bg-blue-50 border-blue-100' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border p-4 ${color}`}>
              <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
              <p className="text-xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>

        {/* Branch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {BRANCHES.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onView={(b) => setViewBranch(b)}
              onEdit={(b) => setEditBranch(b)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <BranchDetailModal
        branch={viewBranch}
        isOpen={!!viewBranch}
        onClose={() => setViewBranch(null)}
      />
      <EditBranchModal
        branch={editBranch}
        isOpen={!!editBranch}
        onClose={() => setEditBranch(null)}
      />
      <AddBranchModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
