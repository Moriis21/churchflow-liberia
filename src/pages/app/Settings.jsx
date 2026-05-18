// ============================================================
// ChurchFlow Liberia — Settings Page
// ============================================================
import { useState } from 'react'
import {
  Church,
  Users,
  Bell,
  MessageSquare,
  Palette,
  HardDrive,
  Save,
  Upload,
  Eye,
  EyeOff,
  Send,
  Download,
  Shield,
  ChevronRight,
  Check,
} from 'lucide-react'
import { Button, Input, Badge } from '../../components/ui'

// ─── Sidebar nav items ────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'profile', label: 'Church Profile', icon: Church },
  { key: 'roles', label: 'User Roles', icon: Users },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'sms', label: 'SMS Settings', icon: MessageSquare },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'backup', label: 'Backup & Export', icon: HardDrive },
]

// ─── Roles data ───────────────────────────────────────────────
const ROLES = [
  {
    role: 'Super Admin',
    description: 'Full access to all modules, settings, and user management.',
    permissions: ['All Members', 'Finance', 'Reports', 'Settings', 'Users', 'Branches'],
    color: 'danger',
  },
  {
    role: 'Church Admin',
    description: 'Manages church operations including members, attendance, and events.',
    permissions: ['Members', 'Attendance', 'Events', 'Reports'],
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

// ─── SMS Templates ────────────────────────────────────────────
const SMS_TEMPLATES = [
  {
    name: 'Birthday Wishes',
    body: 'Happy Birthday, {name}! 🎂 May God bless you abundantly. – Grace Community Church',
    tag: 'birthday',
  },
  {
    name: 'Event Reminder',
    body: 'Reminder: {event_title} is happening on {date} at {time}. We look forward to seeing you! – Grace Church',
    tag: 'event',
  },
  {
    name: 'Follow-Up Message',
    body: 'Dear {name}, it was great having you at Grace Community Church! We would love to connect. Call us: +231 770 000 000',
    tag: 'followup',
  },
]

// ─── Church Profile Section ───────────────────────────────────
function ChurchProfileSection() {
  const [form, setForm] = useState({
    name: 'Grace Community Church',
    location: 'Sinkor, Monrovia, Liberia',
    phone: '+231-770-000-001',
    email: 'info@gracechurchliberia.org',
    website: 'www.gracechurchliberia.org',
    currency: 'LRD',
    founded: '2005-01-15',
  })
  const [logoPreview, setLogoPreview] = useState(null)
  const [saved, setSaved] = useState(false)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
    }
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Church Profile</h2>
        <p className="text-sm text-slate-500">Manage your church's basic information and branding.</p>
      </div>

      {/* Logo Upload */}
      <div className="flex items-center gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-100">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
          {logoPreview ? (
            <img src={logoPreview} alt="Church logo" className="w-full h-full object-cover" />
          ) : (
            <Church className="w-9 h-9 text-white" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-1">Church Logo</p>
          <p className="text-xs text-slate-400 mb-3">PNG or JPG. Recommended 200×200 px.</p>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-purple-700 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Upload Logo
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </label>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Church Name</label>
          <Input value={form.name} onChange={set('name')} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location / Address</label>
          <Input placeholder="Street, City, County, Liberia" value={form.location} onChange={set('location')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
          <Input placeholder="+231 770 000 000" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
          <Input type="email" placeholder="church@example.com" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website</label>
          <Input placeholder="www.example.com" value={form.website} onChange={set('website')} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Founded Date</label>
          <Input type="date" value={form.founded} onChange={set('founded')} />
        </div>
      </div>

      {/* Currency Toggle */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">Default Currency</label>
        <div className="flex gap-2">
          {['LRD', 'USD'].map((c) => (
            <button
              key={c}
              onClick={() => setForm((prev) => ({ ...prev, currency: c }))}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                form.currency === c
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white border-transparent shadow-md shadow-purple-500/25'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:text-purple-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Liberian Dollar (LRD) · US Dollar (USD)
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" icon={saved ? Check : Save} onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
        {saved && (
          <span className="text-xs text-emerald-600 font-semibold">Changes saved successfully.</span>
        )}
      </div>
    </div>
  )
}

// ─── User Roles Section ───────────────────────────────────────
function UserRolesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">User Roles & Permissions</h2>
        <p className="text-sm text-slate-500">Define what each role can access within ChurchFlow.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Permissions</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white">
            {ROLES.map((r) => (
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
                    {r.permissions.map((p) => (
                      <Badge key={p} variant={r.color} size="sm">{p}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <button className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline transition-colors">
                    Edit Permissions
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
    newMember: true,
    attendance: true,
    offering: true,
    eventReminder: true,
    prayerRequest: false,
    birthday: true,
    smsBlast: false,
  })

  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }))

  const items = [
    { key: 'newMember', label: 'New Member Registration', desc: 'Notify when a new member joins' },
    { key: 'attendance', label: 'Attendance Submitted', desc: 'Alert when attendance is recorded' },
    { key: 'offering', label: 'Offering Recorded', desc: 'Notify on each new offering entry' },
    { key: 'eventReminder', label: 'Upcoming Event Reminders', desc: '24 hours before each event' },
    { key: 'prayerRequest', label: 'New Prayer Requests', desc: 'When members submit prayer requests' },
    { key: 'birthday', label: 'Birthday Reminders', desc: 'Daily notification for member birthdays' },
    { key: 'smsBlast', label: 'SMS Blast Sent', desc: 'Confirm after each bulk SMS dispatch' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Notifications</h2>
        <p className="text-sm text-slate-500">Control which events trigger app notifications.</p>
      </div>

      <div className="space-y-3">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
            <div>
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-1 ${
                settings[key] ? 'bg-gradient-to-r from-violet-600 to-purple-700' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings[key] ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SMS Settings Section ─────────────────────────────────────
function SMSSettingsSection() {
  const [apiKey, setApiKey] = useState('sk-sms-****-****-****-abcd1234')
  const [senderId, setSenderId] = useState('GRACECC')
  const [showKey, setShowKey] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testSent, setTestSent] = useState(false)

  const handleTest = () => {
    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">SMS Settings</h2>
        <p className="text-sm text-slate-500">Configure SMS gateway for bulk messaging.</p>
      </div>

      <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full pl-4 pr-11 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sender ID</label>
          <Input
            placeholder="e.g. GRACECC (max 11 chars)"
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            maxLength={11}
          />
          <p className="text-xs text-slate-400 mt-1">{senderId.length}/11 characters</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Test SMS</label>
          <div className="flex gap-2">
            <Input
              placeholder="+231 770 000 000"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
            />
            <Button variant="secondary" icon={Send} onClick={handleTest}>
              {testSent ? 'Sent!' : 'Send Test'}
            </Button>
          </div>
          {testSent && (
            <p className="text-xs text-emerald-600 font-semibold mt-1">Test SMS dispatched to {testPhone}.</p>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-50">
          <Button variant="primary" icon={Save} size="sm">Save SMS Settings</Button>
        </div>
      </div>

      {/* SMS Templates */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3">SMS Templates</h3>
        <div className="space-y-3">
          {SMS_TEMPLATES.map((tmpl) => (
            <div key={tmpl.tag} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-800">{tmpl.name}</span>
                <Badge variant="purple" size="sm">{tmpl.tag}</Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono bg-slate-50 rounded-xl p-3 leading-relaxed">
                {tmpl.body}
              </p>
              <div className="flex justify-end mt-2">
                <button className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                  Edit Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Appearance Section ───────────────────────────────────────
function AppearanceSection() {
  const [primaryColor, setPrimaryColor] = useState('#7C3AED')
  const [fontSize, setFontSize] = useState('medium')

  const COLORS = [
    { name: 'Purple', hex: '#7C3AED' },
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Green', hex: '#059669' },
    { name: 'Red', hex: '#DC2626' },
    { name: 'Gold', hex: '#D97706' },
    { name: 'Navy', hex: '#1E1B4B' },
  ]

  const FONTS = [
    { key: 'small', label: 'Small' },
    { key: 'medium', label: 'Medium' },
    { key: 'large', label: 'Large' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Appearance</h2>
        <p className="text-sm text-slate-500">Customize colors and typography preferences.</p>
      </div>

      {/* Color Swatches */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-3">Primary Color</label>
        <div className="flex flex-wrap gap-3">
          {COLORS.map(({ name, hex }) => (
            <button
              key={hex}
              title={name}
              onClick={() => setPrimaryColor(hex)}
              className={`group relative w-10 h-10 rounded-xl transition-all hover:scale-110 ${
                primaryColor === hex ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
              }`}
              style={{ backgroundColor: hex }}
            >
              {primaryColor === hex && (
                <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Selected: <span className="font-bold">{COLORS.find((c) => c.hex === primaryColor)?.name || 'Custom'}</span> ({primaryColor})
        </p>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-3">Font Size</label>
        <div className="flex gap-2">
          {FONTS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFontSize(key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                fontSize === key
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white border-transparent shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Thumbnail */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-3">Preview</label>
        <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: primaryColor + '40' }}>
          {/* Mock nav bar */}
          <div className="h-10 flex items-center px-4 gap-3" style={{ backgroundColor: primaryColor }}>
            <Church className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm">Grace Community Church</span>
          </div>
          {/* Mock content */}
          <div className="p-4 bg-slate-50 space-y-3">
            <div
              className="h-8 rounded-xl w-2/5"
              style={{ backgroundColor: primaryColor + '30' }}
            />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
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

      <Button variant="primary" icon={Save}>Apply Appearance</Button>
    </div>
  )
}

// ─── Backup & Export Section ──────────────────────────────────
function BackupSection() {
  const [lastBackup] = useState('May 17, 2026 – 11:45 PM')

  const exports = [
    { label: 'Export Members (CSV)', desc: 'All member records', icon: Download, color: 'purple' },
    { label: 'Export Finance (Excel)', desc: 'Offerings & expenses', icon: Download, color: 'green' },
    { label: 'Export Attendance (CSV)', desc: 'All service records', icon: Download, color: 'blue' },
    { label: 'Full Data Backup (ZIP)', desc: 'Complete church data export', icon: HardDrive, color: 'gold' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Backup & Export</h2>
        <p className="text-sm text-slate-500">Download your data or create a full backup.</p>
      </div>

      {/* Last backup */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Check className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-800">Backup up to date</p>
          <p className="text-xs text-emerald-600">Last backup: {lastBackup}</p>
        </div>
        <Button variant="primary" size="sm" className="ml-auto" icon={HardDrive}>
          Backup Now
        </Button>
      </div>

      {/* Export options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {exports.map(({ label, desc, icon: Icon, color }) => (
          <button
            key={label}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-purple-100 hover:shadow-md transition-all text-left group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              color === 'purple' ? 'bg-purple-50 text-purple-600' :
              color === 'green' ? 'bg-emerald-50 text-emerald-600' :
              color === 'blue' ? 'bg-blue-50 text-blue-600' :
              'bg-amber-50 text-amber-600'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile')

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return <ChurchProfileSection />
      case 'roles': return <UserRolesSection />
      case 'notifications': return <NotificationsSection />
      case 'sms': return <SMSSettingsSection />
      case 'appearance': return <AppearanceSection />
      case 'backup': return <BackupSection />
      default: return <ChurchProfileSection />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure ChurchFlow for Grace Community Church</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 space-y-1 lg:sticky lg:top-6">
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeSection === key
                      ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
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
