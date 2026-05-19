// ============================================================
// ChurchFlow Liberia — User Management Page
// ============================================================
import { useState, useEffect, useMemo } from 'react'
import {
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  UserX,
  UserCheck,
  Pencil,
  Clock,
  ChevronDown,
  X,
  Users,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react'
import { Button, Badge, Avatar, Modal, Input } from '../../components/ui'
import { addApiKey } from '../../services/profilePhoto'
import { insforge } from '../../lib/insforge'
import { formatDate } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import { sendPasswordResetEmail, canResetPassword } from '../../services/passwordReset'
import toast from 'react-hot-toast'

// ─── Role config ──────────────────────────────────────────────
// ALL roles (used by super admin only)
const ROLE_CONFIG_ALL = {
  super_admin:   { label: 'Super Admin',     variant: 'danger',   icon: ShieldCheck },
  church_admin:  { label: 'Church Admin',    variant: 'purple',   icon: ShieldCheck },
  pastor:        { label: 'Pastor',          variant: 'gold',     icon: Shield },
  treasurer:     { label: 'Treasurer',       variant: 'success',  icon: Shield },
  secretary:     { label: 'Secretary',       variant: 'info',     icon: Shield },
  dept_leader:   { label: 'Dept Leader',     variant: 'warning',  icon: Shield },
  member:        { label: 'Member',          variant: 'gray',     icon: Shield },
}

// Church-level roles (visible to pastors / church admins)
const ROLE_CONFIG_CHURCH = {
  church_admin:  { label: 'Church Admin',    variant: 'purple',   icon: ShieldCheck },
  pastor:        { label: 'Pastor',          variant: 'gold',     icon: Shield },
  treasurer:     { label: 'Treasurer',       variant: 'success',  icon: Shield },
  secretary:     { label: 'Secretary',       variant: 'info',     icon: Shield },
  dept_leader:   { label: 'Dept Leader',     variant: 'warning',  icon: Shield },
  member:        { label: 'Member',          variant: 'gray',     icon: Shield },
}

// Use the right config based on viewer's role (set later via hook)
let ROLE_CONFIG = ROLE_CONFIG_CHURCH
const ROLES = Object.keys(ROLE_CONFIG_ALL)

// ─── Role Badge ────────────────────────────────────────────────
function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG['member']
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

// ─── Status Badge ──────────────────────────────────────────────
function StatusBadge({ isActive }) {
  return (
    <Badge variant={isActive ? 'success' : 'gray'} dot>
      {isActive ? 'Active' : 'Inactive'}
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

// ─── Invite User Modal ─────────────────────────────────────────
function InviteUserModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite New User"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 flex items-start gap-3">
          <LinkIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-purple-800 mb-1">Use the Church Invite Link</p>
            <p className="text-sm text-purple-700">
              New users are invited by sharing your church's unique invite link. You can find and manage the invite link in{' '}
              <strong>Settings → Church Settings → Invite Link</strong>.
            </p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-500 leading-relaxed">
            Once a user signs up via the invite link, they will appear here. You can then assign or change their role and activate or deactivate their account.
          </p>
        </div>
      </div>
    </Modal>
  )
}

// ─── Edit User Modal ───────────────────────────────────────────
function EditUserModal({ user, isOpen, onClose, onSave, roleConfig = ROLE_CONFIG_CHURCH }) {
  const [role, setRole] = useState(user?.role || 'member')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      setRole(user.role || 'member')
      setError(null)
    }
  }, [user])

  if (!user) return null

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    // SECURITY DEFINER RPC — direct .update() fails because InsForge
    // browser SDK doesn't forward JWT to PostgREST DB requests
    const { error: err } = await insforge.database
      .rpc('update_user_role', { p_user_id: user.id, p_role: role })
    setSaving(false)
    if (err) { setError(err.message); return }
    onSave(user.id, { role })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit User — ${user.full_name || 'User'}`}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>
        )}

        {/* User info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <Avatar name={user.full_name} size="md" />
          <div>
            <p className="text-sm font-bold text-slate-800">{user.full_name || '—'}</p>
            <p className="text-xs text-slate-500">{user.churches?.name || '—'}</p>
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
            {Object.entries(roleConfig).map(([r, cfg]) => (
              <option key={r} value={r}>{cfg.label}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            Current: <RoleBadge role={user.role} />
          </p>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function UserManagement() {
  const { user: currentUser, isSuperAdmin } = useAuth()
  const { church } = useChurch()
  // Only super admin can see / assign platform-level roles
  const ROLE_CONFIG = isSuperAdmin ? ROLE_CONFIG_ALL : ROLE_CONFIG_CHURCH
  const VISIBLE_ROLES = Object.keys(ROLE_CONFIG)

  const [users, setUsers] = useState([])
  const [resettingEmail, setResettingEmail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showInvite, setShowInvite] = useState(false)
  const [editUser, setEditUser] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        if (isSuperAdmin) {
          // Super Admin: fetch ALL platform users via SECURITY DEFINER RPC
          const { data, error } = await insforge.database
            .rpc('get_all_platform_users')
          if (error) throw error
          setUsers(Array.isArray(data) ? data : [])
        } else {
          // Church Admin / Pastor: fetch ONLY users from their church
          const churchId = currentUser?.profile?.church_id || church?.id
          if (!churchId) { setUsers([]); return }
          const { data, error } = await insforge.database
            .rpc('get_church_users', { p_church_id: churchId })
          if (error) throw error
          // Exclude platform-level roles from church panel
          const churchData = Array.isArray(data)
            ? data.filter(u => !['super_admin'].includes(u.role))
            : []
          setUsers(churchData)
        }
      } catch (err) {
        console.error('[UserManagement]', err.message)
        toast.error('Failed to load users.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isSuperAdmin, church?.id])

  // Filter
  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (statusFilter !== 'all') {
        const active = statusFilter === 'active'
        if (u.is_active !== active) return false
      }
      if (search) {
        const q = search.toLowerCase()
        return (u.full_name || '').toLowerCase().includes(q)
      }
      return true
    })
  }, [users, search, roleFilter, statusFilter])

  const handleToggleActive = async (user) => {
    const newActive = !user.is_active
    // SECURITY DEFINER RPC — direct .update() fails due to InsForge JWT issue
    const { error } = await insforge.database
      .rpc('toggle_user_active', { p_user_id: user.id, p_is_active: newActive })
    if (error) { console.error('[UserManagement toggle]', error.message); toast.error('Failed to update status.'); return }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: newActive } : u)))
  }

  const handleSave = (id, updates) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
    admins: users.filter((u) => ['super_admin', 'church_admin'].includes(u.role)).length,
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
            { label: 'Total Users', value: loading ? '…' : stats.total, color: 'text-purple-700 bg-purple-50 border-purple-100' },
            { label: 'Active', value: loading ? '…' : stats.active, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
            { label: 'Inactive', value: loading ? '…' : stats.inactive, color: 'text-slate-600 bg-slate-50 border-slate-200' },
            { label: 'Admins', value: loading ? '…' : stats.admins, color: 'text-red-700 bg-red-50 border-red-100' },
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
              placeholder="Search by name…"
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
              {VISIBLE_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_CONFIG[r]?.label}</option>
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
            {loading ? '…' : `${filtered.length} of ${users.length} users`}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Loading users…</p>
          </div>
        )}

        {/* User Table */}
        {!loading && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      User
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Church
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Role
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Joined
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
                            <Users className="w-6 h-6 text-slate-300" />
                          </div>
                          <p className="text-sm font-semibold text-slate-500">
                            {users.length === 0 ? 'No users registered yet.' : 'No users match your filters.'}
                          </p>
                          {users.length === 0 && (
                            <p className="text-xs text-slate-400">
                              Share your church invite link so members can sign up.
                            </p>
                          )}
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
                              <Avatar name={user.full_name} src={addApiKey(user.avatar_url)} size="md" />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                  user.is_active ? 'bg-emerald-400' : 'bg-slate-300'
                                }`}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate">{user.full_name || '—'}</p>
                              <p className="text-xs text-slate-400">ID: {user.id?.slice(0, 8)}…</p>
                            </div>
                          </div>
                        </td>

                        {/* Church */}
                        <td className="px-5 py-4">
                          <span className="text-slate-600 truncate block max-w-[180px]">
                            {user.churches?.name || '—'}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <RoleBadge role={user.role} />
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge isActive={user.is_active} />
                        </td>

                        {/* Joined */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                            <span>{user.created_at ? relativeTime(user.created_at) : '—'}</span>
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
                              Edit Role
                            </button>
                            <button
                              onClick={() => handleToggleActive(user)}
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors ${
                                user.is_active
                                  ? 'text-red-600 border-red-100 bg-red-50 hover:bg-red-100'
                                  : 'text-emerald-700 border-emerald-100 bg-emerald-50 hover:bg-emerald-100'
                              }`}
                            >
                              {user.is_active ? (
                                <><UserX className="w-3 h-3" />Deactivate</>
                              ) : (
                                <><UserCheck className="w-3 h-3" />Activate</>
                              )}
                            </button>
                            {/* Password Reset — role-gated */}
                            {user.email && canResetPassword(
                              currentUser?.role || currentUser?.profile?.role,
                              user.role,
                              currentUser?.profile?.church_id,
                              user.church_id
                            ) && (
                              <button
                                disabled={resettingEmail === user.email}
                                onClick={async () => {
                                  setResettingEmail(user.email)
                                  try {
                                    await sendPasswordResetEmail({
                                      targetEmail: user.email,
                                      actor: currentUser,
                                      church,
                                    })
                                    toast.success('Password reset link sent successfully.')
                                  } catch (err) {
                                    toast.error(err.message || 'Password reset failed.')
                                  } finally {
                                    setResettingEmail(null)
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 border border-amber-100 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {resettingEmail === user.email ? '…' : '🔑 Reset Password'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            {users.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{' '}
                  <span className="font-semibold text-slate-600">{users.length}</span> users
                </p>
                <div className="flex items-center gap-1">
                  {['active', 'inactive'].map((s) => (
                    <span key={s} className="flex items-center gap-1.5 text-xs text-slate-500 ml-4 capitalize">
                      <span className={`w-2 h-2 rounded-full ${s === 'active' ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                      {s}: {s === 'active' ? stats.active : stats.inactive}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <InviteUserModal isOpen={showInvite} onClose={() => setShowInvite(false)} />
      <EditUserModal
        user={editUser}
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        onSave={handleSave}
        roleConfig={ROLE_CONFIG}
      />
    </div>
  )
}
