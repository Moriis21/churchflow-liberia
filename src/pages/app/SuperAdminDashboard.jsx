// ============================================================
// ChurchFlow Liberia — Super Admin Platform Dashboard
// Route: /app/super-admin
// Only accessible when user.role === 'super_admin'
// ============================================================
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  DollarSign,
  UserCheck,
  Eye,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  Globe,
  ShieldCheck,
} from 'lucide-react'
import { MessageCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { StatsCard } from '../../components/ui'
import { insforge } from '../../lib/insforge'
import AdminInsightsAI from '../../components/ai/AdminInsightsAI'
import { useAIFeature } from '../../hooks/useAIFeature'

// ─── Helpers ─────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatCurrency(amount) {
  const n = Number(amount || 0)
  if (n >= 1_000_000) return `LRD ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `LRD ${(n / 1_000).toFixed(1)}K`
  return `LRD ${n.toLocaleString()}`
}

// ─── Status badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = (status || 'active').toLowerCase()
  const styles = {
    active:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
    inactive: 'bg-slate-50 text-slate-500 border border-slate-200',
    pending:  'bg-amber-50 text-amber-700 border border-amber-200',
    suspended:'bg-red-50 text-red-700 border border-red-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[s] || styles.active}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  )
}

// ─── Confirm Delete Modal ─────────────────────────────────────
function DeleteModal({ church, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Delete Church</h3>
            <p className="text-sm text-slate-500 mt-1">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-slate-800">{church?.name}</span>? This action
              cannot be undone and will remove all associated data.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Super Admin Dashboard ────────────────────────────────────
export default function SuperAdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { enabled: aiEnabled } = useAIFeature('admin_ai')

  const [churches, setChurches] = useState([])
  const [allMembers, setAllMembers] = useState([])
  const [allOfferings, setAllOfferings] = useState([])
  const [platformStats, setPlatformStats] = useState({
    churches: 0,
    members: 0,
    offerings: 0,
    users: 0,
  })
  const [dataLoading, setDataLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // ── Load all platform data ────────────────────────────────
  useEffect(() => {
    async function load() {
      setDataLoading(true)
      setError(null)
      try {
        const [churchRes, memberRes, offeringRes, userRes] = await Promise.all([
          insforge.database
            .from('churches')
            .select('*, user_profiles(id, full_name, role)')
            .order('created_at', { ascending: false }),
          insforge.database
            .from('members')
            .select('id, full_name, church_id, membership_status, created_at'),
          insforge.database
            .from('offerings')
            .select('id, amount, currency, church_id, date, type'),
          insforge.database
            .from('user_profiles')
            .select('id, full_name, role, church_id, is_active'),
        ])

        if (churchRes.data) setChurches(churchRes.data)
        if (memberRes.data) setAllMembers(memberRes.data)
        if (offeringRes.data) setAllOfferings(offeringRes.data)

        setPlatformStats({
          churches: churchRes.data?.length || 0,
          members: memberRes.data?.length || 0,
          offerings:
            offeringRes.data?.reduce((s, o) => s + Number(o.amount || 0), 0) || 0,
          users: userRes.data?.length || 0,
        })
      } catch (err) {
        console.error('Super admin load error:', err)
        setError('Failed to load platform data. Please refresh.')
      } finally {
        setDataLoading(false)
      }
    }
    load()
  }, [])

  // ── Delete church ─────────────────────────────────────────
  async function handleDeleteChurch() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { error: deleteError } = await insforge.database
        .from('churches')
        .delete()
        .eq('id', deleteTarget.id)

      if (deleteError) throw deleteError

      setChurches((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setPlatformStats((prev) => ({ ...prev, churches: prev.churches - 1 }))
      setDeleteTarget(null)
    } catch (err) {
      console.error('Delete church error:', err)
      alert('Failed to delete church: ' + (err.message || 'Unknown error'))
    } finally {
      setDeleting(false)
    }
  }

  // ── Derived data ──────────────────────────────────────────
  const recentChurches = [...churches].slice(0, 5)

  const recentMembers = [...allMembers]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
    .map((m) => ({
      ...m,
      churchName:
        churches.find((c) => c.id === m.church_id)?.name || 'Unknown Church',
    }))

  function getMemberCount(churchId) {
    return allMembers.filter((m) => m.church_id === churchId).length
  }

  function getChurchAdmin(church) {
    const profiles = church.user_profiles
    if (!profiles) return '—'
    const admins = Array.isArray(profiles)
      ? profiles
      : [profiles]
    const admin = admins.find((p) => p.role === 'church_admin' || p.role === 'pastor') || admins[0]
    return admin?.full_name || '—'
  }

  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page header ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  Platform Overview
                </h1>
                <p className="text-sm text-slate-500">
                  Welcome, Morris &mdash; {today}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dataLoading ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full animate-pulse">
                <Globe className="w-3.5 h-3.5" />
                Loading platform data...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live platform data
              </span>
            )}
          </div>
        </div>

        {/* ── Error banner ──────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Stats row (4 cards) ───────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatsCard
            title="Total Churches"
            value={platformStats.churches}
            change="Registered on platform"
            changeType="neutral"
            icon={Building2}
            color="purple"
          />
          <StatsCard
            title="Total Members"
            value={platformStats.members}
            change="Across all churches"
            changeType="up"
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Total Offerings"
            value={formatCurrency(platformStats.offerings)}
            change="All churches combined"
            changeType="up"
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="Active Users"
            value={platformStats.users}
            change="Church admins & staff"
            changeType="neutral"
            icon={UserCheck}
            color="gold"
          />
        </div>

        {/* ── All Churches table ────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">All Churches</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {churches.length} church{churches.length !== 1 ? 'es' : ''} registered on the platform
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200">
              <Building2 className="w-3.5 h-3.5" />
              {churches.length} total
            </span>
          </div>

          {dataLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin" />
                <p className="text-sm text-slate-400 font-medium">Loading churches...</p>
              </div>
            </div>
          ) : churches.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">No churches registered yet</p>
              <p className="text-xs text-slate-400 mt-1">Churches will appear here once they sign up</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Church Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Admin / Pastor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {churches.map((church) => (
                    <tr
                      key={church.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#151022] to-[#5B00B8] flex items-center justify-center shadow-sm">
                            <span className="text-white text-xs font-bold uppercase">
                              {(church.name || 'C').charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {church.name || '—'}
                            </p>
                            <p className="text-xs text-slate-400">{church.denomination || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {getChurchAdmin(church)}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {church.location || church.city || '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100">
                          {getMemberCount(church.id)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={church.status || 'active'} />
                      </td>
                      <td className="px-4 py-4 text-slate-500 text-xs">
                        {formatDate(church.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/app/churches/${church.id}`)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors"
                            title="View church"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/app/churches/${church.id}/edit`)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                            title="Edit church"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(church)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
                            title="Delete church"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Bottom row: Recent Registrations + Platform Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Recent Registrations (last 5 churches) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Registrations</h2>
                <p className="text-xs text-slate-400 mt-0.5">Latest 5 churches that joined the platform</p>
              </div>
            </div>

            {dataLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentChurches.length === 0 ? (
              <div className="py-8 text-center">
                <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No registrations yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentChurches.map((church) => (
                  <div
                    key={church.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {church.name || '—'}
                      </p>
                      <p className="text-xs text-slate-400">{church.location || 'Location not set'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={church.status || 'active'} />
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(church.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform Activity (last 10 members across all churches) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Platform Activity</h2>
                <p className="text-xs text-slate-400 mt-0.5">Last 10 members added across all churches</p>
              </div>
            </div>

            {dataLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentMembers.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No members registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold uppercase">
                        {(member.full_name || 'M').charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {member.full_name || '—'}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{member.churchName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        member.membership_status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}>
                        {member.membership_status || 'active'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(member.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Platform AI Insights ──────────────────────────── */}
        {aiEnabled && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#151022] to-[#5B00B8] flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Platform Intelligence</h2>
              <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">AI</span>
            </div>
            <AdminInsightsAI isSuperAdmin={true} />
          </div>
        )}

      </div>

      {/* ── Delete confirmation modal ──────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          church={deleteTarget}
          onConfirm={handleDeleteChurch}
          onCancel={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
