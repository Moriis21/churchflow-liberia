// ============================================================
// ChurchFlow Liberia — My Profile Page
// Works for all user roles (super admin, church admin, member)
// ============================================================
import { useState, useEffect } from 'react'
import { User, Mail, Phone, Calendar, Shield, Edit2, Save, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import { insforge } from '../../lib/insforge'
import { Input, Button, Badge } from '../../components/ui'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ROLE_LABELS = {
  super_admin:  'Super Admin',
  church_admin: 'Church Admin',
  pastor:       'Pastor',
  treasurer:    'Treasurer',
  secretary:    'Secretary',
  dept_leader:  'Department Leader',
  member:       'Member',
}

const ROLE_COLORS = {
  super_admin:  'bg-amber-100 text-amber-800 border-amber-200',
  church_admin: 'bg-purple-100 text-purple-800 border-purple-200',
  pastor:       'bg-indigo-100 text-indigo-800 border-indigo-200',
  treasurer:    'bg-green-100 text-green-800 border-green-200',
  secretary:    'bg-blue-100 text-blue-800 border-blue-200',
  dept_leader:  'bg-orange-100 text-orange-800 border-orange-200',
  member:       'bg-slate-100 text-slate-700 border-slate-200',
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { church } = useChurch()

  const [editMode, setEditMode]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [profile, setProfile]     = useState(null)
  const [form, setForm]           = useState({ full_name: '', phone: '' })

  const role = user?.role || user?.profile?.role || 'member'
  const userName = profile?.full_name || user?.profile?.full_name || user?.email || 'User'
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  // Fetch fresh profile from DB
  useEffect(() => {
    async function load() {
      if (!user?.id) return
      const { data } = await insforge.database
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      if (data) {
        setProfile(data)
        setForm({ full_name: data.full_name || '', phone: data.phone || '' })
      }
    }
    load()
  }, [user?.id])

  async function handleSave() {
    if (!form.full_name.trim()) { toast.error('Full name is required.'); return }
    setSaving(true)
    const { data, error } = await insforge.database
      .from('user_profiles')
      .update({ full_name: form.full_name.trim(), phone: form.phone })
      .eq('id', user.id)
      .select()
      .single()
    if (error) {
      toast.error('Failed to update profile: ' + error.message)
    } else {
      setProfile(data)
      setForm({ full_name: data.full_name || '', phone: data.phone || '' })
      toast.success('Profile updated successfully.')
      setEditMode(false)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#1E1B4B]">My Profile</h2>
        <p className="text-slate-500 text-sm mt-1">View and manage your account details.</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-[#1E1B4B] via-purple-700 to-violet-600" />

        {/* Avatar + name */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-[#1E1B4B] font-black text-2xl shadow-lg ring-4 ring-white flex-shrink-0">
              {initials}
            </div>
            {!editMode ? (
              <Button variant="secondary" onClick={() => setEditMode(true)}
                className="flex items-center gap-2 text-sm h-9 px-4">
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </Button>
            ) : (
              <button onClick={() => { setEditMode(false); setForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' }) }}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>

          {!editMode ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#1E1B4B]">{userName}</h3>
                <span className={`inline-flex items-center mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_COLORS[role]}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {ROLE_LABELS[role] || role}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Email</p>
                    <p className="text-sm text-slate-800 font-medium break-all">{user?.email || '—'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Phone</p>
                    <p className="text-sm text-slate-800 font-medium">{profile?.phone || '—'}</p>
                  </div>
                </div>

                {church && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Church</p>
                      <p className="text-sm text-slate-800 font-medium">{church.name}</p>
                    </div>
                  </div>
                )}

                {role === 'super_admin' && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Platform</p>
                      <p className="text-sm text-slate-800 font-medium">ChurchFlow Liberia</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Member Since</p>
                    <p className="text-sm text-slate-800 font-medium">
                      {profile?.created_at ? formatDate(profile.created_at) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit form */
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#1E1B4B]">Edit Profile</h3>
              <Input label="Full Name" value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                required icon={User} />
              <Input label="Phone Number" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+231 770 000 000" icon={Phone} />
              <Input label="Email Address" value={user?.email || ''} disabled
                icon={Mail} className="opacity-60" />
              <p className="text-xs text-slate-400">Email cannot be changed here. Contact platform support to update your email.</p>
              <div className="flex gap-3 pt-2">
                <Button variant="primary" loading={saving} onClick={handleSave}
                  className="flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
