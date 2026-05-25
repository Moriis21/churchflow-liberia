// ============================================================
// ChurchFlow Liberia — Audit Logs Viewer
//
// • Super Admin sees logs across all churches
// • Church Admin sees only their own church's logs
// • Other roles get an Access Denied screen (route guard backstop)
//
// Filters: action type, actor, since-date, free-text search,
// church (super admin only). Server-side filtering via
// fetch_audit_logs RPC.
// ============================================================
import React, { useEffect, useMemo, useState } from 'react'
import {
  FileClock, Filter, RefreshCw, Search, Loader2,
  ShieldX, User, Building2, AlertCircle, CheckCircle2, KeyRound,
  LogIn, LogOut, Trash2, Pencil, UserPlus, Link2, Mail,
} from 'lucide-react'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import { Button, Input, Badge } from '../../components/ui'
import { AUDIT_ACTIONS } from '../../services/auditLog'

// ─── Action grouping for filter dropdown + icon/color ─────────
const ACTION_META = {
  login:                  { icon: LogIn,     color: 'emerald', label: 'Login' },
  logout:                 { icon: LogOut,    color: 'slate',   label: 'Logout' },
  failed_login:           { icon: AlertCircle, color: 'red',  label: 'Failed login' },
  member_created:         { icon: UserPlus,  color: 'purple', label: 'Member created' },
  member_updated:         { icon: Pencil,    color: 'amber',  label: 'Member updated' },
  member_deleted:         { icon: Trash2,    color: 'red',    label: 'Member deleted' },
  church_updated:         { icon: Building2, color: 'purple', label: 'Church updated' },
  role_changed:           { icon: User,      color: 'amber',  label: 'Role changed' },
  password_reset:         { icon: KeyRound,  color: 'blue',   label: 'Password reset' },
  admin_password_reset:   { icon: KeyRound,  color: 'blue',   label: 'Admin reset' },
  invite_created:         { icon: Link2,     color: 'purple', label: 'Invite created' },
  invite_used:            { icon: Link2,     color: 'emerald',label: 'Invite used' },
  invite_disabled:        { icon: Link2,     color: 'slate',  label: 'Invite disabled' },
  access_denied:          { icon: ShieldX,   color: 'red',    label: 'Access denied' },
  account_suspended:      { icon: ShieldX,   color: 'red',    label: 'Account suspended' },
  email_verified:         { icon: CheckCircle2, color: 'emerald', label: 'Email verified' },
  church_setup_completed: { icon: Building2, color: 'emerald',label: 'Setup completed' },
  default:                { icon: FileClock, color: 'slate',  label: 'Other' },
}

const COLOR_MAP = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  red:     'bg-red-50 text-red-700 border-red-100',
  purple:  'bg-purple-50 text-purple-700 border-purple-100',
  amber:   'bg-amber-50 text-amber-700 border-amber-100',
  blue:    'bg-blue-50 text-blue-700 border-blue-100',
  slate:   'bg-slate-50 text-slate-700 border-slate-200',
}

function fmt(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return ts }
}

function ActionBadge({ action }) {
  const meta = ACTION_META[action] || ACTION_META.default
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${COLOR_MAP[meta.color]}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  )
}

export default function AuditLogs() {
  const { user, isSuperAdmin } = useAuth()
  const { church } = useChurch()

  const role = user?.role || user?.profile?.role
  const allowed = isSuperAdmin || role === 'church_admin'

  const [rows, setRows]     = useState([])
  const [loading, setLoad]  = useState(true)
  const [filterAction, setFilterAction] = useState('')
  const [search, setSearch] = useState('')
  const [since, setSince]   = useState('')

  async function load() {
    setLoad(true)
    try {
      const { data, error } = await insforge.database.rpc('fetch_audit_logs', {
        p_limit:    300,
        p_offset:   0,
        p_action:   filterAction || null,
        p_actor_id: null,
        p_since:    since ? new Date(since + 'T00:00:00Z').toISOString() : null,
        p_church_id: null,
      })
      if (error) throw error
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('[AuditLogs] load failed:', err?.message)
      setRows([])
    } finally {
      setLoad(false)
    }
  }
  useEffect(() => { if (allowed) load() /* eslint-disable-next-line */ }, [allowed, filterAction, since])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((r) =>
      (r.actor_name || '').toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q) ||
      (r.church_name || '').toLowerCase().includes(q) ||
      (r.action || '').toLowerCase().includes(q)
    )
  }, [rows, search])

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <div className="w-20 h-20 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-6">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500 text-sm max-w-sm">
          Only church admins and super admins can view audit logs.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Audit Logs</h1>
              {isSuperAdmin && (
                <Badge variant="warning" size="sm">Platform-wide</Badge>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {isSuperAdmin
                ? 'All actions across every church on the platform.'
                : `Activity for ${church?.name || 'your church'}.`}
            </p>
          </div>
          <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="search" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by actor, description, church…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
              />
            </div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 min-w-[180px]"
            >
              <option value="">All actions</option>
              {Object.values(AUDIT_ACTIONS).map((a) => (
                <option key={a} value={a}>{(ACTION_META[a] || ACTION_META.default).label}</option>
              ))}
            </select>
            <Input
              type="date" value={since}
              onChange={(e) => setSince(e.target.value)}
              placeholder="Since"
            />
            {(filterAction || since || search) && (
              <button
                onClick={() => { setFilterAction(''); setSince(''); setSearch('') }}
                className="text-sm text-slate-500 hover:text-red-600 px-3"
              >
                Clear
              </button>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <Filter className="inline w-3 h-3 mr-1" />
            Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of <span className="font-semibold text-slate-600">{rows.length}</span> entries
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <FileClock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">No audit log entries</p>
              <p className="text-xs text-slate-400 mt-1">
                {rows.length === 0 ? 'Nothing has been logged yet.' : 'Try clearing the filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    {['When', 'Action', 'Actor', isSuperAdmin && 'Church', 'Description'].filter(Boolean).map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap font-mono">{fmt(row.created_at)}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><ActionBadge action={row.action} /></td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">{row.actor_name || '—'}</p>
                          <p className="text-xs text-slate-400 capitalize">{(row.actor_role || '').replace('_', ' ') || '—'}</p>
                        </div>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg">
                            {row.church_name || '—'}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {row.description || <span className="text-slate-400 italic">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
