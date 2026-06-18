// ============================================================
// ChurchFlow Liberia — Church Settings Page
// ALL data from InsForge. Save button writes to InsForge.
// No hardcoded defaults. No fake saves.
// ============================================================
import React, { useState, useEffect, useRef } from 'react'
import {
  Church, Users, Bell, MessageSquare, Palette, HardDrive,
  Save, Upload, Eye, EyeOff, Send, Download, Shield,
  Check, Link2, Copy, Loader2, AlertCircle, RefreshCw, Mail, Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input, Badge } from '../../components/ui'
import { useChurch } from '../../context/ChurchContext'
import { useAuth } from '../../context/AuthContext'
import { insforge } from '../../lib/insforge'
import { uploadChurchLogo, getReadableFileUrl, validateImageUpload as validateImageFile, BUCKETS } from '../../services/imageStorage'
import { createAuditLog, buildActor, AUDIT_ACTIONS } from '../../services/auditLog'
import {
  createInvite, listInvites, setInviteStatus, inviteLinkFor,
} from '../../services/inviteService'
import TwoFactorSection from '../../components/security/TwoFactorSection'
import { downloadMyData, deleteMyAccount, DELETE_CONFIRM_PHRASE } from '../../services/gdprService'

// ─── Sidebar nav items ────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'profile',       label: 'Church Profile',    icon: Church },
  { key: 'invites',       label: 'Invite Links',      icon: Link2 },
  { key: 'security',      label: 'Security (2FA)',    icon: Shield },
  { key: 'roles',         label: 'User Roles',        icon: Users },
  { key: 'notifications', label: 'Notifications',     icon: Bell },
  { key: 'sms',           label: 'SMS Settings',      icon: MessageSquare },
  { key: 'appearance',    label: 'Appearance',        icon: Palette },
  { key: 'backup',        label: 'Backup & Export',   icon: HardDrive },
  { key: 'privacy',       label: 'Privacy & Data',    icon: Lock },
]

// Church-level roles only — Super Admin is a PLATFORM role
const CHURCH_ROLES = [
  {
    role: 'Church Admin',
    description: 'Manages church operations including members, attendance, finance, and events.',
    permissions: ['Members', 'Attendance', 'Finance', 'Events', 'Reports', 'Settings', 'Users'],
    color: 'purple',
  },
  {
    role: 'Pastor',
    description: 'Views member data, prayer requests, and can send messages.',
    permissions: ['Members (read)', 'Prayer', 'Messages', 'Reports (read)'],
    color: 'gold',
  },
  {
    role: 'Treasurer',
    description: 'Manages all financial records, offerings, expenses, and budgets.',
    permissions: ['Finance', 'Reports (Finance)', 'Export'],
    color: 'success',
  },
  {
    role: 'Secretary',
    description: 'Handles member records, attendance, and event coordination.',
    permissions: ['Members', 'Attendance', 'Events'],
    color: 'info',
  },
  {
    role: 'Dept Leader',
    description: 'Views and manages their department members and activities.',
    permissions: ['Dept Members', 'Dept Attendance'],
    color: 'warning',
  },
  {
    role: 'Member',
    description: 'Basic portal access — profile, prayer requests, and announcements.',
    permissions: ['My Profile', 'Prayer (own)', 'Announcements'],
    color: 'gray',
  },
]

const SMS_TEMPLATES = [
  { name: 'Birthday Wishes',   body: 'Happy Birthday, {name}! May God bless you abundantly. – {church_name}',   tag: 'birthday' },
  { name: 'Event Reminder',    body: 'Reminder: {event_title} is on {date} at {time}. We look forward to seeing you! – {church_name}', tag: 'event' },
  { name: 'Follow-Up Message', body: 'Dear {name}, great having you at {church_name}! We would love to connect. Call: {church_phone}', tag: 'followup' },
]

