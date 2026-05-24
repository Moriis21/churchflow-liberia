// ============================================================
// ChurchFlow Liberia — Branches Page
// ============================================================
import { useState, useEffect } from 'react'
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
  Trash2,
  X,
  Loader2,
} from 'lucide-react'
import { Button, Badge, Modal, Input } from '../../components/ui'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/helpers'

// ─── Branch Card ──────────────────────────────────────────────
function BranchCard({ branch, onView, onEdit, onDelete }) {
  const isMain = branch.is_main

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.12)] transition-all duration-300">
      {/* Gradient header */}
      <div
        className={`relative h-24 flex items-end p-5 ${
          isMain
            ? 'bg-gradient-to-br from-[#151022] to-[#5B00B8]'
            : 'bg-gradient-to-br from-slate-600 to-slate-800'
        }`}
      >
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
              <span>{branch.location || '—'}</span>
            </div>
          </div>
        </div>
        {isMain && (
          <span className="absolute top-3 right-3 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
            Main
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Pastor + Founded */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 bg-purple-50 border border-purple-100">
            <p className="text-[11px] font-semibold text-slate-500 mb-1">Senior Pastor</p>
            <p className="text-sm font-bold text-purple-700 truncate">{branch.pastor || '—'}</p>
          </div>
          <div className="rounded-xl p-3 bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 mb-1">Established</p>
            <p className="text-sm font-bold text-slate-700">
              {branch.established ? formatDate(branch.established) : '—'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-xl bg-slate-50">
            <Users className="w-4 h-4 text-purple-500 mx-auto mb-1" />
            <p className="text-lg font-extrabold text-slate-800">0</p>
            <p className="text-[10px] text-slate-400 font-medium">Members</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-50">
            <Calendar className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-extrabold text-slate-800 truncate text-xs pt-1">
              {branch.churches?.name || '—'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Church</p>
          </div>
        </div>

        {/* Description */}
        {branch.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{branch.description}</p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
          <Button
            size="sm"
            variant="primary"
            icon={Eye}
            className="flex-1"
            onClick={() => onView(branch)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={Pencil}
            onClick={() => onEdit(branch)}
          >
            Edit
          </Button>
          <button
            onClick={() => onDelete(branch.id)}
            className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete branch"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Branch Detail Modal ──────────────────────────────────────
function BranchDetailModal({ branch, isOpen, onClose }) {
  if (!branch) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={branch.name} size="xl">
      <div className="space-y-6">
        {/* About */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed">
            {branch.description || 'No description provided for this branch.'}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {branch.is_main && <Badge variant="purple" dot>Main Branch</Badge>}
            <Badge variant="success" dot>Active Branch</Badge>
          </div>
        </div>

        {/* Pastor */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3">Branch Pastor</h4>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#151022] to-[#5B00B8] flex items-center justify-center text-white font-bold text-sm">
              {branch.pastor
                ? branch.pastor.split(' ').map((w) => w[0]).slice(0, 2).join('')
                : '?'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{branch.pastor || '—'}</p>
              <p className="text-xs text-slate-500">Senior Pastor · {branch.location || '—'}</p>
            </div>
          </div>
        </div>

        {/* Location + Founded */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Location</span>
            </div>
            <p className="text-sm font-medium text-slate-700">{branch.location || '—'}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Established</span>
            </div>
            <p className="text-sm font-medium text-slate-700">
              {branch.established ? formatDate(branch.established) : '—'}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Edit Branch Modal ────────────────────────────────────────
function EditBranchModal({ branch, isOpen, onClose, onSaved }) {
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (branch) {
      setForm({
        name: branch.name || '',
        location: branch.location || '',
        pastor: branch.pastor || '',
        established: branch.established || '',
        description: branch.description || '',
      })
      setError(null)
    }
  }, [branch])

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSave = async () => {
    if (!form.name?.trim()) { setError('Branch name is required.'); return }
    setSaving(true)
    setError(null)
    const { data, error: err } = await insforge.database
      .from('branches')
      .update({
        name: form.name,
        location: form.location,
        pastor: form.pastor,
        established: form.established || null,
        description: form.description,
      })
      .eq('id', branch.id)
      .select()
      .single()
    setSaving(false)
    if (err) { setError(err.message); return }
    onSaved(data)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit — ${branch?.name}`}
      size="md"
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
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Branch Name *</label>
          <Input value={form.name || ''} onChange={set('name')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location</label>
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
function AddBranchModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', location: '', pastor: '', established: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleCreate = async () => {
    if (!form.name?.trim()) { setError('Branch name is required.'); return }
    setSaving(true)
    setError(null)
    const churchId = user?.churchId || user?.profile?.church_id
    const { data, error: err } = await insforge.database
      .from('branches')
      .insert({
        church_id: churchId,
        name: form.name,
        location: form.location,
        pastor: form.pastor,
        established: form.established || null,
        description: form.description,
        is_main: false,
      })
      .select('*, churches(name)')
      .single()
    setSaving(false)
    if (err) { setError(err.message); return }
    onCreated(data)
    onClose()
    setForm({ name: '', location: '', pastor: '', established: '', description: '' })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Branch"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} loading={saving}>Create Branch</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Branch Name *</label>
          <Input placeholder="e.g. North Branch" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location</label>
          <Input placeholder="City, County, Liberia" value={form.location} onChange={set('location')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Senior Pastor</label>
          <Input placeholder="Pastor name..." value={form.pastor} onChange={set('pastor')} />
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
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewBranch, setViewBranch] = useState(null)
  const [editBranch, setEditBranch] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await insforge.database
        .from('branches')
        .select('*, churches(name)')
        .order('is_main', { ascending: false })
      if (error) console.error('[Branches]', error.message)
      setBranches(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this branch? This cannot be undone.')) return
    const { error } = await insforge.database.from('branches').delete().eq('id', id)
    if (error) { console.error('[Branches delete]', error.message); return }
    setBranches((prev) => prev.filter((b) => b.id !== id))
  }

  const handleEditSaved = (updated) => {
    setBranches((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)))
  }

  const handleCreated = (newBranch) => {
    setBranches((prev) => [...prev, newBranch])
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Branches</h1>
            <p className="text-sm text-slate-500 mt-1">
              {loading ? 'Loading branches…' : `${branches.length} branch${branches.length !== 1 ? 'es' : ''} registered`}
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)}>
            Add Branch
          </Button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Branches', value: loading ? '…' : branches.length, color: 'text-purple-700 bg-purple-50 border-purple-100' },
            { label: 'Main Branch', value: loading ? '…' : branches.filter((b) => b.is_main).length, color: 'text-amber-700 bg-amber-50 border-amber-100' },
            { label: 'Country', value: '1 (Liberia)', color: 'text-blue-700 bg-blue-50 border-blue-100' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border p-4 ${color}`}>
              <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
              <p className="text-xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Loading branches…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && branches.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-purple-200 p-16 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-700">No branches added yet</p>
              <p className="text-sm text-slate-400 mt-1">Add your first church branch to get started.</p>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)}>
              Add Branch
            </Button>
          </div>
        )}

        {/* Branch Cards */}
        {!loading && branches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                onView={(b) => setViewBranch(b)}
                onEdit={(b) => setEditBranch(b)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
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
        onSaved={handleEditSaved}
      />
      <AddBranchModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
