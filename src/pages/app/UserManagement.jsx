// ============================================================
// ChurchFlow Liberia — User Management Page
// ============================================================
import { useState, useMemo } from 'react'
import {
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Pencil,
  UserX,
  UserCheck,
  ShieldCheck,
  Shield,
  Mail,
  Clock,
  ChevronDown,
  X,
  Check,
} from 'lucide-react'
import { Button, Badge, Avatar, Modal, Input } from '../../components/ui'
import { MEMBERS } from '../../data/dummyData'
import { formatDate } from '../../utils/helpers'

// ─── Role config ──────────────────────────────────────────────
const ROLE_CONFIG = {
  'Super Admin': { variant: 'danger', icon: ShieldCheck },
  'Church Admin': { variant: 'purple', icon: ShieldCheck },
  Pastor: { variant: 'gold', icon: Shield },
  Treasurer: { variant: 'success', icon: Shield },
  Secretary: { variant: 'info', icon: Shield },
  'Dept Leader': { variant: 'warning', icon: Shield },
  Member: { variant: 'gray', icon: Shield },
}

const ROLES = Object.keys(ROLE_CONFIG)

// ─── Augment MEMBERS with user-account fields ─────────────────
const BASE_USERS = MEMBERS.map((m, i) => ({
  ...m,
  role: i === 0
    ? 'Super Admin'
    : i === 1
    ? 'Church Admin'
    : i === 2
    ? 'Pastor'
    : i === 3
    ? 'Treasurer'
    : i === 4
    ? 'Secretary'
    : i < 8
    ? 'Dept Leader'
    : 'Member',
  status: m.membershipStatus === 'inactive' ? 'Inactive' : 'Active',
  lastLogin:
    i === 0
      ? '2026-05-18T08:30:00'
      : i < 5
      ? '2026-05-17T14:15:00'
      : i < 9
      ? '2026-05-15T09:00:00'
      : '2026-04-20T10:00:00',
}))

// ─── Role Badge ────────────────────────────────────────────────
function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG['Member']
  return <Badge variant={cfg.variant}>{role}</Badge>
}

// ─── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <Badge variant={status === 'Active' ? 'success' : 'gray'} dot>
      {status}
    </Badge>
  )
}

// ─── Relative time formatter ───────────────────────────────────
function relativeTime(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(iso.slice(0, 10))
}