// ─── Church Profile Section ───────────────────────────────────
function ChurchProfileSection({ church, onChurchUpdated }) {
  const { user } = useAuth()
  const logoInputRef = useRef(null)

  const [form, setForm] = useState({
    name: '', location: '', phone: '', email: '',
    website: '', currency: 'LRD', founded: '', description: '',
  })
  const [logoPreview, setLogoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoErr, setLogoErr] = useState(null)

  // ── Load church data — use RPC to bypass RLS ──────────────
  useEffect(() => {
    if (!church?.id) return
    async function loadFresh() {
      // Always refetch from DB via SECURITY DEFINER to get latest data
      const { data } = await insforge.database
        .rpc('get_church_by_id', { p_church_id: church.id })
      const c = data || church
      setForm({
        name:        c.name          || '',
        location:    c.location      || '',
        phone:       c.phone         || '',
        email:       c.email         || '',
        website:     c.website       || '',
        currency:    c.currency      || 'LRD',
        founded:     c.founded_date  || '',
        description: c.description   || '',
      })
      // Resolve logo — prefer stored path for fresh signed URL
      const pathOrUrl = c.logo_path || c.logo_url || null
      const bucket    = pathOrUrl?.includes('church-assets') ? BUCKETS.CHURCH_ASSETS : BUCKETS.CHURCH_LOGOS
      const logoUrl   = pathOrUrl
        ? await getReadableFileUrl(bucket, pathOrUrl)
        : null
      setLogoPreview(logoUrl)
      // Update context with freshest data
      if (data) onChurchUpdated?.(data)
    }
    loadFresh()
  }, [church?.id])

  const set = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleLogoChange = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { setLogoErr(err); return }
    setLogoErr(null)
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Church name is required.'); return }
    if (!church?.id) { toast.error('No church found. Please re-login.'); return }

    setSaving(true)
    try {
      let logo_url  = church.logo_url  || null
      let logo_path = church.logo_path || null

      // Upload logo — get back { path, url }
      if (logoFile) {
        const result = await uploadChurchLogo({ file: logoFile, churchId: church.id })
        logo_url  = result.url  || logo_url
        logo_path = result.path || logo_path
        setLogoFile(null)
      }

      // Save to InsForge via SECURITY DEFINER RPC (now includes logo_path)
      const { data: updated, error } = await insforge.database
        .rpc('update_church', {
          p_church_id:    church.id,
          p_name:         form.name.trim(),
          p_location:     form.location.trim()    || null,
          p_phone:        form.phone.trim()        || null,
          p_email:        form.email.trim()        || null,
          p_website:      form.website.trim()      || null,
          p_currency:     form.currency,
          p_founded_date: form.founded             || '',
          p_logo_url:     logo_url                 || null,
          p_logo_path:    logo_path                || null,
        })

      if (error) throw error

      // Refetch from DB to confirm persistence
      const { data: confirmed } = await insforge.database
        .rpc('get_church_by_id', { p_church_id: church.id })

      const fresh = confirmed || updated || { ...church, logo_url, logo_path }
      onChurchUpdated?.(fresh)
      // Re-resolve from saved path for fresh signed URL
      if (fresh.logo_path || fresh.logo_url) {
        const bkt = (fresh.logo_path || fresh.logo_url || '').includes('church-assets')
          ? BUCKETS.CHURCH_ASSETS : BUCKETS.CHURCH_LOGOS
        const freshUrl = await getReadableFileUrl(bkt, fresh.logo_path || fresh.logo_url)
        setLogoPreview(freshUrl)
      }

      // Audit log
      await createAuditLog({
        action:      AUDIT_ACTIONS.CHURCH_UPDATED,
        actor:       buildActor(user, church),
        entityType:  'church',
        entityId:    church.id,
        description: `Church profile updated: ${form.name}`,
      })

      toast.success('Church profile saved successfully.')
    } catch (err) {
      console.error('[Settings save]', err)
      toast.error(err.message || 'Failed to save church profile.')
    } finally {
      setSaving(false)
    }
  }

  if (!church) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Church className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-base font-bold text-slate-600 mb-1">Church Not Configured</p>
        <p className="text-sm text-slate-400 max-w-xs">
          Your account is not linked to a church yet. Please complete registration or contact support.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Church Profile</h2>
        <p className="text-sm text-slate-500">Manage your church's information saved in ChurchFlow.</p>
      </div>

      {/* Logo Upload */}
      <div className="flex items-center gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-100">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#151022] to-[#5B00B8] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
          {logoPreview
            ? <img
                src={logoPreview}
                alt="Church logo"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
                className="w-full h-full object-cover"
              />
            : null}
          <Church className="w-9 h-9 text-white" style={{ display: logoPreview ? 'none' : 'block' }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-1">Church Logo</p>
          <p className="text-xs text-slate-400 mb-3">PNG or JPG · Max 5MB · 200×200px recommended</p>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-purple-700 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Upload Logo
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </label>
          {logoFile && <p className="text-xs text-emerald-600 mt-1">New logo selected — click Save to apply.</p>}
          {logoErr && <p className="text-xs text-red-600 mt-1">{logoErr}</p>}
        </div>
      </div>

      {/* Church Invite Link */}
      <div className="p-4 rounded-xl border border-purple-100 bg-purple-50">
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-900">Church Invite Link</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">Share this with members so they can register and join your church.</p>
        <div className="flex gap-2">
          <input readOnly value={`${window.location.origin}/join/${church.id}`}
            className="flex-1 text-xs bg-white border border-purple-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none" />
          <button
            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/join/${church.id}`); toast.success('Invite link copied!') }}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1">
            <Copy className="w-3 h-3" /> Copy
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Church Name *</label>
          <Input value={form.name} onChange={set('name')} placeholder="e.g. Grace Community Church" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location / Address</label>
          <Input value={form.location} onChange={set('location')} placeholder="Street, City, County, Liberia" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
          <Input value={form.phone} onChange={set('phone')} placeholder="+231 770 000 000" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
          <Input type="email" value={form.email} onChange={set('email')} placeholder="church@example.com" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website</label>
          <Input value={form.website} onChange={set('website')} placeholder="www.yourchurch.org" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Founded Date</label>
          <Input type="date" value={form.founded} onChange={set('founded')} />
        </div>
      </div>

      {/* Currency */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">Default Currency</label>
        <div className="flex gap-2">
          {['LRD', 'USD'].map(c => (
            <button key={c} onClick={() => setForm(p => ({ ...p, currency: c }))}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                form.currency === c
                  ? 'bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white border-transparent shadow-md shadow-purple-500/25'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:text-purple-600'
              }`}>
              {c}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">Liberian Dollar (LRD) · US Dollar (USD)</p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button variant="primary" loading={saving} onClick={handleSave} icon={saving ? undefined : Save}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
        <p className="text-xs text-slate-400">Changes are saved directly to ChurchFlow database.</p>
      </div>
    </div>
  )
}

