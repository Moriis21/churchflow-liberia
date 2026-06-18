// ============================================================
// ChurchFlow Liberia — Member Personal Settings
//
// Members get this stripped-down settings page.
// They can update personal info, change password, and set
// notification preferences.
//
// Members CANNOT edit:
//   church logo, church name, church address, user roles,
//   SMS settings, backup settings, or any church permissions.
// ============================================================
import { useState } from 'react'
import {
  User, Lock, Bell, Eye, EyeOff, Save, CheckCircle,
  Shield, Smartphone,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'
import { Input, Button } from '../../components/ui'

// ─── Sidebar nav for settings ────────────────────────────────
const SETTING_TABS = [
  { key: 'profile',       label: 'My Profile',        icon: User },
  { key: 'password',      label: 'Change Password',   icon: Lock },
  { key: 'notifications', label: 'Notifications',     icon: Bell },
  { key: 'privacy',       label: 'Privacy',           icon: Shield },
]

// ─── Profile section ──────────────────────────────────────────
function ProfileSection({ user }) {
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">My Profile</h3>
        <p className="text-sm text-slate-500">Update your name, phone number, and profile photo.</p>
      </div>
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <User className="w-4.5 h-4.5 text-purple-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-purple-800">Profile editing is on your Profile page</p>
          <p className="text-xs text-purple-600 mt-0.5">Name, phone, and profile photo can be updated there.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/app/profile')}
          className="text-xs"
        >
          Go to Profile
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email</p>
          <p className="text-sm font-medium text-slate-800">{user?.email || '—'}</p>
          <p className="text-xs text-slate-400 mt-1">Contact your administrator to change your email.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Role</p>
          <p className="text-sm font-medium text-slate-800 capitalize">
            {(user?.profile?.role || user?.role || 'member').replace('_', ' ')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Role is assigned by your church administrator.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Password section ─────────────────────────────────────────
function PasswordSection({ user }) {
  const [current,  setCurrent]  = useState('')
  const [newPwd,   setNewPwd]   = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showCurr, setShowCurr] = useState(false)
  const [showNew,  setShowNew]  = useState(false)
  const [saving,   setSaving]   = useState(false)

  async function handleChangePassword() {
    if (!newPwd.trim() || newPwd.length < 8) {
      toast.error('New password must be at least 8 characters.')
      return
    }
    if (newPwd !== confirm) {
      toast.error('New passwords do not match.')
      return
    }
    setSaving(true)
    try {
      const { error } = await insforge.auth.updatePassword({ password: newPwd })
      if (error) throw error
      setCurrent(''); setNewPwd(''); setConfirm('')
      toast.success('Password changed successfully.')
    } catch (err) {
      toast.error(err.message || 'Failed to change password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Change Password</h3>
        <p className="text-sm text-slate-500">Choose a strong password of at least 8 characters.</p>
      </div>
      <div className="space-y-4 max-w-md">
        {/* New password */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
            />
            <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat new password"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
          />
          {confirm && newPwd && confirm !== newPwd && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
          )}
        </div>

        <Button variant="primary" loading={saving} onClick={handleChangePassword} icon={Save} className="w-full sm:w-auto">
          Update Password
        </Button>
      </div>
    </div>
  )
}

// ─── Notifications section ────────────────────────────────────
function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    event_reminders:  true,
    prayer_updates:   true,
    sermon_uploads:   true,
    general_notices:  true,
    email_digest:     false,
  })

  function toggle(key) {
    setPrefs(p => ({ ...p, [key]: !p[key] }))
  }

  const items = [
    { key: 'event_reminders', label: 'Event Reminders',    desc: 'Get notified about upcoming church events' },
    { key: 'prayer_updates',  label: 'Prayer Updates',     desc: 'Receive updates on your prayer requests' },
    { key: 'sermon_uploads',  label: 'New Sermons',        desc: 'When a new sermon is uploaded' },
    { key: 'general_notices', label: 'Church Notices',     desc: 'General announcements from church leadership' },
    { key: 'email_digest',    label: 'Weekly Email Digest', desc: 'A weekly summary of church activity' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Notifications</h3>
        <p className="text-sm text-slate-500">Choose what you want to be notified about.</p>
      </div>
      <div className="space-y-3">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-700">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                prefs[key] ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${prefs[key] ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">* Notification delivery depends on your church's configuration.</p>
    </div>
  )
}

// ─── Privacy section ──────────────────────────────────────────
function PrivacySection() {
  const [prefs, setPrefs] = useState({
    show_phone:    true,
    show_email:    false,
    show_birthday: false,
  })

  function toggle(key) {
    setPrefs(p => ({ ...p, [key]: !p[key] }))
  }

  const items = [
    { key: 'show_phone',    label: 'Show Phone Number', desc: 'Visible to church staff only' },
    { key: 'show_email',    label: 'Show Email',         desc: 'Visible to church staff only' },
    { key: 'show_birthday', label: 'Show Birthday',      desc: 'Visible to other church members' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Privacy</h3>
        <p className="text-sm text-slate-500">Control what information is visible to others.</p>
      </div>
      <div className="space-y-3">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-700">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${prefs[key] ? 'bg-purple-600' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${prefs[key] ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────
export default function MemberSettings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  function renderContent() {
    switch (activeTab) {
      case 'profile':       return <ProfileSection user={user} />
      case 'password':      return <PasswordSection user={user} />
      case 'notifications': return <NotificationsSection />
      case 'privacy':       return <PrivacySection />
      default:              return <ProfileSection user={user} />
    }
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">My Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your personal account preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <nav className="md:w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 space-y-0.5">
              {SETTING_TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === key
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${activeTab === key ? 'text-purple-600' : 'text-slate-400'}`} />
                  {label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