// ─── Row Actions Dropdown ──────────────────────────────────────
function RowActions({ user, onEdit, onToggle }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-xl border border-slate-100 py-1 w-44">
            <button
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => { onEdit(user); setOpen(false) }}
            >
              <Pencil className="w-3.5 h-3.5 text-purple-500" />
              Edit Role
            </button>
            <button
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                user.status === 'Active'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
              onClick={() => { onToggle(user); setOpen(false) }}
            >
              {user.status === 'Active' ? (
                <>
                  <UserX className="w-3.5 h-3.5" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  Activate
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Invite User Modal ─────────────────────────────────────────
function InviteUserModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ email: '', fullName: '', role: 'Member', department: '' })
  const [sent, setSent] = useState(false)
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleSend = () => {
    setSent(true)
    setTimeout(() => {
      setSent(false)
      onClose()
      setForm({ email: '', fullName: '', role: 'Member', department: '' })
    }, 2000)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite New User"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            icon={sent ? Check : Mail}
            onClick={handleSend}
            loading={sent}
          >
            {sent ? 'Invitation Sent!' : 'Send Invite'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
          <p className="text-xs text-purple-700 font-medium">
            The invited user will receive a setup link via email to create their ChurchFlow account.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address *</label>
          <Input
            type="email"
            placeholder="user@example.com"
            value={form.email}
            onChange={set('email')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
          <Input
            placeholder="First and last name"
            value={form.fullName}
            onChange={set('fullName')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
          <select
            value={form.role}
            onChange={set('role')}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Department <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <select
            value={form.department}
            onChange={set('department')}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
          >
            <option value="">No specific department</option>
            {['Choir', 'Ushering', 'Media', 'Youth Ministry', 'Women Ministry', 'Men Ministry', 'Children Ministry', 'Evangelism', 'Prayer Team'].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  )
}

// ─── Edit User Modal ───────────────────────────────────────────
function EditUserModal({ user, isOpen, onClose, onSave }) {
  const [role, setRole] = useState(user?.role || 'Member')
  const [status, setStatus] = useState(user?.status || 'Active')

  if (!user) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit User — ${user.name}`}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { onSave(user.id, role, status); onClose() }}>
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* User info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <Avatar src={user.profilePhoto} name={user.name} size="md" />
          <div>
            <p className="text-sm font-bold text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Current: <RoleBadge role={user.role} />
          </p>
        </div>

        {/* Active / Inactive toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-700">Account Status</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {status === 'Active' ? 'User can log in and access ChurchFlow.' : 'User is blocked from logging in.'}
            </p>
          </div>
          <button
            onClick={() => setStatus(status === 'Active' ? 'Inactive' : 'Active')}
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
              status === 'Active' ? 'bg-gradient-to-r from-violet-600 to-purple-700' : 'bg-slate-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                status === 'Active' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function UserManagement() {
  const [users, setUsers] = useState(BASE_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showInvite, setShowInvite] = useState(false)
  const [editUser, setEditUser] = useState(null)

  // Filter
  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (statusFilter !== 'all' && u.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      }
      return true
    })
  }, [users, search, roleFilter, statusFilter])

  const handleToggle = (user) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
          : u
      )
    )
  }

  const handleSave = (id, role, status) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role, status } : u))
    )
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'Active').length,
    inactive: users.filter((u) => u.status === 'Inactive').length,
    admins: users.filter((u) => ['Super Admin', 'Church Admin'].includes(u.role)).length,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage staff and member accounts across ChurchFlow
            </p>
          </div>
          <Button variant="primary" icon={UserPlus} onClick={() => setShowInvite(true)}>
            Invite User
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.total, color: 'text-purple-700 bg-purple-50 border-purple-100' },
            { label: 'Active', value: stats.active, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
            { label: 'Inactive', value: stats.inactive, color: 'text-slate-600 bg-slate-50 border-slate-200' },
            { label: 'Admins', value: stats.admins, color: 'text-red-700 bg-red-50 border-red-100' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border p-4 ${color}`}>
              <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
              <p className="text-2xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white"
            />
          </div>

          {/* Role filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white font-medium text-slate-700"
            >
              <option value="all">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Clear */}
          {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all') }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}

          <span className="text-xs text-slate-400 ml-auto">
            {filtered.length} of {users.length} users
          </span>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    User
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Role
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Last Login
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Search className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">No users found</p>
                        <p className="text-xs text-slate-400">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Avatar + Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <Avatar src={user.profilePhoto} name={user.name} size="md" />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                user.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-300'
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.department}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4">
                        <a
                          href={`mailto:${user.email}`}
                          className="text-slate-600 hover:text-purple-600 transition-colors truncate block max-w-[200px]"
                        >
                          {user.email}
                        </a>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* Last Login */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                          <span>{relativeTime(user.lastLogin)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditUser(user)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 border border-purple-100 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggle(user)}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors ${
                              user.status === 'Active'
                                ? 'text-red-600 border-red-100 bg-red-50 hover:bg-red-100'
                                : 'text-emerald-700 border-emerald-100 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            {user.status === 'Active' ? (
                              <>
                                <UserX className="w-3 h-3" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3" />
                                Activate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-600">{users.length}</span> users
            </p>
            <div className="flex items-center gap-1">
              {['Active', 'Inactive'].map((s) => (
                <span key={s} className="flex items-center gap-1.5 text-xs text-slate-500 ml-4">
                  <span className={`w-2 h-2 rounded-full ${s === 'Active' ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                  {s}: {users.filter((u) => u.status === s).length}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InviteUserModal isOpen={showInvite} onClose={() => setShowInvite(false)} />
      <EditUserModal
        user={editUser}
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        onSave={handleSave}
      />
    </div>
  )
}