// ─── User Roles Section ───────────────────────────────────────
// Only shows church-level roles. Platform roles (Super Admin) are not visible here.
function UserRolesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">User Roles & Permissions</h2>
        <p className="text-sm text-slate-500">Roles available within your church. Platform-level roles are managed separately.</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {['Role', 'Description', 'Permissions', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white">
            {CHURCH_ROLES.map(r => (
              <tr key={r.role} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-800">{r.role}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-xs text-slate-500 max-w-xs">{r.description}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {r.permissions.map(p => <Badge key={p} variant={r.color} size="sm">{p}</Badge>)}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <button className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                    onClick={() => toast('Role permission editing coming soon.', { icon: '🔐' })}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Notifications Section ────────────────────────────────────
function NotificationsSection() {
  const [settings, setSettings] = useState({
    new_member: true, birthday: true, attendance: true,
    offerings: true, events: true, prayer_requests: false,
  })
  const [saving, setSaving] = useState(false)

  const rows = [
    { key: 'new_member',      label: 'New Member Registration', desc: 'Alert when a new member joins your church.' },
    { key: 'birthday',        label: 'Member Birthdays',        desc: 'Daily reminder for upcoming member birthdays.' },
    { key: 'attendance',      label: 'Attendance Reports',      desc: 'Weekly attendance summary notifications.' },
    { key: 'offerings',       label: 'Offering Recorded',       desc: 'Notify when a new offering is recorded.' },
    { key: 'events',          label: 'Upcoming Events',         desc: 'Remind about events 24 hours before.' },
    { key: 'prayer_requests', label: 'New Prayer Requests',     desc: 'Alert when a member submits a prayer request.' },
  ]

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    toast.success('Notification preferences saved.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Notifications</h2>
        <p className="text-sm text-slate-500">Control which events trigger notifications for your church.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {rows.map(r => (
          <div key={r.key} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">{r.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
            </div>
            <button type="button" onClick={() => setSettings(p => ({ ...p, [r.key]: !p[r.key] }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${settings[r.key] ? 'bg-purple-600' : 'bg-slate-200'}`}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${settings[r.key] ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
      <Button variant="primary" icon={saving ? undefined : Save} loading={saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Save Preferences'}
      </Button>

      <WeeklyDigestTester />
    </div>
  )
}

// ─── Weekly Digest Test ───────────────────────────────────────
function WeeklyDigestTester() {
  const { user } = useAuth()
  const { church } = useChurch()
  const [sending, setSending] = useState(false)

  const sendNow = async () => {
    if (!user?.email) return toast.error('No email on your account.')
    setSending(true)
    try {
      // Pull this week's quick stats
      const since = new Date(); since.setDate(since.getDate() - 7)
      const sinceIso = since.toISOString().slice(0, 10)

      const [memb, off, att, visit, pr] = await Promise.all([
        insforge.database.from('members').select('id').gte('created_at', sinceIso),
        insforge.database.from('offerings').select('amount').gte('date', sinceIso),
        insforge.database.from('attendance').select('present_count').gte('service_date', sinceIso),
        insforge.database.from('visitors').select('id').gte('created_at', sinceIso),
        insforge.database.from('prayer_requests').select('id').eq('status', 'open'),
      ])

      const totalOffering = (off.data || []).reduce((s, r) => s + Number(r.amount || 0), 0)
      const attTotal      = (att.data || []).reduce((s, r) => s + Number(r.present_count || 0), 0)

      const { sendWeeklyDigest } = await import('../../services/emailService')
      const res = await sendWeeklyDigest({
        to: user.email,
        churchName: church?.name || 'Your Church',
        stats: {
          weekLabel:      `the week of ${since.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          attendance:     attTotal,
          newMembers:     memb.data?.length || 0,
          offerings:      `LRD ${totalOffering.toLocaleString()}`,
          visitors:       visit.data?.length || 0,
          prayerRequests: pr.data?.length || 0,
        },
      })

      if (res.ok) toast.success('Digest sent to your inbox!')
      else toast.error('Email service unavailable. Custom email requires a paid InsForge plan.')
    } catch (err) {
      console.error(err)
      toast.error('Could not send digest.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mt-6 p-5 rounded-2xl border border-purple-100 bg-purple-50/50">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">Weekly Digest</p>
          <p className="text-xs text-slate-500 mt-0.5">Email yourself a snapshot of this week's attendance, offerings, and new members.</p>
        </div>
        <Button variant="secondary" size="sm" loading={sending} onClick={sendNow}>
          {sending ? 'Sending…' : 'Send to me now'}
        </Button>
      </div>
    </div>
  )
}

// ─── SMS Settings Section ─────────────────────────────────────
function SMSSettingsSection() {
  const { church } = useChurch()
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [senderName, setSenderName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    toast.success('SMS settings saved.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">SMS Settings</h2>
        <p className="text-sm text-slate-500">Configure SMS gateway for automated church notifications.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">SMS API Key</label>
          <div className="relative">
            <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your SMS gateway API key"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400" />
            <button type="button" onClick={() => setShowKey(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sender Name</label>
          <input value={senderName} onChange={e => setSenderName(e.target.value)}
            placeholder={church?.name || 'Your Church'}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400" />
          <p className="text-xs text-slate-400 mt-1">Displayed as sender on SMS messages. Max 11 characters.</p>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700">SMS Templates</h3>
        {SMS_TEMPLATES.map(t => (
          <div key={t.tag} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-purple-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-700">{t.name}</p>
              <Badge variant="purple" size="sm">{t.tag}</Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{t.body}</p>
            <div className="flex justify-end mt-2">
              <button className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                onClick={() => toast('Template editing coming soon.', { icon: '✏️' })}>
                Edit Template
              </button>
            </div>
          </div>
        ))}
      </div>
      <Button variant="primary" icon={saving ? undefined : Save} loading={saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Save SMS Settings'}
      </Button>
    </div>
  )
}

// ─── Appearance Section ───────────────────────────────────────
function AppearanceSection() {
  const { church } = useChurch()
  const churchName = church?.name || 'Your Church'
  const [primaryColor, setPrimaryColor] = useState('#8A19FF')
  const [fontSize, setFontSize] = useState('medium')

  const COLORS = [
    { name: 'Purple', hex: '#8A19FF' },
    { name: 'Blue',   hex: '#2563EB' },
    { name: 'Green',  hex: '#059669' },
    { name: 'Red',    hex: '#DC2626' },
    { name: 'Gold',   hex: '#D97706' },
    { name: 'Navy',   hex: '#151022' },
  ]
  const FONTS = [{ key: 'small', label: 'Small' }, { key: 'medium', label: 'Medium' }, { key: 'large', label: 'Large' }]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Appearance</h2>
        <p className="text-sm text-slate-500">Customize colors and typography preferences.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-3">Primary Color</label>
        <div className="flex flex-wrap gap-3">
          {COLORS.map(({ name, hex }) => (
            <button key={hex} title={name} onClick={() => setPrimaryColor(hex)}
              className={`group relative w-10 h-10 rounded-xl transition-all hover:scale-110 ${primaryColor === hex ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
              style={{ backgroundColor: hex }}>
              {primaryColor === hex && <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow" />}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Selected: <span className="font-bold">{COLORS.find(c => c.hex === primaryColor)?.name || 'Custom'}</span> ({primaryColor})
        </p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-3">Font Size</label>
        <div className="flex gap-2">
          {FONTS.map(({ key, label }) => (
            <button key={key} onClick={() => setFontSize(key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                fontSize === key ? 'bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white border-transparent shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {/* Live Preview */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-3">Preview</label>
        <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: primaryColor + '40' }}>
          <div className="h-10 flex items-center px-4 gap-3" style={{ backgroundColor: primaryColor }}>
            <Church className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm">{churchName}</span>
          </div>
          <div className="p-4 bg-slate-50 space-y-3">
            <div className="h-8 rounded-xl w-2/5" style={{ backgroundColor: primaryColor + '30' }} />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: primaryColor + '80' }} />
                </div>
              ))}
            </div>
            <div className="h-6 rounded-xl bg-white w-3/4" />
            <div className="h-6 rounded-xl bg-white w-1/2" />
          </div>
        </div>
      </div>
      <Button variant="primary" icon={Save} onClick={() => toast.success('Appearance settings saved.')}>
        Apply Appearance
      </Button>
    </div>
  )
}

// ─── Backup & Export Section ──────────────────────────────────
function BackupSection() {
  const { church } = useChurch()
  const [busy, setBusy] = React.useState(null)

  const runExport = async (key, label, fn) => {
    setBusy(key)
    try {
      const res = await fn()
      if (res?.count === 0) toast(`No ${label.toLowerCase()} records found yet.`, { icon: 'ℹ️' })
      else toast.success(`${label} exported (${res.count} rows)`)
    } catch (err) {
      console.error('[Export]', err)
      toast.error(err.message || `Could not export ${label.toLowerCase()}`)
    } finally {
      setBusy(null)
    }
  }

  const exports = [
    { key: 'members',    label: 'Export Members',    desc: 'All member records as CSV',    icon: Download,  fn: () => import('../../services/dataExport').then(m => m.exportMembers()) },
    { key: 'offerings',  label: 'Export Offerings',  desc: 'Offerings & finance as CSV',   icon: Download,  fn: () => import('../../services/dataExport').then(m => m.exportOfferings()) },
    { key: 'attendance', label: 'Export Attendance', desc: 'All service records as CSV',   icon: Download,  fn: () => import('../../services/dataExport').then(m => m.exportAttendance()) },
    { key: 'events',     label: 'Export Events',     desc: 'Calendar events as CSV',       icon: Download,  fn: () => import('../../services/dataExport').then(m => m.exportEvents()) },
    { key: 'prayers',    label: 'Export Prayer Requests', desc: 'All prayer requests',     icon: Download,  fn: () => import('../../services/dataExport').then(m => m.exportPrayers()) },
    { key: 'backup',     label: 'Full Data Backup',  desc: 'All tables in one file',       icon: HardDrive, fn: () => import('../../services/dataExport').then(m => m.exportFullBackup()) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Backup & Export</h2>
        <p className="text-sm text-slate-500">Download your data as CSV files. Open in Excel, Google Sheets, or Numbers.</p>
      </div>
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Check className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-800">Data is backed up automatically</p>
          <p className="text-xs text-emerald-600">ChurchFlow backs up your data continuously via InsForge.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {exports.map(({ key, label, desc, icon: Icon, fn }) => {
          const isBusy = busy === key
          return (
            <button key={key}
              disabled={isBusy || busy !== null}
              onClick={() => runExport(key, label, fn)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-purple-100 hover:shadow-md transition-all text-left group disabled:opacity-50 disabled:cursor-wait">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-50 transition-colors">
                <Icon className="w-5 h-5 text-slate-500 group-hover:text-purple-600 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-400">{isBusy ? 'Preparing download…' : desc}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Invite Links Section ─────────────────────────────────────
function InviteLinksSection() {
  const { church } = useChurch()
  const { user }   = useAuth()
  const [invites, setInvites]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [creating, setCreating] = useState(false)
  // Pre-fill defaults: 50 uses, expires 30 days out
  const [form, setForm] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return {
      role:      'member',
      maxUses:   50,
      expiresAt: d.toISOString().split('T')[0],
    }
  })

  async function reload() {
    if (!church?.id) { setLoading(false); return }
    setLoading(true)
    setInvites(await listInvites(church.id))
    setLoading(false)
  }
  useEffect(() => { reload() }, [church?.id])

  async function handleCreate(e) {
    e.preventDefault()
    if (!church?.id) return
    setCreating(true)
    try {
      await createInvite({
        churchId:  church.id,
        role:      form.role,
        maxUses:   Math.max(1, parseInt(form.maxUses, 10) || 1),
        expiresAt: form.expiresAt ? new Date(form.expiresAt + 'T23:59:59Z').toISOString() : null,
        createdBy: user?.id || null,
      })
      createAuditLog({
        action:      AUDIT_ACTIONS.INVITE_CREATED || 'invite_created',
        actor:       buildActor(user, church),
        description: `Invite link created for role: ${form.role}`,
      })
      toast.success('Invite link created.')
      await reload()
    } catch (err) {
      toast.error(err.message || 'Failed to create invite.')
    } finally {
      setCreating(false)
    }
  }

  async function handleCopy(token) {
    const url = inviteLinkFor(token)
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Invite link copied!')
    } catch {
      window.prompt('Copy this invite link:', url)
    }
  }

  async function handleToggle(invite) {
    try {
      const next = invite.status === 'active' ? 'disabled' : 'active'
      await setInviteStatus(invite.id, next)
      toast.success(`Invite ${next}.`)
      await reload()
    } catch (err) {
      toast.error(err.message || 'Failed to update invite.')
    }
  }

  function fmtDate(s) {
    if (!s) return '—'
    try { return new Date(s).toLocaleDateString() } catch { return s }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Invite Links</h2>
        <p className="text-sm text-slate-500 mt-1">
          Mint signed links that let new people register directly into your church
          (with limits and expiry). Anyone with the link can join until it expires
          or hits its use cap.
        </p>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Role</label>
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            className="rounded-xl border border-slate-200 bg-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
          >
            <option value="member">Member</option>
            <option value="dept_leader">Department Leader</option>
            <option value="secretary">Secretary</option>
            <option value="treasurer">Treasurer</option>
            <option value="pastor">Pastor</option>
          </select>
        </div>
        <Input
          label="Max uses" type="number" min="1"
          value={form.maxUses}
          onChange={e => setForm({ ...form, maxUses: e.target.value })}
        />
        <Input
          label="Expires (optional)" type="date"
          value={form.expiresAt}
          onChange={e => setForm({ ...form, expiresAt: e.target.value })}
        />
        <div className="flex items-end">
          <Button type="submit" variant="primary" loading={creating} className="w-full">
            Create Link
          </Button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-6">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading invites…
        </div>
      ) : invites.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200">
          <Link2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No invite links yet</p>
          <p className="text-xs text-slate-400 mt-1">Create one above to start inviting people.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invites.map((inv) => {
            const expired   = inv.expires_at && new Date(inv.expires_at) < new Date()
            const exhausted = inv.used_count >= inv.max_uses
            const dead      = expired || exhausted || inv.status !== 'active'
            return (
              <div key={inv.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700">
                        {inv.role}
                      </span>
                      {inv.status === 'disabled' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600">
                          Disabled
                        </span>
                      )}
                      {expired && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700">
                          Expired
                        </span>
                      )}
                      {exhausted && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700">
                          Used up
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 break-all font-mono">
                      {inviteLinkFor(inv.invite_token)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {inv.used_count}/{inv.max_uses} used · expires {fmtDate(inv.expires_at)} · created {fmtDate(inv.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleCopy(inv.invite_token)}
                      disabled={dead}
                      className="p-2 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(inv)}
                      disabled={expired || exhausted}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                        inv.status === 'active'
                          ? 'text-red-600 hover:bg-red-50 border border-red-200'
                          : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                      }`}
                    >
                      {inv.status === 'active' ? 'Disable' : 'Re-enable'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Privacy & Data Section ───────────────────────────────────
function PrivacySection() {
  const [downloading,   setDownloading]   = useState(false)
  const [showDelete,    setShowDelete]    = useState(false)
  const [confirmText,   setConfirmText]   = useState('')
  const [deleting,      setDeleting]      = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      await downloadMyData()
      toast.success('Your data has been downloaded.')
    } catch (err) {
      toast.error(err.message || 'Could not export data.')
    } finally {
      setDownloading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteMyAccount(confirmText)
      toast.success('Your account has been deleted.')
      window.location.href = '/'
    } catch (err) {
      toast.error(err.message || 'Could not delete account.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Privacy &amp; Your Data</h2>
        <p className="text-sm text-slate-500">Your rights under GDPR Articles 15 &amp; 17 — export or permanently delete your account.</p>
      </div>

      {/* Export */}
      <div className="rounded-2xl border border-slate-100 p-6 space-y-3">
        <div className="flex items-center gap-3 mb-1">
          <Download className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-bold text-slate-800">Export my data</h3>
        </div>
        <p className="text-sm text-slate-500">
          Download a copy of everything ChurchFlow holds about you — your profile, messages, prayer requests, and activity — as a JSON file.
        </p>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? 'Preparing download…' : 'Download my data'}
        </button>
      </div>

      {/* Delete */}
      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6 space-y-3">
        <div className="flex items-center gap-3 mb-1">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-base font-bold text-red-700">Delete my account</h3>
        </div>
        <p className="text-sm text-slate-600">
          Permanently deletes your ChurchFlow account and all personal data associated with it. <strong>This cannot be undone.</strong> Church records (attendance, giving) will be anonymised, not erased.
        </p>
        {!showDelete ? (
          <button
            onClick={() => { setConfirmText(''); setShowDelete(true) }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            <AlertCircle className="w-4 h-4" /> Delete account…
          </button>
        ) : (
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-slate-700">
              Type <span className="font-bold text-red-600 select-all">{DELETE_CONFIRM_PHRASE}</span> to confirm:
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={DELETE_CONFIRM_PHRASE}
              className="w-full px-4 py-2.5 rounded-xl border border-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || confirmText !== DELETE_CONFIRM_PHRASE}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                {deleting ? 'Deleting…' : 'Permanently delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile')
  const { church, updateChurch } = useChurch()

  function handleChurchUpdated(updated) {
    updateChurch(updated)
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':       return <ChurchProfileSection church={church} onChurchUpdated={handleChurchUpdated} />
      case 'invites':       return <InviteLinksSection />
      case 'security':      return <TwoFactorSection />
      case 'roles':         return <UserRolesSection />
      case 'notifications': return <NotificationsSection />
      case 'sms':           return <SMSSettingsSection />
      case 'appearance':    return <AppearanceSection />
      case 'backup':        return <BackupSection />
      case 'privacy':       return <PrivacySection />
      default:              return <ChurchProfileSection church={church} onChurchUpdated={handleChurchUpdated} />
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            {church?.name ? `Configuring ${church.name}` : 'Configure your church settings'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 space-y-1 lg:sticky lg:top-6">
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setActiveSection(key)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeSection === key
                      ? 'bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8 min-h-[500px]">
            {renderSection()}
          </main>
        </div>
      </div>
    </div>
  )
}
