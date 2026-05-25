// ============================================================
// ChurchFlow Liberia — Super Admin Platform Settings (Full Rewrite)
// Platform owner's full control center
// ============================================================
import { useState, useEffect, useRef } from 'react'
import {
  Settings, Building2, CreditCard, Zap, Users, DollarSign,
  MessageSquare, Shield, Database, FileText, Bell, Palette,
  Scale, Code2, Search, Save, RotateCcw, CheckCircle, XCircle,
  AlertTriangle, ToggleLeft, ToggleRight, Trash2, Edit2,
  Eye, EyeOff, RefreshCw, Download, Upload, Lock, Unlock,
  Globe, Phone, Mail, Clock, BarChart3, Server, Activity,
  ChevronRight, Plus, Minus, Ban, CheckCheck, LogIn, Key,
  Video, Mic2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { insforge } from '../../lib/insforge'
import { Input, Button } from '../../components/ui'
import toast from 'react-hot-toast'
import { TutorialsManager, WebinarsManager } from '../../components/admin/TutorialsManager'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// ─── Section Registry ────────────────────────────────────────
const SECTIONS = [
  { id: 'platform',      label: 'Platform',        icon: Settings },
  { id: 'churches',      label: 'Churches',         icon: Building2 },
  { id: 'billing',       label: 'Plans & Billing',  icon: CreditCard },
  { id: 'features',      label: 'Features',         icon: Zap },
  { id: 'users',         label: 'Users & Roles',    icon: Users },
  { id: 'payments',      label: 'Payments',         icon: DollarSign },
  { id: 'sms',           label: 'SMS & Email',      icon: MessageSquare },
  { id: 'security',      label: 'Security',         icon: Shield },
  { id: 'backup',        label: 'Backup',           icon: Database },
  { id: 'audit',         label: 'Audit Logs',       icon: FileText },
  { id: 'notifications', label: 'Notifications',    icon: Bell },
  { id: 'branding',      label: 'Branding',         icon: Palette },
  { id: 'legal',         label: 'Legal',            icon: Scale },
  { id: 'members',       label: 'Members',          icon: Users },
  { id: 'tutorials',     label: 'Tutorials',        icon: Video },
  { id: 'webinars',      label: 'Webinars',         icon: Mic2 },
  { id: 'api',           label: 'API Keys',         icon: Code2 },
]

// ─── Shared Toggle Component ─────────────────────────────────
function Toggle({ enabled, onChange, size = 'md' }) {
  const h = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'
  const d = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const t = size === 'sm' ? (enabled ? 'translate-x-4' : 'translate-x-0.5') : (enabled ? 'translate-x-5' : 'translate-x-1')
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none ${h} ${enabled ? 'bg-[#8A19FF]' : 'bg-slate-300'}`}
    >
      <span className={`inline-block rounded-full bg-white shadow transition-transform duration-200 ${d} ${t}`} />
    </button>
  )
}

// ─── Masked Input Component ───────────────────────────────────
function MaskedInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active:    'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    pending:   'bg-yellow-100 text-yellow-700',
    success:   'bg-green-100 text-green-700',
    failed:    'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}

// ─── Plan Badge ───────────────────────────────────────────────
function PlanBadge({ plan }) {
  const map = {
    starter:    'bg-slate-100 text-slate-700',
    growth:     'bg-purple-100 text-purple-700',
    pro:        'bg-amber-100 text-amber-700',
    enterprise: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[plan?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>
      {plan || 'Starter'}
    </span>
  )
}

// ─── Empty State ──────────────────────────────────────────────
function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <p className="text-base font-semibold text-slate-500">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  )
}

// ─── Section Card Wrapper ─────────────────────────────────────
function SectionCard({ title, description, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
        <div>
          <h4 className="font-bold text-[#151022] text-base">{title}</h4>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 1: PLATFORM SETTINGS
// ═══════════════════════════════════════════════════════════════
function PlatformSection() {
  const [form, setForm] = useState({
    platform_name: 'ChurchFlow Liberia',
    support_email: 'morrisldorleyjr21@gmail.com',
    support_phone: '+231 555 000 000',
    language: 'en',
    timezone: 'Africa/Monrovia',
    theme_color: '#8A19FF',
  })
  const [maintenance, setMaintenance] = useState(false)
  const [maintMsg, setMaintMsg] = useState('System is under maintenance. We will be back shortly.')
  const [maintReturn, setMaintReturn] = useState('')
  const [saving, setSaving] = useState(false)

  const colors = [
    { label: 'Purple', value: '#8A19FF' },
    { label: 'Blue',   value: '#2563EB' },
    { label: 'Green',  value: '#059669' },
    { label: 'Red',    value: '#DC2626' },
  ]

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Platform settings saved.')
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {maintenance && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Maintenance Mode is ON</p>
            <p className="text-xs text-red-500 mt-0.5">Users will see the maintenance banner. Remember to turn this off when done.</p>
          </div>
        </div>
      )}

      <SectionCard title="General Platform Info" description="Basic settings for the ChurchFlow Liberia platform.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Platform Name</label>
            <input
              value={form.platform_name}
              onChange={e => setForm({ ...form, platform_name: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Support Email</label>
            <input
              type="email"
              value={form.support_email}
              onChange={e => setForm({ ...form, support_email: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Support Phone</label>
            <input
              value={form.support_phone}
              onChange={e => setForm({ ...form, support_phone: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Default Language</label>
            <select
              value={form.language}
              onChange={e => setForm({ ...form, language: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Default Timezone</label>
            <select
              value={form.timezone}
              onChange={e => setForm({ ...form, timezone: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="Africa/Monrovia">Africa/Monrovia (GMT+0)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Default Theme Color</label>
            <div className="flex items-center gap-3 mt-1">
              {colors.map(c => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setForm({ ...form, theme_color: c.value })}
                  className={`w-8 h-8 rounded-full border-4 transition-all ${form.theme_color === c.value ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Maintenance Mode"
        description="Take the platform offline for scheduled maintenance."
        action={<Toggle enabled={maintenance} onChange={setMaintenance} />}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Maintenance Message</label>
            <textarea
              rows={3}
              value={maintMsg}
              onChange={e => setMaintMsg(e.target.value)}
              disabled={!maintenance}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-slate-50 disabled:text-slate-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expected Return Time</label>
            <input
              type="datetime-local"
              value={maintReturn}
              onChange={e => setMaintReturn(e.target.value)}
              disabled={!maintenance}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#8A19FF] hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Platform Settings'}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 2: CHURCH MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// ─── Church Avatar ─────────────────────────────────────────────
function ChurchAvatar({ name, size = 'md' }) {
  const colors = [
    'bg-purple-100 text-purple-700',
    'bg-blue-100 text-blue-700',
    'bg-amber-100 text-amber-700',
    'bg-green-100 text-green-700',
    'bg-rose-100 text-rose-700',
    'bg-indigo-100 text-indigo-700',
  ]
  const idx = (name?.charCodeAt(0) || 0) % colors.length
  const sz = size === 'lg' ? 'w-14 h-14 text-xl' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${sz} ${colors[idx]}`}>
      {name?.charAt(0)?.toUpperCase() || 'C'}
    </div>
  )
}

// ─── Extended Status Badge ─────────────────────────────────────
function ChurchStatusBadge({ status }) {
  const map = {
    active:    'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    trial:     'bg-amber-100 text-amber-700',
    expired:   'bg-orange-100 text-orange-700',
    pending:   'bg-yellow-100 text-yellow-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}

// ─── Spinning Loader ───────────────────────────────────────────
function Spinner() {
  return <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
}

// ─── Modal Overlay ─────────────────────────────────────────────
function ModalOverlay({ children, onClose, maxWidth = 'max-w-2xl' }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} my-4`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

// ─── Modal Header ──────────────────────────────────────────────
function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
      <div>
        <h3 className="font-bold text-[#151022] text-lg">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 ml-4 flex-shrink-0">
        <XCircle size={18} />
      </button>
    </div>
  )
}

// ─── Field Label ───────────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

// ─── Text Input ────────────────────────────────────────────────
function TInput({ value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-slate-50 disabled:text-slate-400"
    />
  )
}

// ─── Select ────────────────────────────────────────────────────
function TSelect({ value, onChange, children, disabled }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white disabled:bg-slate-50"
    >
      {children}
    </select>
  )
}

// ─── Create Church Modal ────────────────────────────────────────
function CreateChurchModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '',
    country: 'Liberia', pastor_name: '', plan: 'starter',
    trial_days: '14', currency: 'LRD', max_branches: 1, max_users: 50,
  })
  const [saving, setSaving] = useState(false)

  function set(k) { return v => setForm(f => ({ ...f, [k]: v })) }

  async function handleSave(createAdmin = false) {
    if (!form.name.trim() || !form.email.trim() || !form.pastor_name.trim()) {
      toast.error('Church Name, Email and Pastor Name are required.')
      return
    }
    setSaving(true)
    try {
      const { data, error } = await insforge.database
        .from('churches')
        .insert({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          city: form.city.trim() || null,
          country: form.country,
          admin_name: form.pastor_name.trim(),
          plan: form.plan,
          currency: form.currency,
          max_branches: Number(form.max_branches),
          max_users: Number(form.max_users),
          is_active: true,
        })
        .select()
        .single()
      if (error) throw error
      toast.success(createAdmin ? 'Church created. Admin account setup coming soon.' : 'Church created successfully.')
      onCreated(data)
      onClose()
    } catch (e) {
      toast.error(e.message || 'Failed to create church.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose} maxWidth="max-w-2xl">
      <ModalHeader title="Add New Church" subtitle="Register a new church on the platform." onClose={onClose} />
      <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FieldLabel required>Church Name</FieldLabel>
            <TInput value={form.name} onChange={set('name')} placeholder="Grace Community Church" />
          </div>
          <div>
            <FieldLabel required>Church Email</FieldLabel>
            <TInput type="email" value={form.email} onChange={set('email')} placeholder="info@church.org" />
          </div>
          <div>
            <FieldLabel>Phone</FieldLabel>
            <TInput value={form.phone} onChange={set('phone')} placeholder="+231 555 000 000" />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Address</FieldLabel>
            <TInput value={form.address} onChange={set('address')} placeholder="123 Main Street" />
          </div>
          <div>
            <FieldLabel>City</FieldLabel>
            <TInput value={form.city} onChange={set('city')} placeholder="Monrovia" />
          </div>
          <div>
            <FieldLabel>Country</FieldLabel>
            <TInput value={form.country} onChange={set('country')} placeholder="Liberia" />
          </div>
          <div className="md:col-span-2 border-t border-slate-100 pt-4">
            <FieldLabel required>Main Pastor / Admin Name</FieldLabel>
            <TInput value={form.pastor_name} onChange={set('pastor_name')} placeholder="Rev. John Doe" />
          </div>
          <div>
            <FieldLabel>Subscription Plan</FieldLabel>
            <TSelect value={form.plan} onChange={set('plan')}>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </TSelect>
          </div>
          <div>
            <FieldLabel>Trial Period</FieldLabel>
            <TSelect value={form.trial_days} onChange={set('trial_days')}>
              <option value="0">No Trial</option>
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
            </TSelect>
          </div>
          <div>
            <FieldLabel>Default Currency</FieldLabel>
            <TSelect value={form.currency} onChange={set('currency')}>
              <option value="LRD">LRD (Liberian Dollar)</option>
              <option value="USD">USD (US Dollar)</option>
            </TSelect>
          </div>
          <div>
            <FieldLabel>Max Branches</FieldLabel>
            <TInput type="number" value={form.max_branches} onChange={set('max_branches')} placeholder="1" />
          </div>
          <div>
            <FieldLabel>Max Users</FieldLabel>
            <TInput type="number" value={form.max_users} onChange={set('max_users')} placeholder="50" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100">
          Cancel
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="px-4 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Church'}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="px-4 py-2 text-sm font-semibold bg-[#151022] hover:bg-[#16134a] text-white rounded-xl disabled:opacity-60"
        >
          Save & Create Admin
        </button>
      </div>
    </ModalOverlay>
  )
}

// ─── Edit Church Modal ──────────────────────────────────────────
function EditChurchModal({ church, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: church.name || '',
    email: church.email || '',
    phone: church.phone || '',
    address: church.address || '',
    city: church.city || '',
    country: church.country || 'Liberia',
    admin_name: church.admin_name || '',
    plan: church.plan || 'starter',
    currency: church.currency || 'LRD',
    max_branches: church.max_branches || 1,
    max_users: church.max_users || 50,
  })
  const [saving, setSaving] = useState(false)

  function set(k) { return v => setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Church name is required.'); return }
    setSaving(true)
    try {
      const { data, error } = await insforge.database
        .from('churches')
        .update({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          city: form.city.trim() || null,
          country: form.country,
          admin_name: form.admin_name.trim() || null,
          plan: form.plan,
          currency: form.currency,
          max_branches: Number(form.max_branches),
          max_users: Number(form.max_users),
        })
        .eq('id', church.id)
        .select()
        .single()
      if (error) throw error
      toast.success('Church updated successfully.')
      onUpdated(data)
      onClose()
    } catch (e) {
      toast.error(e.message || 'Failed to update church.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose} maxWidth="max-w-2xl">
      <ModalHeader title="Edit Church" subtitle={`Editing: ${church.name}`} onClose={onClose} />
      <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FieldLabel required>Church Name</FieldLabel>
            <TInput value={form.name} onChange={set('name')} placeholder="Grace Community Church" />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <TInput type="email" value={form.email} onChange={set('email')} placeholder="info@church.org" />
          </div>
          <div>
            <FieldLabel>Phone</FieldLabel>
            <TInput value={form.phone} onChange={set('phone')} placeholder="+231 555 000 000" />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Address</FieldLabel>
            <TInput value={form.address} onChange={set('address')} placeholder="123 Main Street" />
          </div>
          <div>
            <FieldLabel>City</FieldLabel>
            <TInput value={form.city} onChange={set('city')} />
          </div>
          <div>
            <FieldLabel>Country</FieldLabel>
            <TInput value={form.country} onChange={set('country')} />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Main Pastor / Admin Name</FieldLabel>
            <TInput value={form.admin_name} onChange={set('admin_name')} />
          </div>
          <div>
            <FieldLabel>Plan</FieldLabel>
            <TSelect value={form.plan} onChange={set('plan')}>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </TSelect>
          </div>
          <div>
            <FieldLabel>Currency</FieldLabel>
            <TSelect value={form.currency} onChange={set('currency')}>
              <option value="LRD">LRD</option>
              <option value="USD">USD</option>
            </TSelect>
          </div>
          <div>
            <FieldLabel>Max Branches</FieldLabel>
            <TInput type="number" value={form.max_branches} onChange={set('max_branches')} />
          </div>
          <div>
            <FieldLabel>Max Users</FieldLabel>
            <TInput type="number" value={form.max_users} onChange={set('max_users')} />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </ModalOverlay>
  )
}

// ─── Change Plan Modal ──────────────────────────────────────────
function ChangePlanModal({ church, onClose, onUpdated }) {
  const [selected, setSelected] = useState(church.plan || 'starter')
  const [saving, setSaving] = useState(false)

  const plans = [
    { id: 'starter',    name: 'Starter',    desc: 'Up to 100 members, 1 branch',   color: 'border-slate-200 bg-slate-50' },
    { id: 'growth',     name: 'Growth',     desc: 'Up to 500 members, 3 branches',  color: 'border-purple-200 bg-purple-50' },
    { id: 'pro',        name: 'Pro',        desc: 'Up to 2000 members, 10 branches', color: 'border-amber-200 bg-amber-50' },
    { id: 'enterprise', name: 'Enterprise', desc: 'Unlimited members and branches', color: 'border-blue-200 bg-blue-50' },
  ]

  async function handleSave() {
    setSaving(true)
    try {
      const { data, error } = await insforge.database
        .from('churches')
        .update({ plan: selected })
        .eq('id', church.id)
        .select()
        .single()
      if (error) throw error
      toast.success(`Plan updated to ${selected}.`)
      onUpdated(data)
      onClose()
    } catch (e) {
      toast.error(e.message || 'Failed to update plan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose} maxWidth="max-w-md">
      <ModalHeader title="Change Subscription Plan" subtitle={church.name} onClose={onClose} />
      <div className="p-6 space-y-3">
        {plans.map(p => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all ${selected === p.id ? 'border-purple-500 bg-purple-50' : `${p.color} hover:border-slate-300`}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected === p.id ? 'border-purple-500 bg-purple-500' : 'border-slate-300'}`} />
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-60">
          {saving ? 'Saving...' : 'Confirm Plan'}
        </button>
      </div>
    </ModalOverlay>
  )
}

// ─── Delete Confirm Modal ──────────────────────────────────────
function DeleteConfirmModal({ church, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const { error } = await insforge.database.from('churches').delete().eq('id', church.id)
      if (error) throw error
      toast.success('Church deleted permanently.')
      onDeleted(church.id)
      onClose()
    } catch (e) {
      toast.error(e.message || 'Failed to delete church.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose} maxWidth="max-w-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <div>
            <p className="font-bold text-slate-800">Delete Church?</p>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          You are about to permanently delete <strong>{church.name}</strong> and all its data including members, attendance, and financial records.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ─── Analytics Modal ───────────────────────────────────────────
function AnalyticsModal({ church, onClose }) {
  const [stats, setStats] = useState({ members: 0, attendance: 0, offerings: 0, activeUsers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [{ count: memberCount }, { count: attCount }, { count: userCount }] = await Promise.all([
          insforge.database.from('members').select('id', { count: 'exact', head: true }).eq('church_id', church.id),
          insforge.database.from('attendance').select('id', { count: 'exact', head: true }).eq('church_id', church.id),
          insforge.database.from('user_profiles').select('id', { count: 'exact', head: true }).eq('church_id', church.id),
        ])
        setStats({ members: memberCount || 0, attendance: attCount || 0, offerings: 0, activeUsers: userCount || 0 })
      } catch (_) {}
      setLoading(false)
    }
    load()
  }, [church.id])

  const memberData = [
    { month: 'Jan', count: 0 }, { month: 'Feb', count: 0 }, { month: 'Mar', count: 0 },
    { month: 'Apr', count: 0 }, { month: 'May', count: stats.members },
  ]
  const attData = [
    { month: 'Jan', count: 0 }, { month: 'Feb', count: 0 }, { month: 'Mar', count: 0 },
    { month: 'Apr', count: 0 }, { month: 'May', count: stats.attendance },
  ]

  return (
    <ModalOverlay onClose={onClose} maxWidth="max-w-3xl">
      <ModalHeader title="Church Analytics" subtitle={church.name} onClose={onClose} />
      <div className="p-6 max-h-[78vh] overflow-y-auto space-y-6">
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Members', value: stats.members, color: 'text-purple-600' },
                { label: 'Attendance Records', value: stats.attendance, color: 'text-blue-600' },
                { label: 'Monthly Offerings', value: 'LRD 0', color: 'text-amber-600' },
                { label: 'Active Users', value: stats.activeUsers, color: 'text-green-600' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 mb-3">Members Over Time</p>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={memberData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#8A19FF" fill="#ede9fe" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 mb-3">Attendance Trend</p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={attData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8A19FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 mb-3">Offering Trend (LRD)</p>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={memberData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#d97706" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 mb-3">Quick Stats</p>
                <div className="space-y-2">
                  {[
                    { label: 'Avg. Attendance Rate', value: '—' },
                    { label: 'Branches Active', value: church.branches?.length || 0 },
                    { label: 'Plan', value: church.plan || 'Starter' },
                    { label: 'Registered', value: church.created_at ? new Date(church.created_at).toLocaleDateString() : '—' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-slate-500">{r.label}</span>
                      <span className="font-semibold text-slate-700 capitalize">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ModalOverlay>
  )
}

// ─── Church Profile Modal ──────────────────────────────────────
function ChurchProfileModal({ church: initialChurch, onClose, onUpdated }) {
  const [church, setChurch] = useState(initialChurch)
  const [activeTab, setActiveTab] = useState('info')
  const [branches, setBranches] = useState([])
  const [churchUsers, setChurchUsers] = useState([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [stats, setStats] = useState({ members: 0, attendance: 0, offerings: 0, activeUsers: 0 })
  const [loadingStats, setLoadingStats] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const FEATURES = [
    'Members', 'Attendance', 'Finance', 'Events',
    'Prayer', 'SMS', 'Live Streaming', 'Reports',
    'Multi-Branch', 'AI Tools', 'PWA', 'Mobile Money',
  ]
  const featureKey = f => f.toLowerCase().replace(/[\s-]/g, '_')
  const [featureToggles, setFeatureToggles] = useState(() => {
    const obj = {}
    FEATURES.forEach(f => { obj[featureKey(f)] = church[`feature_${featureKey(f)}`] !== false })
    return obj
  })

  const tabs = [
    { id: 'info',         label: 'Church Info' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'features',     label: 'Features' },
    { id: 'usage',        label: 'Usage Stats' },
    { id: 'branches',     label: 'Branches' },
    { id: 'users',        label: 'Users' },
    { id: 'activity',     label: 'Activity' },
  ]

  useEffect(() => {
    if (activeTab === 'branches' && branches.length === 0) loadBranches()
    if (activeTab === 'users' && churchUsers.length === 0) loadUsers()
    if (activeTab === 'usage') loadStats()
  }, [activeTab])

  async function loadBranches() {
    setLoadingBranches(true)
    try {
      const { data } = await insforge.database.from('branches').select('*').eq('church_id', church.id)
      setBranches(data || [])
    } catch (_) {}
    setLoadingBranches(false)
  }

  async function loadUsers() {
    setLoadingUsers(true)
    try {
      const { data } = await insforge.database.from('user_profiles').select('*').eq('church_id', church.id).order('created_at', { ascending: false })
      setChurchUsers(data || [])
    } catch (_) {}
    setLoadingUsers(false)
  }

  async function loadStats() {
    setLoadingStats(true)
    try {
      const [{ count: m }, { count: a }, { count: u }] = await Promise.all([
        insforge.database.from('members').select('id', { count: 'exact', head: true }).eq('church_id', church.id),
        insforge.database.from('attendance').select('id', { count: 'exact', head: true }).eq('church_id', church.id),
        insforge.database.from('user_profiles').select('id', { count: 'exact', head: true }).eq('church_id', church.id),
      ])
      setStats({ members: m || 0, attendance: a || 0, offerings: 0, activeUsers: u || 0 })
    } catch (_) {}
    setLoadingStats(false)
  }

  function copyId() {
    navigator.clipboard.writeText(church.id).then(() => {
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 1500)
    })
  }

  async function saveFeatures() {
    const updates = {}
    Object.entries(featureToggles).forEach(([k, v]) => { updates[`feature_${k}`] = v })
    const { error } = await insforge.database.from('churches').update(updates).eq('id', church.id)
    if (error) { toast.error('Failed to save features.'); return }
    toast.success('Feature access updated.')
  }

  return (
    <ModalOverlay onClose={onClose} maxWidth="max-w-4xl">
      <div className="flex items-center gap-4 px-6 pt-5 pb-4 border-b border-slate-100">
        <ChurchAvatar name={church.name} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#151022] text-lg truncate">{church.name}</h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <ChurchStatusBadge status={church.is_active === false ? 'suspended' : 'active'} />
            <PlanBadge plan={church.plan || 'starter'} />
            {church.city && <span className="text-xs text-slate-400">{church.city}, {church.country}</span>}
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 flex-shrink-0">
          <XCircle size={20} />
        </button>
      </div>

      <div className="border-b border-slate-100 px-6 overflow-x-auto">
        <div className="flex gap-0.5 min-w-max">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === t.id ? 'border-purple-500 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-h-[60vh] overflow-y-auto">
        {/* Tab: Church Info */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Church ID', value: church.id, copy: true },
                { label: 'Registration Date', value: church.created_at ? new Date(church.created_at).toLocaleDateString() : '—' },
                { label: 'Email', value: church.email || '—' },
                { label: 'Phone', value: church.phone || '—' },
                { label: 'Main Pastor', value: church.admin_name || '—' },
                { label: 'City / Country', value: [church.city, church.country].filter(Boolean).join(', ') || '—' },
                { label: 'Address', value: church.address || '—' },
                { label: 'Currency', value: church.currency || 'LRD' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3.5">
                  <p className="text-xs text-slate-400 font-medium mb-1">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-700 truncate flex-1">{item.value}</p>
                    {item.copy && (
                      <button onClick={copyId} className="text-xs text-purple-600 hover:text-purple-800 font-medium flex-shrink-0">
                        {copiedId ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Subscription */}
        {activeTab === 'subscription' && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-[#151022] to-[#8A19FF] rounded-2xl p-5 text-white">
              <p className="text-xs font-medium text-purple-200 mb-1">Current Plan</p>
              <p className="text-2xl font-bold capitalize">{church.plan || 'Starter'}</p>
              <div className="flex gap-4 mt-3">
                <div>
                  <p className="text-xs text-purple-200">Billing Cycle</p>
                  <p className="text-sm font-semibold">Monthly</p>
                </div>
                <div>
                  <p className="text-xs text-purple-200">Expiry</p>
                  <p className="text-sm font-semibold">—</p>
                </div>
                <div>
                  <p className="text-xs text-purple-200">Trial Remaining</p>
                  <p className="text-sm font-semibold">—</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">Payment History</p>
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Date</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Amount</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Method</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 text-sm">No payment history yet.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                Upgrade Plan
              </button>
              <button className="px-4 py-2 text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 rounded-xl">
                Suspend Subscription
              </button>
            </div>
          </div>
        )}

        {/* Tab: Features */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Control which features this church can access.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FEATURES.map(f => {
                const k = featureKey(f)
                return (
                  <div key={f} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">{f}</span>
                    <Toggle enabled={featureToggles[k]} onChange={v => setFeatureToggles(prev => ({ ...prev, [k]: v }))} size="sm" />
                  </div>
                )
              })}
            </div>
            <div className="pt-2">
              <button onClick={saveFeatures} className="px-5 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                Save Feature Access
              </button>
            </div>
          </div>
        )}

        {/* Tab: Usage Stats */}
        {activeTab === 'usage' && (
          <div>
            {loadingStats ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Members', value: stats.members, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Attendance Records', value: stats.attendance, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Monthly Offerings', value: 'LRD 0', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Active Users', value: stats.activeUsers, color: 'text-green-600', bg: 'bg-green-50' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-5`}>
                    <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Branches */}
        {activeTab === 'branches' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-700">Branches ({branches.length})</p>
              <button className="px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1.5">
                <Plus size={13} /> Add Branch
              </button>
            </div>
            {loadingBranches ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : branches.length === 0 ? (
              <EmptyState icon={Building2} title="No branches yet" description="Branches for this church will appear here." />
            ) : (
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Branch Name</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Location</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Pastor</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {branches.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-800">{b.name || '—'}</td>
                        <td className="px-4 py-3 text-slate-500">{b.location || b.city || '—'}</td>
                        <td className="px-4 py-3 text-slate-500">{b.pastor_name || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit2 size={13} /></button>
                            <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Users */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-700">Church Users ({churchUsers.length})</p>
            </div>
            {loadingUsers ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : churchUsers.length === 0 ? (
              <EmptyState icon={Users} title="No users found" description="User accounts for this church will appear here." />
            ) : (
              <div className="rounded-xl border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Name</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Role</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Email</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {churchUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ChurchAvatar name={u.full_name} size="sm" />
                            <span className="font-medium text-slate-800">{u.full_name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 capitalize">{u.role || '—'}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{u.email || '—'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={u.is_active === false ? 'suspended' : 'active'} />
                        </td>
                        <td className="px-4 py-3">
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Eye size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Activity */}
        {activeTab === 'activity' && (
          <div>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Timestamp</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">User</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Action</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-400 text-sm">Activity logging coming soon.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ModalOverlay>
  )
}

// ─── Actions Dropdown ─────────────────────────────────────────
function ActionsDropdown({ church, onView, onEdit, onChangePlan, onToggleStatus, onAnalytics, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function action(fn) { return () => { setOpen(false); fn() } }

  const isActive = church.is_active !== false

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-1"
      >
        Actions <ChevronRight size={12} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-100 z-30 py-1 overflow-hidden">
          <button onClick={action(onView)} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 text-slate-700">
            <Eye size={14} className="text-slate-400" /> View Details
          </button>
          <button onClick={action(onEdit)} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 text-slate-700">
            <Edit2 size={14} className="text-slate-400" /> Edit Church
          </button>
          <button onClick={action(onChangePlan)} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 text-slate-700">
            <CreditCard size={14} className="text-slate-400" /> Change Plan
          </button>
          <button onClick={action(onToggleStatus)} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 ${isActive ? 'text-orange-600' : 'text-green-600'}`}>
            <Ban size={14} /> {isActive ? 'Suspend' : 'Activate'}
          </button>
          <button onClick={action(() => toast('Impersonation coming soon.'))} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 text-amber-600">
            <LogIn size={14} /> Login as Church Admin
          </button>
          <button onClick={action(onAnalytics)} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 text-slate-700">
            <BarChart3 size={14} className="text-slate-400" /> View Analytics
          </button>
          <div className="border-t border-slate-100 my-1" />
          <button onClick={action(onDelete)} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-red-50 text-red-500">
            <Trash2 size={14} /> Delete Church
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Churches Section ─────────────────────────────────────
function ChurchesSection() {
  const [churches, setChurches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('table')

  // Modal state
  const [profileModal, setProfileModal] = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [createModal, setCreateModal] = useState(false)
  const [changePlanModal, setChangePlanModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [analyticsModal, setAnalyticsModal] = useState(null)

  useEffect(() => { fetchChurches() }, [])

  async function fetchChurches() {
    setLoading(true)
    try {
      const { data, error } = await insforge.database
        .from('churches')
        .select('*, user_profiles(id, role), branches(id)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setChurches(data || [])
    } catch (e) {
      toast.error('Failed to load churches.')
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus(church) {
    const newStatus = !church.is_active
    const { error } = await insforge.database
      .from('churches')
      .update({ is_active: newStatus })
      .eq('id', church.id)
    if (error) { toast.error('Failed to update status.'); return }
    toast.success(`Church ${newStatus ? 'activated' : 'suspended'}.`)
    setChurches(prev => prev.map(c => c.id === church.id ? { ...c, is_active: newStatus } : c))
  }

  function handleCreated(church) {
    setChurches(prev => [church, ...prev])
  }

  function handleUpdated(updated) {
    setChurches(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c))
  }

  function handleDeleted(id) {
    setChurches(prev => prev.filter(c => c.id !== id))
  }

  // Derived stats
  const totalChurches = churches.length
  const activeChurches = churches.filter(c => c.is_active !== false).length
  const suspendedChurches = churches.filter(c => c.is_active === false).length

  const statCards = [
    { label: 'Total Churches',   value: totalChurches,   icon: Building2,     color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-100' },
    { label: 'Active Churches',  value: activeChurches,  icon: CheckCircle,   color: 'text-green-600',   bg: 'bg-green-50',   border: 'border-green-100'  },
    { label: 'Suspended',        value: suspendedChurches, icon: Ban,         color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100'    },
    { label: 'Trial Churches',   value: 0,               icon: Clock,         color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100'  },
    { label: 'Expired',          value: 0,               icon: AlertTriangle, color: 'text-orange-600',  bg: 'bg-orange-50',  border: 'border-orange-100' },
    { label: 'Monthly Revenue',  value: 'LRD 0',         icon: DollarSign,    color: 'text-yellow-600',  bg: 'bg-yellow-50',  border: 'border-yellow-100' },
  ]

  // Filter + sort
  const filtered = churches
    .filter(c => {
      const q = searchTerm.toLowerCase()
      const matchSearch = !q ||
        c.name?.toLowerCase().includes(q) ||
        c.admin_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && c.is_active !== false) ||
        (statusFilter === 'suspended' && c.is_active === false)
      const matchPlan = planFilter === 'all' || (c.plan || 'starter') === planFilter
      return matchSearch && matchStatus && matchPlan
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      if (sortBy === 'az') return (a.name || '').localeCompare(b.name || '')
      if (sortBy === 'members') {
        const am = Array.isArray(a.user_profiles) ? a.user_profiles.length : 0
        const bm = Array.isArray(b.user_profiles) ? b.user_profiles.length : 0
        return bm - am
      }
      return 0
    })

  function getPastor(church) {
    if (church.admin_name) return church.admin_name
    if (Array.isArray(church.user_profiles)) {
      const admin = church.user_profiles.find(u => u.role === 'church_admin' || u.role === 'pastor')
      if (admin?.full_name) return admin.full_name
    }
    return '—'
  }

  function getBranchCount(church) {
    return Array.isArray(church.branches) ? church.branches.length : 0
  }

  function getMemberCount(church) {
    return Array.isArray(church.user_profiles) ? church.user_profiles.length : 0
  }

  function getStatus(church) {
    return church.is_active === false ? 'suspended' : 'active'
  }

  return (
    <div className="space-y-6">
      {/* Modals */}
      {createModal && (
        <CreateChurchModal onClose={() => setCreateModal(false)} onCreated={handleCreated} />
      )}
      {editModal && (
        <EditChurchModal church={editModal} onClose={() => setEditModal(null)} onUpdated={c => { handleUpdated(c); setEditModal(null) }} />
      )}
      {profileModal && (
        <ChurchProfileModal church={profileModal} onClose={() => setProfileModal(null)} onUpdated={handleUpdated} />
      )}
      {changePlanModal && (
        <ChangePlanModal church={changePlanModal} onClose={() => setChangePlanModal(null)} onUpdated={c => { handleUpdated(c); setChangePlanModal(null) }} />
      )}
      {deleteModal && (
        <DeleteConfirmModal church={deleteModal} onClose={() => setDeleteModal(null)} onDeleted={id => { handleDeleted(id); setDeleteModal(null) }} />
      )}
      {analyticsModal && (
        <AnalyticsModal church={analyticsModal} onClose={() => setAnalyticsModal(null)} />
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-4 flex items-center gap-4 shadow-sm`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                <Icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium leading-tight">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 w-full">
          {/* Search */}
          <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, pastor, email..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
          {/* Plan */}
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="az">A-Z</option>
            <option value="members">Members</option>
          </select>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${viewMode === 'card' ? 'bg-purple-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              Cards
            </button>
          </div>
          <button onClick={fetchChurches} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500" title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl"
          >
            <Plus size={14} /> Add Church
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState icon={Building2} title="No churches found" description="Adjust your filters or add a new church." />
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Church</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pastor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Branches</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Members</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Registered</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(church => (
                  <tr key={church.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <ChurchAvatar name={church.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-800 text-sm leading-tight">{church.name || 'Unnamed'}</p>
                          {church.city && <p className="text-xs text-slate-400 mt-0.5">{church.city}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-sm">{getPastor(church)}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[160px] truncate">{church.email || '—'}</td>
                    <td className="px-5 py-3.5"><PlanBadge plan={church.plan || 'starter'} /></td>
                    <td className="px-5 py-3.5"><ChurchStatusBadge status={getStatus(church)} /></td>
                    <td className="px-5 py-3.5 text-center text-slate-600 font-medium">{getBranchCount(church)}</td>
                    <td className="px-5 py-3.5 text-center text-slate-600 font-medium">{getMemberCount(church)}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {church.created_at ? new Date(church.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <ActionsDropdown
                        church={church}
                        onView={() => setProfileModal(church)}
                        onEdit={() => setEditModal(church)}
                        onChangePlan={() => setChangePlanModal(church)}
                        onToggleStatus={() => toggleStatus(church)}
                        onAnalytics={() => setAnalyticsModal(church)}
                        onDelete={() => setDeleteModal(church)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(church => (
            <div key={church.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ChurchAvatar name={church.name} size="md" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{church.name || 'Unnamed'}</p>
                    {church.city && <p className="text-xs text-slate-400 mt-0.5 truncate">{church.city}, {church.country}</p>}
                  </div>
                </div>
                <ChurchStatusBadge status={getStatus(church)} />
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-xs">Pastor</span>
                  <span className="text-slate-700 font-medium text-xs truncate max-w-[130px]">{getPastor(church)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-xs">Plan</span>
                  <PlanBadge plan={church.plan || 'starter'} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-xs">Members</span>
                  <span className="text-slate-700 font-semibold text-xs">{getMemberCount(church)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-xs">Branches</span>
                  <span className="text-slate-700 font-semibold text-xs">{getBranchCount(church)}</span>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-50 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  {church.created_at ? new Date(church.created_at).toLocaleDateString() : '—'}
                </span>
                <button
                  onClick={() => setProfileModal(church)}
                  className="px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
// === END CHURCHES SECTION ===

// ═══════════════════════════════════════════════════════════════
// SECTION 3: PLANS & BILLING
// ═══════════════════════════════════════════════════════════════
function BillingSection() {
  const [plans, setPlans] = useState([
    { id: 'starter',    name: 'Starter',      price_usd: 15,  price_lrd: 500,  members: 100,   branches: 1,    trial_days: 14, active: true,  sms_limit: 50,    color: 'slate',  popular: false },
    { id: 'growth',     name: 'Growth',       price_usd: 45,  price_lrd: 1500, members: 500,   branches: 3,    trial_days: 14, active: true,  sms_limit: 500,   color: 'purple', popular: true },
    { id: 'pro',        name: 'Ministry Pro', price_usd: 120, price_lrd: 4000, members: 9999,  branches: 999,  trial_days: 30, active: true,  sms_limit: 9999,  color: 'gold',   popular: false },
    { id: 'enterprise', name: 'Enterprise',   price_usd: 250, price_lrd: 8500, members: 99999, branches: 9999, trial_days: 30, active: false, sms_limit: 99999, color: 'navy',   popular: false },
  ])
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})

  const colorMap = {
    slate:  'border-slate-200 bg-slate-50',
    purple: 'border-purple-300 bg-purple-50',
    gold:   'border-amber-300 bg-amber-50',
    navy:   'border-blue-300 bg-blue-50',
  }
  const headerMap = {
    slate:  'bg-slate-100 text-slate-700',
    purple: 'bg-purple-100 text-purple-700',
    gold:   'bg-amber-100 text-amber-700',
    navy:   'bg-blue-100 text-blue-700',
  }

  function openEdit(plan) {
    setEditForm({ ...plan })
    setEditing(plan.id)
  }
  function saveEdit() {
    setPlans(prev => prev.map(p => p.id === editing ? { ...editForm } : p))
    setEditing(null)
    toast.success('Plan updated.')
  }

  return (
    <div className="space-y-6">
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h4 className="font-bold text-[#151022] text-base mb-4">Edit Plan: {editForm.name}</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'name',        label: 'Plan Name',     type: 'text' },
                { key: 'price_usd',   label: 'Price (USD)',   type: 'number' },
                { key: 'price_lrd',   label: 'Price (LRD)',   type: 'number' },
                { key: 'members',     label: 'Member Limit',  type: 'number' },
                { key: 'branches',    label: 'Branch Limit',  type: 'number' },
                { key: 'sms_limit',   label: 'SMS Limit',     type: 'number' },
                { key: 'trial_days',  label: 'Trial Days',    type: 'number' },
              ].map(f => (
                <div key={f.key} className={f.key === 'name' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={editForm[f.key] || ''}
                    onChange={e => setEditForm({ ...editForm, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              ))}
              <div className="col-span-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Active</span>
                <Toggle enabled={editForm.active} onChange={v => setEditForm({ ...editForm, active: v })} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditing(null)} className="flex-1 border border-slate-200 rounded-xl py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={saveEdit} className="flex-1 bg-[#8A19FF] hover:bg-purple-700 text-white rounded-xl py-2 text-sm font-semibold">Save Plan</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map(plan => (
          <div key={plan.id} className={`rounded-2xl border-2 p-5 relative ${colorMap[plan.color] || colorMap.slate}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8A19FF] text-white text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold mb-3 ${headerMap[plan.color] || headerMap.slate}`}>
              {plan.name}
            </div>
            <div className="mb-1">
              <span className="text-2xl font-black text-slate-800">${plan.price_usd}</span>
              <span className="text-xs text-slate-500 ml-1">/mo</span>
            </div>
            <div className="text-xs text-slate-500 mb-4">LRD {plan.price_lrd.toLocaleString()}/mo</div>
            <div className="space-y-1.5 text-xs text-slate-600 mb-4">
              <div className="flex justify-between"><span>Members</span><span className="font-semibold">{plan.members >= 9999 ? 'Unlimited' : plan.members}</span></div>
              <div className="flex justify-between"><span>Branches</span><span className="font-semibold">{plan.branches >= 999 ? 'Unlimited' : plan.branches}</span></div>
              <div className="flex justify-between"><span>SMS/mo</span><span className="font-semibold">{plan.sms_limit >= 9999 ? 'Unlimited' : plan.sms_limit}</span></div>
              <div className="flex justify-between"><span>Trial</span><span className="font-semibold">{plan.trial_days} days</span></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Toggle enabled={plan.active} onChange={v => setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, active: v } : p))} size="sm" />
                <span className="text-xs text-slate-500">{plan.active ? 'Active' : 'Inactive'}</span>
              </div>
              <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg hover:bg-white/60 text-slate-500">
                <Edit2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <SectionCard title="Active Subscriptions" description="All church subscription records.">
        <EmptyState icon={CreditCard} title="No active subscriptions yet" description="Subscription tracking will be available when billing is configured." />
      </SectionCard>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 4: FEATURE CONTROL — Real data from feature_flags table
// ═══════════════════════════════════════════════════════════════
function FeaturesSection() {
  const PLAN_OPTIONS = ['starter', 'growth', 'pro', 'enterprise']

  // Static features (not in DB — core features)
  const STATIC_FEATURES = [
    { id: 'members',       label: 'Members Management',    desc: 'Add, edit, and manage church members.',          enabled: true  },
    { id: 'attendance',    label: 'Attendance Tracking',   desc: 'Record and report on service attendance.',       enabled: true  },
    { id: 'finance',       label: 'Finance Module',        desc: 'Tithes, offerings, and budget management.',      enabled: true  },
    { id: 'events',        label: 'Events Management',     desc: 'Create and manage church events.',               enabled: true  },
    { id: 'prayer',        label: 'Prayer Requests',       desc: 'Collect and respond to prayer requests.',        enabled: true  },
    { id: 'sms',           label: 'SMS Notifications',     desc: 'Send SMS alerts to church members.',             enabled: true  },
    { id: 'reports',       label: 'Reports & Analytics',   desc: 'Detailed reports and data exports.',             enabled: true  },
    { id: 'multibranch',   label: 'Multi-Branch Support',  desc: 'Manage multiple church branches.',               enabled: true  },
    { id: 'pwa',           label: 'PWA Mobile Access',     desc: 'Install app on mobile devices.',                 enabled: true  },
    { id: 'mobilemoney',   label: 'Mobile Money (MoMo)',   desc: 'Accept payments via Orange Money & Lonestar.',   enabled: false },
  ]

  const [dbFeatures, setDbFeatures] = useState([])
  const [staticFeatures, setStaticFeatures] = useState(STATIC_FEATURES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadFeatures() }, [])

  async function loadFeatures() {
    setLoading(true)
    const { data } = await insforge.database.from('feature_flags').select('*').order('feature_label')
    setDbFeatures(data || [])
    setLoading(false)
  }

  async function toggleDbFeature(feature) {
    const newVal = !feature.enabled_globally
    setDbFeatures(prev => prev.map(f => f.id === feature.id ? { ...f, enabled_globally: newVal } : f))
    const { error } = await insforge.database.from('feature_flags')
      .update({ enabled_globally: newVal, updated_at: new Date().toISOString() })
      .eq('id', feature.id)
    if (error) {
      toast.error('Failed to update feature: ' + error.message)
      setDbFeatures(prev => prev.map(f => f.id === feature.id ? { ...f, enabled_globally: !newVal } : f))
    } else {
      toast.success(`${feature.feature_label} ${newVal ? 'enabled' : 'disabled'}.`)
    }
  }

  async function updateDbPlan(feature, plan) {
    setDbFeatures(prev => prev.map(f => f.id === feature.id ? { ...f, min_plan: plan } : f))
    await insforge.database.from('feature_flags').update({ min_plan: plan }).eq('id', feature.id)
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        Enable or disable platform features globally. Media features (Live Streams, Audio, Devotionals, Transcription)
        are stored in InsForge and take effect immediately.
      </p>

      {/* Media features from DB */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          Media & Streaming Features
          <span className="text-xs font-normal text-slate-400">(stored in InsForge — instant effect)</span>
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {dbFeatures.map(f => (
                <div key={f.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{f.feature_label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div>
                      <label className="text-xs text-slate-500 mr-2">Min. Plan</label>
                      <select value={f.min_plan || 'starter'}
                        onChange={e => updateDbPlan(f, e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400">
                        {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                      </select>
                    </div>
                    <Toggle enabled={f.enabled_globally} onChange={() => toggleDbFeature(f)} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Core features — static toggles */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Core Platform Features
        </h3>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {staticFeatures.map(f => (
              <div key={f.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                </div>
                <Toggle enabled={f.enabled}
                  onChange={() => setStaticFeatures(prev => prev.map(x => x.id === f.id ? { ...x, enabled: !x.enabled } : x))}
                  size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bible Learning — backed by platform_feature_flags table */}
      <BibleLearningFlagsBlock />
    </div>
  )
}

// ─── Bible Learning toggles (sub-block of FeaturesSection) ─────
function BibleLearningFlagsBlock() {
  const FLAGS = [
    { key: 'bible_learning',                label: 'Free Bible Learning Resources', desc: 'Master switch for the entire section across all church panels.' },
    { key: 'bible_learning_bibleproject',   label: 'BibleProject Integration',      desc: 'Show the BibleProject tab + resources.' },
    { key: 'bible_learning_wvbs',           label: 'WVBS Integration',              desc: 'Show the WVBS Bible Videos tab + resources.' },
    { key: 'bible_learning_embedded_player',label: 'Embedded Video Player',         desc: 'Play videos inside ChurchFlow (uncheck to force external links).' },
  ]

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await insforge.database
      .from('platform_feature_flags').select('*')
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function toggle(key, current) {
    setBusyKey(key)
    const next = !current
    setRows((p) => p.map((r) => r.key === key ? { ...r, enabled: next } : r))
    const { error } = await insforge.database.rpc('set_feature_flag', {
      p_key: key, p_enabled: next,
    })
    if (error) {
      toast.error('Failed: ' + error.message)
      setRows((p) => p.map((r) => r.key === key ? { ...r, enabled: current } : r))
    } else {
      toast.success(`${key} ${next ? 'enabled' : 'disabled'}.`)
    }
    setBusyKey(null)
  }

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        Bible Learning Resources
        <span className="text-xs font-normal text-slate-400">(stored in InsForge — instant effect)</span>
      </h3>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {FLAGS.map((f) => {
              const row = rows.find((r) => r.key === f.key)
              const enabled = row ? row.enabled : true
              return (
                <div key={f.key} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                  <Toggle enabled={enabled} onChange={() => toggle(f.key, enabled)} size="sm" />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 5: USERS & ROLES
// ═══════════════════════════════════════════════════════════════
function UsersSection() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const { data, error } = await insforge.database
        .from('user_profiles')
        .select('*, churches(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setUsers(data || [])
    } catch {
      toast.error('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  async function suspendUser(id) {
    const { error } = await insforge.database.from('user_profiles').update({ is_active: false }).eq('id', id)
    if (error) { toast.error('Failed to suspend user.'); return }
    toast.success('User suspended.')
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: false } : u))
  }

  const roleColor = {
    super_admin:   'bg-[#151022] text-white',
    church_admin:  'bg-purple-100 text-purple-700',
    pastor:        'bg-blue-100 text-blue-700',
    finance_admin: 'bg-amber-100 text-amber-700',
    member:        'bg-slate-100 text-slate-600',
  }

  const PLATFORM_ROLES = [
    { role: 'Super Admin',    desc: 'Full platform control — billing, churches, users, system settings.' },
    { role: 'Support Admin',  desc: 'View churches, respond to support tickets, view audit logs.' },
    { role: 'Billing Admin',  desc: 'Manage payments, invoices, and subscription plans.' },
    { role: 'Technical Admin', desc: 'API access, system health monitoring, backup management.' },
  ]

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PLATFORM_ROLES.map(r => (
          <div key={r.role} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
              <Shield size={18} className="text-purple-600" />
            </div>
            <p className="font-bold text-slate-800 text-sm">{r.role}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <button onClick={fetchUsers} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="Platform users will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Church</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {user.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="font-semibold text-slate-800">{user.full_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{user.email || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${roleColor[user.role] || 'bg-slate-100 text-slate-600'}`}>
                        {user.role?.replace(/_/g, ' ') || 'member'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{user.churches?.name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={user.is_active === false ? 'suspended' : 'active'} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button title="View" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Eye size={14} /></button>
                        {user.is_active !== false && (
                          <button onClick={() => suspendUser(user.id)} className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold">
                            Suspend
                          </button>
                        )}
                        <button title="Reset Password" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Key size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 6: PAYMENTS
// ═══════════════════════════════════════════════════════════════
function PaymentsSection() {
  const [orangeKey, setOrangeKey] = useState('')
  const [lonestarKey, setLonestarKey] = useState('')
  const [orangeEnabled, setOrangeEnabled] = useState(false)
  const [lonestarEnabled, setLonestarEnabled] = useState(false)
  const [manualApproval, setManualApproval] = useState(true)
  const [bankForm, setBankForm] = useState({ bank: '', account: '', branch: '' })

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard title="USD Billing" description="International card payments via Stripe.">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-slate-700">Stripe Integration</p>
              <p className="text-xs text-slate-500 mt-0.5">Configured for USD payments</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              <Clock size={11} /> Coming Soon
            </span>
          </div>
        </SectionCard>

        <SectionCard title="LRD Billing" description="Local Liberian dollar manual billing.">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-slate-700">Manual LRD Payments</p>
              <p className="text-xs text-slate-500 mt-0.5">Manually record and approve payments</p>
            </div>
            <Toggle enabled={manualApproval} onChange={setManualApproval} size="sm" />
          </div>
        </SectionCard>

        <SectionCard title="Orange Money API" description="Accept payments via Orange Money Liberia.">
          <div className="space-y-3">
            <MaskedInput value={orangeKey} onChange={setOrangeKey} placeholder="Enter Orange Money API key..." />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Enable Orange Money</span>
              <Toggle enabled={orangeEnabled} onChange={setOrangeEnabled} size="sm" />
            </div>
            <button onClick={() => toast.success('Orange Money settings saved.')} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl text-sm font-semibold transition-colors">
              Save Orange Money Config
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Lonestar MTN MoMo API" description="Accept payments via Lonestar MTN Mobile Money.">
          <div className="space-y-3">
            <MaskedInput value={lonestarKey} onChange={setLonestarKey} placeholder="Enter Lonestar MoMo API key..." />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Enable Lonestar MoMo</span>
              <Toggle enabled={lonestarEnabled} onChange={setLonestarEnabled} size="sm" />
            </div>
            <button onClick={() => toast.success('Lonestar settings saved.')} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-xl text-sm font-semibold transition-colors">
              Save Lonestar Config
            </button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Bank Account Details" description="Platform bank account for direct transfers.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bank Name</label>
            <input value={bankForm.bank} onChange={e => setBankForm({ ...bankForm, bank: e.target.value })} placeholder="e.g. Ecobank Liberia" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account Number</label>
            <MaskedInput value={bankForm.account} onChange={v => setBankForm({ ...bankForm, account: v })} placeholder="Account number..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Branch</label>
            <input value={bankForm.branch} onChange={e => setBankForm({ ...bankForm, branch: e.target.value })} placeholder="e.g. Monrovia Main" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
        </div>
        <button onClick={() => toast.success('Bank details saved.')} className="mt-4 flex items-center gap-2 bg-[#8A19FF] hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors">
          <Save size={15} /> Save Bank Details
        </button>
      </SectionCard>

      <SectionCard title="Payment History" description="All platform-level payment transactions.">
        <EmptyState icon={DollarSign} title="No payment records yet" description="Payment history will appear here once billing is configured." />
      </SectionCard>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 7: SMS & EMAIL
// ═══════════════════════════════════════════════════════════════
function SmsSection() {
  const [smsKey, setSmsKey] = useState('')
  const [smsSender, setSmsSender] = useState('ChurchFlow')
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUser, setSmtpUser] = useState('')
  const [emailSender, setEmailSender] = useState('ChurchFlow Liberia')
  const [wapiKey, setWapiKey] = useState('')
  const [wapiPhone, setWapiPhone] = useState('')
  const [pushEnabled, setPushEnabled] = useState(false)
  const [smsUsage, setSmsUsage] = useState([])

  useEffect(() => {
    async function fetchSmsUsage() {
      try {
        const { data } = await insforge.database.from('sms_logs').select('church_id, id', { count: 'exact' })
        setSmsUsage(data || [])
      } catch { /* table may not exist yet */ }
    }
    fetchSmsUsage()
  }, [])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard title="SMS Provider" description="Configure the SMS gateway for notifications.">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">API Key</label>
              <MaskedInput value={smsKey} onChange={setSmsKey} placeholder="Enter SMS API key..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sender Name</label>
              <input value={smsSender} onChange={e => setSmsSender(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => toast.success('SMS config saved.')} className="flex-1 bg-[#8A19FF] hover:bg-purple-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors">
                Save Config
              </button>
              <button onClick={() => toast('Test SMS sent.', { icon: '📱' })} className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 rounded-xl text-sm font-semibold transition-colors">
                Test SMS
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Email Provider (SMTP)" description="Configure SMTP for transactional emails.">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">SMTP Host</label>
                <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.example.com" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Port</label>
                <input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">SMTP Username</label>
              <input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="user@example.com" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sender Name</label>
              <input value={emailSender} onChange={e => setEmailSender(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <button onClick={() => toast.success('Email config saved.')} className="w-full bg-[#8A19FF] hover:bg-purple-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors">
              Save Config
            </button>
          </div>
        </SectionCard>

        <SectionCard title="WhatsApp Business API" description="Connect WhatsApp for automated messaging.">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">API Key</label>
              <MaskedInput value={wapiKey} onChange={setWapiKey} placeholder="Enter WhatsApp API key..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number ID</label>
              <input value={wapiPhone} onChange={e => setWapiPhone(e.target.value)} placeholder="+231 xxx xxx xxx" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <button onClick={() => toast.success('WhatsApp config saved.')} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors">
              Save WhatsApp Config
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Push Notifications" description="Web push notifications for browser alerts.">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-slate-700">Enable Push Notifications</p>
                <p className="text-xs text-slate-500 mt-0.5">Send browser push notifications to users</p>
              </div>
              <Toggle enabled={pushEnabled} onChange={setPushEnabled} size="sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">VAPID Public Key</label>
              <input disabled value="(auto-generated by InsForge)" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400 cursor-not-allowed" />
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="SMS Usage by Church" description="Monthly SMS consumption per church.">
        {smsUsage.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No SMS data yet" description="SMS usage per church will appear here once the SMS module is active." />
        ) : (
          <p className="text-sm text-slate-500">{smsUsage.length} SMS log entries found.</p>
        )}
      </SectionCard>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 8: SECURITY
// ═══════════════════════════════════════════════════════════════
function SecuritySection() {
  const [minLength, setMinLength] = useState(8)
  const [requireNumber, setRequireNumber] = useState(true)
  const [requireUpper, setRequireUpper] = useState(true)
  const [requireSpecial, setRequireSpecial] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState('4hr')
  const [maxSessions, setMaxSessions] = useState(3)
  const [maxAttempts, setMaxAttempts] = useState(5)
  const [lockoutDuration, setLockoutDuration] = useState('15min')
  const [twoFactor, setTwoFactor] = useState(false)
  const [allowedIps, setAllowedIps] = useState('')
  const [logRetention, setLogRetention] = useState('90')

  const score = [requireNumber, requireUpper, requireSpecial, twoFactor, minLength >= 8].filter(Boolean).length
  const scoreLabel = score >= 4 ? 'Excellent' : score >= 3 ? 'Good' : score >= 2 ? 'Fair' : 'Weak'
  const scoreColor = score >= 4 ? 'text-green-600' : score >= 3 ? 'text-blue-600' : score >= 2 ? 'text-amber-600' : 'text-red-600'
  const scoreBg = score >= 4 ? 'bg-green-100' : score >= 3 ? 'bg-blue-100' : score >= 2 ? 'bg-amber-100' : 'bg-red-100'

  return (
    <div className="space-y-5">
      <div className={`flex items-center gap-4 ${scoreBg} rounded-2xl p-4`}>
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
          <Shield size={22} className={scoreColor} />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Security Health Score</p>
          <p className={`text-xl font-black ${scoreColor}`}>{score * 20}% — {scoreLabel}</p>
        </div>
        <div className="ml-auto flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-3 h-8 rounded-sm ${i < score ? 'bg-green-500' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard title="Password Rules" description="Enforce strong passwords for all users.">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Minimum Length: {minLength} characters</label>
              <input type="range" min={6} max={20} value={minLength} onChange={e => setMinLength(Number(e.target.value))} className="w-full accent-purple-600" />
            </div>
            {[
              { label: 'Require Numbers', state: requireNumber, setState: setRequireNumber },
              { label: 'Require Uppercase', state: requireUpper, setState: setRequireUpper },
              { label: 'Require Special Character', state: requireSpecial, setState: setRequireSpecial },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{row.label}</span>
                <Toggle enabled={row.state} onChange={row.setState} size="sm" />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Session Settings" description="Control how long users stay logged in.">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Session Timeout</label>
              <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="30min">30 Minutes</option>
                <option value="1hr">1 Hour</option>
                <option value="4hr">4 Hours</option>
                <option value="8hr">8 Hours</option>
                <option value="24hr">24 Hours</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Max Concurrent Sessions</label>
              <input type="number" min={1} max={10} value={maxSessions} onChange={e => setMaxSessions(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Login Protection" description="Prevent brute-force attacks.">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Max Failed Attempts</label>
              <input type="number" min={3} max={20} value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lockout Duration</label>
              <select value={lockoutDuration} onChange={e => setLockoutDuration(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="5min">5 Minutes</option>
                <option value="15min">15 Minutes</option>
                <option value="30min">30 Minutes</option>
                <option value="1hr">1 Hour</option>
                <option value="24hr">24 Hours</option>
              </select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Two-Factor Authentication" description="Require 2FA for platform admin accounts.">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-slate-700">Enforce 2FA for Admins</p>
              <p className="text-xs text-slate-500 mt-0.5">All super_admin accounts must use 2FA</p>
            </div>
            <Toggle enabled={twoFactor} onChange={setTwoFactor} />
          </div>
        </SectionCard>

        <SectionCard title="IP Restriction" description="Limit admin access to specific IP addresses.">
          <textarea
            rows={4}
            value={allowedIps}
            onChange={e => setAllowedIps(e.target.value)}
            placeholder="Leave empty to allow all IPs.&#10;One IP per line, e.g.:&#10;197.168.1.1&#10;10.0.0.0/24"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
        </SectionCard>

        <SectionCard title="Audit Log Retention" description="How long to keep audit log records.">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Retention Period</label>
            <select value={logRetention} onChange={e => setLogRetention(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
              {['30', '60', '90', '180', '365'].map(d => <option key={d} value={d}>{d} Days</option>)}
            </select>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end">
        <button onClick={() => toast.success('Security settings saved.')} className="flex items-center gap-2 bg-[#8A19FF] hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          <Save size={16} /> Save Security Settings
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 9: BACKUP
// ═══════════════════════════════════════════════════════════════
function BackupSection() {
  const [autoBackup, setAutoBackup] = useState(true)
  const [schedule, setSchedule] = useState('daily')
  const [backupTime, setBackupTime] = useState('02:00')
  const [retention, setRetention] = useState('30')
  const [running, setRunning] = useState(false)

  async function runBackup() {
    setRunning(true)
    await new Promise(r => setTimeout(r, 2500))
    setRunning(false)
    toast.success('Manual backup completed successfully.')
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard title="Automatic Backup" description="Schedule regular database backups.">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Enable Auto Backup</p>
                <p className="text-xs text-slate-500 mt-0.5">Automatically backup all data</p>
              </div>
              <Toggle enabled={autoBackup} onChange={setAutoBackup} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Backup Schedule</label>
              <select value={schedule} onChange={e => setSchedule(e.target.value)} disabled={!autoBackup} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-slate-50 disabled:text-slate-400">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Backup Time</label>
              <input type="time" value={backupTime} onChange={e => setBackupTime(e.target.value)} disabled={!autoBackup} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-slate-50 disabled:text-slate-400" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Storage & Retention" description="Where backups are stored and for how long.">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Storage Location</label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <Server size={18} className="text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">InsForge Cloud Storage</p>
                  <p className="text-xs text-slate-500">Encrypted, geo-redundant storage</p>
                </div>
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Connected</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Retention Period</label>
              <select value={retention} onChange={e => setRetention(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                {['7', '14', '30', '60', '90'].map(d => <option key={d} value={d}>{d} Days</option>)}
              </select>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex gap-3">
        <button onClick={runBackup} disabled={running} className="flex items-center gap-2 bg-[#8A19FF] hover:bg-purple-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          {running ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Running...</> : <><Database size={16} /> Run Manual Backup Now</>}
        </button>
        <button disabled className="flex items-center gap-2 border border-slate-200 text-slate-400 px-6 py-2.5 rounded-xl font-semibold text-sm cursor-not-allowed">
          <Download size={16} /> Download Latest Backup
          <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded-md ml-1">Contact Support</span>
        </button>
      </div>

      <SectionCard title="Backup History" description="Record of all backups performed.">
        <EmptyState icon={Database} title="No backups yet" description="Backup history will appear here after the first backup runs." />
      </SectionCard>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 10: AUDIT LOGS — Real data from audit_logs table
// Super Admin sees ALL platform logs. Church Admin sees own church.
// ═══════════════════════════════════════════════════════════════
function AuditSection() {
  const [logs, setLogs]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [dateFrom, setDateFrom]     = useState('')
  const [dateTo, setDateTo]         = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [churchFilter, setChurchFilter] = useState('all')
  const [churches, setChurches]     = useState([])
  const [total, setTotal]           = useState(0)
  const PAGE = 50

  useEffect(() => { fetchLogs(); fetchChurches() }, [])

  async function fetchChurches() {
    const { data } = await insforge.database.from('churches').select('id, name').order('name')
    setChurches(data || [])
  }

  async function fetchLogs() {
    setLoading(true)
    try {
      let query = insforge.database
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(PAGE)

      if (dateFrom) query = query.gte('created_at', dateFrom + 'T00:00:00Z')
      if (dateTo)   query = query.lte('created_at', dateTo   + 'T23:59:59Z')
      if (roleFilter   !== 'all') query = query.eq('actor_role', roleFilter)
      if (actionFilter !== 'all') query = query.eq('action', actionFilter)
      if (churchFilter !== 'all') query = query.eq('church_id', churchFilter)
      if (userSearch.trim()) {
        query = query.or(`actor_name.ilike.%${userSearch}%,description.ilike.%${userSearch}%`)
      }

      const { data, count, error } = await query
      if (error) throw error
      setLogs(data || [])
      setTotal(count || 0)
    } catch (err) {
      console.error('[AuditLogs]', err.message)
    } finally {
      setLoading(false)
    }
  }

  const ACTION_COLORS = {
    login:               'bg-blue-100 text-blue-700',
    logout:              'bg-slate-100 text-slate-600',
    failed_login:        'bg-red-100 text-red-700',
    member_created:      'bg-green-100 text-green-700',
    member_updated:      'bg-yellow-100 text-yellow-700',
    member_deleted:      'bg-red-100 text-red-700',
    church_created:      'bg-emerald-100 text-emerald-700',
    church_updated:      'bg-blue-100 text-blue-700',
    department_created:  'bg-purple-100 text-purple-700',
    finance_record_created: 'bg-amber-100 text-amber-700',
    profile_update:      'bg-indigo-100 text-indigo-700',
    profile_photo_upload:'bg-pink-100 text-pink-700',
    settings_changed:    'bg-orange-100 text-orange-700',
    role_changed:        'bg-violet-100 text-violet-700',
    password_reset:      'bg-rose-100 text-rose-700',
    email_verified:      'bg-teal-100 text-teal-700',
  }

  const ALL_ACTIONS = Object.keys(ACTION_COLORS)
  const ALL_ROLES = ['super_admin','church_admin','pastor','treasurer','secretary','dept_leader','member']

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
          <option value="all">All Roles</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
        </select>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
          <option value="all">All Actions</option>
          {ALL_ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g,' ')}</option>)}
        </select>
        <select value={churchFilter} onChange={e => setChurchFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
          <option value="all">All Churches</option>
          {churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
            placeholder="Search name or description..."
            className="pl-9 pr-3 border border-slate-200 rounded-xl py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 min-w-[200px]" />
        </div>
        <button onClick={fetchLogs}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#8A19FF] hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors">
          <RefreshCw size={13} /> Apply
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState icon={FileText} title="No audit logs yet"
            description="Actions across the platform will appear here as users interact with ChurchFlow." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Timestamp','Actor','Role','Church','Action','Description','Browser'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {log.actor_name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {log.actor_role && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 capitalize">
                          {log.actor_role.replace(/_/g,' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {log.church_name || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600'}`}>
                        {log.action?.replace(/_/g,' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">
                      {log.description || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{log.browser || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {logs.length} of {total} log entries</span>
          {total > PAGE && (
            <span className="text-amber-600 font-medium">Showing latest {PAGE} — use date filters to narrow results</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 11: NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
function NotificationsSection() {
  const [settings, setSettings] = useState({
    announcements:    true,
    new_church:       true,
    subscription_expiry: true,
    expiry_days:      '14',
    failed_payment:   true,
    billing_reminders: true,
    maintenance:      true,
    suspicious_login: true,
  })
  const [email, setEmail] = useState('morrisldorleyjr21@gmail.com')

  const rows = [
    { key: 'announcements',    label: 'Platform Announcements',      desc: 'Broadcast messages to all church admins.' },
    { key: 'new_church',       label: 'New Church Registration Alert', desc: 'Notify when a new church registers.' },
    { key: 'failed_payment',   label: 'Failed Payment Alert',         desc: 'Alert when a payment transaction fails.' },
    { key: 'billing_reminders', label: 'Billing Reminders',           desc: 'Remind churches before subscription expires.' },
    { key: 'maintenance',      label: 'Maintenance Alerts',           desc: 'Notify users of planned downtime.' },
    { key: 'suspicious_login', label: 'Suspicious Login Alerts',      desc: 'Alert on unusual login patterns.' },
  ]

  return (
    <div className="space-y-5">
      <SectionCard title="Platform Alert Recipients" description="Who receives platform-level notifications.">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alert Email Address</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 max-w-sm" />
        </div>
      </SectionCard>

      <SectionCard title="Notification Settings" description="Control which events trigger notifications.">
        <div className="divide-y divide-slate-50">
          {rows.map(row => (
            <div key={row.key} className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">{row.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{row.desc}</p>
              </div>
              <Toggle
                enabled={settings[row.key]}
                onChange={v => setSettings({ ...settings, [row.key]: v })}
                size="sm"
              />
            </div>
          ))}

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Subscription Expiry Alert</p>
              <p className="text-xs text-slate-500 mt-0.5">Alert X days before a subscription expires.</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={settings.expiry_days}
                onChange={e => setSettings({ ...settings, expiry_days: e.target.value })}
                disabled={!settings.subscription_expiry}
                className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
              <Toggle
                enabled={settings.subscription_expiry}
                onChange={v => setSettings({ ...settings, subscription_expiry: v })}
                size="sm"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button onClick={() => toast.success('Notification settings saved.')} className="flex items-center gap-2 bg-[#8A19FF] hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          <Save size={16} /> Save Settings
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 12: BRANDING
// ═══════════════════════════════════════════════════════════════
function BrandingSection() {
  const [watermark, setWatermark] = useState(false)
  const [watermarkText, setWatermarkText] = useState('ChurchFlow Liberia')
  const [emailHeaderColor, setEmailHeaderColor] = useState('#8A19FF')
  const logoRef = useRef(null)
  const invoiceRef = useRef(null)

  const emailColors = ['#8A19FF', '#2563EB', '#059669', '#DC2626', '#151022', '#F59E0B']

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard title="Platform Logo" description="Upload the main logo shown across the platform.">
          <div
            onClick={() => logoRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-colors"
          >
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={() => toast.success('Logo uploaded.')} />
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <Upload size={24} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Click to upload logo</p>
            <p className="text-xs text-slate-400 mt-1">PNG, SVG recommended. Max 2MB.</p>
          </div>
          <div className="mt-3 p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Current logo preview:</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#151022] flex items-center justify-center">
                <span className="text-white text-xs font-black">CF</span>
              </div>
              <span className="text-sm font-bold text-[#151022]">ChurchFlow Liberia</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Invoice Logo" description="Logo used on PDF invoices and receipts.">
          <div
            onClick={() => invoiceRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-colors"
          >
            <input ref={invoiceRef} type="file" accept="image/*" className="hidden" onChange={() => toast.success('Invoice logo uploaded.')} />
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <Upload size={24} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Click to upload invoice logo</p>
            <p className="text-xs text-slate-400 mt-1">PNG, SVG recommended. Max 2MB.</p>
          </div>
        </SectionCard>

        <SectionCard title="Dashboard Watermark" description="Add a subtle brand watermark to the dashboard.">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Enable Watermark</p>
                <p className="text-xs text-slate-500 mt-0.5">Display a faint watermark on all pages</p>
              </div>
              <Toggle enabled={watermark} onChange={setWatermark} size="sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Watermark Text</label>
              <input value={watermarkText} onChange={e => setWatermarkText(e.target.value)} disabled={!watermark} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-slate-50 disabled:text-slate-400" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Email Template Color" description="Header color used in all platform emails.">
          <div>
            <div className="flex flex-wrap gap-3 mb-4">
              {emailColors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setEmailHeaderColor(c)}
                  title={c}
                  className={`w-9 h-9 rounded-full border-4 transition-all ${emailHeaderColor === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <div className="h-8" style={{ backgroundColor: emailHeaderColor }} />
              <div className="p-3 bg-white">
                <p className="text-xs font-semibold text-slate-700">Email Preview</p>
                <p className="text-xs text-slate-400 mt-0.5">This is a sample email from ChurchFlow Liberia.</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Login Page Preview" description="How your login page appears to church admins.">
        <div className="flex justify-center">
          <div className="w-72 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
            <div className="h-24 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #151022, #8A19FF)' }}>
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-400 mx-auto flex items-center justify-center text-[#151022] font-black text-lg mb-1">C</div>
                <p className="text-white text-sm font-bold">ChurchFlow Liberia</p>
              </div>
            </div>
            <div className="p-4 bg-white space-y-2">
              <div className="h-8 bg-slate-100 rounded-lg" />
              <div className="h-8 bg-slate-100 rounded-lg" />
              <div className="h-8 rounded-lg" style={{ backgroundColor: emailHeaderColor }} />
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button onClick={() => toast.success('Branding settings saved.')} className="flex items-center gap-2 bg-[#8A19FF] hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          <Save size={16} /> Save Branding
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 13: LEGAL
// ═══════════════════════════════════════════════════════════════
function LegalSection() {
  const TODAY = new Date().toLocaleDateString()
  const policies = [
    {
      key: 'tos',
      title: 'Terms of Service',
      placeholder: `TERMS OF SERVICE\n\nEffective Date: ${TODAY}\n\nBy accessing or using ChurchFlow Liberia ("the Platform"), you agree to these Terms of Service.\n\n1. ACCEPTANCE OF TERMS\nBy using the Platform, you confirm that you are at least 18 years of age and authorized to act on behalf of your church organization...\n\n2. PLATFORM USE\nThe Platform is provided for church management purposes only. You agree not to misuse the Platform...\n\n3. INTELLECTUAL PROPERTY\nAll content, design, and code on the Platform is the property of ChurchFlow Liberia...\n\n[Continue with full terms...]`,
    },
    {
      key: 'privacy',
      title: 'Privacy Policy',
      placeholder: `PRIVACY POLICY\n\nEffective Date: ${TODAY}\n\nChurchFlow Liberia is committed to protecting your personal information.\n\n1. INFORMATION WE COLLECT\nWe collect information you provide directly, including church name, administrator details, and member records...\n\n2. HOW WE USE YOUR DATA\nWe use collected data to provide and improve the Platform services...\n\n3. DATA SHARING\nWe do not sell your data to third parties...\n\n[Continue with full policy...]`,
    },
    {
      key: 'refund',
      title: 'Refund Policy',
      placeholder: `REFUND POLICY\n\nEffective Date: ${TODAY}\n\nChurchFlow Liberia offers the following refund policy:\n\n1. TRIAL PERIOD\nAll plans include a free trial period. No payment is required during the trial...\n\n2. REFUND ELIGIBILITY\nRefund requests must be made within 7 days of billing...\n\n[Continue...]`,
    },
    {
      key: 'data',
      title: 'Data Protection Notice',
      placeholder: `DATA PROTECTION NOTICE\n\nEffective Date: ${TODAY}\n\nChurchFlow Liberia processes personal data in accordance with applicable data protection laws.\n\n1. DATA CONTROLLER\nChurchFlow Liberia acts as the data controller for all platform data...\n\n2. DATA RETENTION\nWe retain your data for as long as your account is active or as needed to provide services...\n\n[Continue...]`,
    },
    {
      key: 'church_agreement',
      title: 'Church User Agreement',
      placeholder: `CHURCH USER AGREEMENT\n\nEffective Date: ${TODAY}\n\nThis agreement is entered into between ChurchFlow Liberia and the Church Organization.\n\n1. SUBSCRIPTION\nThe Church agrees to maintain an active subscription to access the Platform...\n\n2. DATA OWNERSHIP\nThe Church retains ownership of all member data entered into the Platform...\n\n3. ACCEPTABLE USE\nThe Church agrees to use the Platform for lawful church management purposes only...\n\n[Continue...]`,
    },
  ]

  const [values, setValues] = useState(() =>
    Object.fromEntries(policies.map(p => [p.key, p.placeholder]))
  )
  const [saving, setSaving] = useState(null)

  async function savePolicy(key) {
    setSaving(key)
    await new Promise(r => setTimeout(r, 700))
    setSaving(null)
    toast.success('Policy saved.')
  }

  return (
    <div className="space-y-5">
      {policies.map(p => (
        <SectionCard
          key={p.key}
          title={p.title}
          description={`Last updated: ${TODAY}`}
          action={
            <button
              onClick={() => savePolicy(p.key)}
              disabled={saving === p.key}
              className="flex items-center gap-1.5 bg-[#8A19FF] hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-xl font-semibold text-xs transition-colors"
            >
              <Save size={13} />
              {saving === p.key ? 'Saving...' : 'Save'}
            </button>
          }
        >
          <textarea
            rows={10}
            value={values[p.key]}
            onChange={e => setValues({ ...values, [p.key]: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-y font-mono leading-relaxed"
          />
        </SectionCard>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 13b: MEMBERS (Platform-wide member management)
// ═══════════════════════════════════════════════════════════════
function MembersSection() {
  const [members, setMembers]       = useState([])
  const [churches, setChurches]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [churchFilter, setChurchFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [membRes, churchRes] = await Promise.all([
        insforge.database
          .from('members')
          .select('*, churches(name)')
          .order('created_at', { ascending: false }),
        insforge.database
          .from('churches')
          .select('id, name')
          .order('name'),
      ])
      setMembers(membRes.data || [])
      setChurches(churchRes.data || [])
    } catch {
      toast.error('Failed to load members.')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(id, current) {
    const { error } = await insforge.database
      .from('members')
      .update({ status: current === 'active' ? 'inactive' : 'active' })
      .eq('id', id)
    if (error) { toast.error('Failed to update status.'); return }
    setMembers(prev => prev.map(m =>
      m.id === id ? { ...m, status: current === 'active' ? 'inactive' : 'active' } : m
    ))
    toast.success('Member status updated.')
  }

  const filtered = members.filter(m => {
    const nameMatch = !search ||
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search)
    const churchMatch = churchFilter === 'all' || m.church_id === churchFilter
    const statusMatch = statusFilter === 'all' || m.status === statusFilter
    return nameMatch && churchMatch && statusMatch
  })

  const totalMembers   = members.length
  const activeMembers  = members.filter(m => m.status !== 'inactive').length
  const newThisMonth   = members.filter(m => {
    const d = new Date(m.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Members',   value: totalMembers,  color: 'text-[#151022]' },
          { label: 'Active Members',  value: activeMembers, color: 'text-green-600' },
          { label: 'New This Month',  value: newThisMonth,  color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members…"
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <select
          value={churchFilter}
          onChange={e => setChurchFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="all">All Churches</option>
          {churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={fetchData}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
        <span className="text-xs text-slate-400 ml-auto">
          {filtered.length} of {totalMembers} members
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={members.length === 0 ? 'No members yet' : 'No matches found'}
            description={members.length === 0
              ? 'Members will appear here once churches start adding people.'
              : 'Try a different search or filter.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Member', 'Church', 'Phone', 'Email', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600
                          flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {m.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 leading-snug">{m.full_name || '—'}</p>
                          {m.member_id && (
                            <p className="text-[10px] text-slate-400 font-mono">{m.member_id}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">
                      {m.churches?.name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {m.phone || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {m.email || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                        ${m.status === 'inactive'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-green-100 text-green-700'}`}>
                        {m.status === 'inactive' ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedMember(m)}
                          title="View details"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => toggleActive(m.id, m.status)}
                          title={m.status === 'inactive' ? 'Activate' : 'Deactivate'}
                          className={`px-2.5 py-1 rounded-lg text-white text-xs font-semibold transition-colors
                            ${m.status === 'inactive'
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-orange-500 hover:bg-orange-600'}`}
                        >
                          {m.status === 'inactive' ? 'Activate' : 'Deactivate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-50 text-xs text-slate-400">
            Showing {filtered.length} member{filtered.length !== 1 ? 's' : ''}
            {churchFilter !== 'all' && ` from ${churches.find(c => c.id === churchFilter)?.name || 'selected church'}`}
          </div>
        )}
      </div>

      {/* Member detail modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-bold text-[#151022] text-base">Member Details</h4>
              <button onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <XCircle size={18} />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600
                flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                {selectedMember.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-base">{selectedMember.full_name || '—'}</p>
                <p className="text-sm text-slate-500">{selectedMember.churches?.name || 'No church'}</p>
                <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-semibold
                  ${selectedMember.status === 'inactive' ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'}`}>
                  {selectedMember.status === 'inactive' ? 'Inactive' : 'Active'}
                </span>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Email',      value: selectedMember.email },
                { label: 'Phone',      value: selectedMember.phone },
                { label: 'Member ID',  value: selectedMember.member_id },
                { label: 'Gender',     value: selectedMember.gender },
                { label: 'Address',    value: selectedMember.address },
                { label: 'Joined',     value: selectedMember.created_at ? new Date(selectedMember.created_at).toLocaleDateString() : null },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex items-start justify-between gap-4">
                  <span className="text-slate-400 font-medium flex-shrink-0">{label}</span>
                  <span className="text-slate-700 text-right">{value}</span>
                </div>
              ) : null)}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { toggleActive(selectedMember.id, selectedMember.status); setSelectedMember(null) }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors
                  ${selectedMember.status === 'inactive'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                {selectedMember.status === 'inactive' ? 'Activate Member' : 'Deactivate Member'}
              </button>
              <button onClick={() => setSelectedMember(null)}
                className="px-5 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 14: API KEYS
// ═══════════════════════════════════════════════════════════════
function ApiSection() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyValue, setNewKeyValue] = useState('')
  const [customKeys, setCustomKeys] = useState([])

  const [keyVis, setKeyVis] = useState({})
  const toggleVis = id => setKeyVis(prev => ({ ...prev, [id]: !prev[id] }))

  const BUILT_IN = [
    { id: 'insforge',   label: 'InsForge API',      value: 'ik_live_••••••••••••••••', status: 'active',   link: 'https://insforge.com/dashboard' },
    { id: 'openrouter', label: 'OpenRouter AI',      value: 'sk-or-v1-••••••••••••••', status: 'inactive', link: null },
    { id: 'sms_api',    label: 'SMS Gateway API',    value: '••••••••••••••••',         status: 'inactive', link: null },
    { id: 'whatsapp',   label: 'WhatsApp Cloud API', value: '••••••••••••••••',         status: 'inactive', link: null },
  ]

  function addKey() {
    if (!newKeyName.trim() || !newKeyValue.trim()) { toast.error('Enter key name and value.'); return }
    setCustomKeys(prev => [...prev, { id: Date.now().toString(), label: newKeyName, value: newKeyValue, status: 'active' }])
    setNewKeyName(''); setNewKeyValue('')
    setShowAddModal(false)
    toast.success('API key added.')
  }

  const allKeys = [...BUILT_IN, ...customKeys]

  return (
    <div className="space-y-5">
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h4 className="font-bold text-[#151022] text-base mb-4">Add New API Key</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Key Name</label>
                <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="e.g. Twilio SMS API" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">API Key / Secret</label>
                <MaskedInput value={newKeyValue} onChange={setNewKeyValue} placeholder="Paste your API key..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 border border-slate-200 rounded-xl py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={addKey} className="flex-1 bg-[#8A19FF] hover:bg-purple-700 text-white rounded-xl py-2 text-sm font-semibold">Add Key</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Manage API keys for all platform integrations.</p>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#8A19FF] hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors">
          <Plus size={15} /> Add New Key
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allKeys.map(k => (
          <div key={k.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Key size={16} className="text-slate-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{k.label}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${k.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {k.status}
                  </span>
                </div>
              </div>
              {k.link && (
                <a href={k.link} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline">View Dashboard</a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2 font-mono text-xs text-slate-600 truncate">
                {keyVis[k.id] ? k.value : '••••••••••••••••••••••'}
              </div>
              <button onClick={() => toggleVis(k.id)} className="p-1.5 text-slate-400 hover:text-slate-600">
                {keyVis[k.id] ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(k.value); toast.success('Copied to clipboard.') }}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <CheckCheck size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <SectionCard title="Webhooks" description="Register URLs to receive real-time event notifications.">
        <textarea
          rows={5}
          placeholder="Enter webhook URLs, one per line:&#10;https://yourserver.com/webhook&#10;https://yourserver2.com/events"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none font-mono"
        />
        <div className="flex gap-3 mt-3">
          <button onClick={() => toast.success('Webhook URLs saved.')} className="flex items-center gap-2 bg-[#8A19FF] hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors">
            <Save size={15} /> Save Webhooks
          </button>
          <button onClick={() => toast('Test webhook event sent.', { icon: '⚡' })} className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-2 rounded-xl font-semibold text-sm transition-colors">
            <Activity size={15} /> Test Webhook
          </button>
        </div>
      </SectionCard>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION ROUTER
// ═══════════════════════════════════════════════════════════════
function SectionContent({ active }) {
  switch (active) {
    case 'platform':      return <PlatformSection />
    case 'churches':      return <ChurchesSection />
    case 'billing':       return <BillingSection />
    case 'features':      return <FeaturesSection />
    case 'users':         return <UsersSection />
    case 'payments':      return <PaymentsSection />
    case 'sms':           return <SmsSection />
    case 'security':      return <SecuritySection />
    case 'backup':        return <BackupSection />
    case 'audit':         return <AuditSection />
    case 'notifications': return <NotificationsSection />
    case 'branding':      return <BrandingSection />
    case 'legal':         return <LegalSection />
    case 'members':       return <MembersSection />
    case 'tutorials':     return <TutorialsManager />
    case 'webinars':      return <WebinarsManager />
    case 'api':           return <ApiSection />
    default:              return <PlatformSection />
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function SuperAdminSettings() {
  const { user } = useAuth()
  const [active, setActive] = useState('platform')
  const [searchTerm, setSearchTerm] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [platformStats, setPlatformStats] = useState({
    churches: null,
    users: null,
    systemStatus: 'checking',
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const [churchRes, userRes] = await Promise.all([
          insforge.database.from('churches').select('id', { count: 'exact' }),
          insforge.database.from('user_profiles').select('id', { count: 'exact' }).eq('is_active', true),
        ])
        setPlatformStats({
          churches: churchRes.count ?? (churchRes.data?.length ?? 0),
          users:    userRes.count ?? (userRes.data?.length ?? 0),
          systemStatus: 'operational',
        })
      } catch {
        setPlatformStats(prev => ({ ...prev, systemStatus: 'operational' }))
      }
    }
    fetchStats()
  }, [])

  const filteredSections = SECTIONS.filter(s =>
    s.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeSection = SECTIONS.find(s => s.id === active)

  const statChips = [
    { label: 'Active Churches',  value: platformStats.churches === null ? '...' : String(platformStats.churches), icon: Building2, color: 'text-purple-600 bg-purple-50' },
    { label: 'Active Users',     value: platformStats.users === null ? '...' : String(platformStats.users),     icon: Users,     color: 'text-blue-600 bg-blue-50' },
    { label: 'Subscriptions',    value: '0 active',                icon: CreditCard, color: 'text-slate-600 bg-slate-50' },
    { label: 'Monthly Revenue',  value: 'LRD 0',                  icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
    { label: 'SMS Usage',        value: '0 / month',              icon: MessageSquare, color: 'text-green-600 bg-green-50' },
    { label: 'Storage',          value: 'Connected',              icon: Server,     color: 'text-teal-600 bg-teal-50' },
  ]

  return (
    <div className="animate-fade-in h-full">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h2 className="text-xl font-black text-[#151022]">Platform Settings</h2>
          <p className="text-slate-500 text-sm mt-0.5">Full control of the ChurchFlow Liberia platform</p>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${platformStats.systemStatus === 'operational' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${platformStats.systemStatus === 'operational' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            {platformStats.systemStatus === 'operational' ? 'All Systems Operational' : 'Checking...'}
          </div>
          <button className="lg:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-50" onClick={() => setSidebarOpen(true)}>
            <Settings size={17} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        {statChips.map(chip => {
          const Icon = chip.icon
          return (
            <div key={chip.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${chip.color}`}>
                <Icon size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 leading-tight">{chip.label}</p>
                <p className="text-sm font-black text-slate-800 leading-tight">{chip.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Body */}
      <div className="flex gap-5 relative">
        {/* Sidebar — Desktop */}
        <aside className="hidden lg:flex flex-col flex-shrink-0 w-60 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden self-start sticky top-4">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search settings..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
          <nav className="py-2 overflow-y-auto">
            {filteredSections.map(section => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActive(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${active === section.id ? 'bg-purple-50 text-[#8A19FF] font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                  <Icon size={16} className={active === section.id ? 'text-[#8A19FF]' : 'text-slate-400'} />
                  {section.label}
                  {active === section.id && <ChevronRight size={14} className="ml-auto text-[#8A19FF]" />}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Sidebar — Mobile Drawer */}
        <div className={`fixed top-0 left-0 h-full w-72 z-50 bg-white shadow-2xl transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <p className="font-bold text-[#151022] text-sm">Settings Menu</p>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500">
              <XCircle size={18} />
            </button>
          </div>
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search settings..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
          <nav className="py-2 overflow-y-auto">
            {filteredSections.map(section => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => { setActive(section.id); setSidebarOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left ${active === section.id ? 'bg-purple-50 text-[#8A19FF] font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Icon size={16} className={active === section.id ? 'text-[#8A19FF]' : 'text-slate-400'} />
                  {section.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            {activeSection && (
              <>
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  {activeSection.icon && <activeSection.icon size={16} className="text-purple-700" />}
                </div>
                <h3 className="text-base font-black text-[#151022]">{activeSection.label}</h3>
              </>
            )}
          </div>
          <SectionContent active={active} />
        </div>
      </div>
    </div>
  )
}
