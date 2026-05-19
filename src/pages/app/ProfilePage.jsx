// ============================================================
// ChurchFlow Liberia — My Profile Page
// Full photo upload, real DB save, works for all roles
// ============================================================
import { useState, useEffect, useRef } from 'react'
import {
  User, Mail, Phone, Calendar, Shield, Edit2, Save, X,
  Camera, Upload, Trash2, CheckCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import { insforge } from '../../lib/insforge'
import { Input, Button } from '../../components/ui'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { uploadProfilePhoto, getReadableUrl, validatePhotoFile, validateImageFile, addApiKey } from '../../services/profilePhoto'
import { createAuditLog, buildActor, AUDIT_ACTIONS } from '../../services/auditLog'

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

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function ProfilePage() {
  const { user } = useAuth()
  const { church } = useChurch()

  const [editMode, setEditMode]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [profile, setProfile]           = useState(null)
  const [form, setForm]                 = useState({ full_name: '', phone: '' })
  const [photoPreview, setPhotoPreview] = useState(null)  // local blob URL for preview
  const fileInputRef                    = useRef(null)

  // Resolve role — prioritise live profile state, then auth context, then default
  const role      = profile?.role || user?.role || user?.profile?.role || 'member'
  const userName  = profile?.full_name || user?.profile?.full_name || user?.name || user?.email || 'User'
  const initials  = userName.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const avatarUrl = profile?.avatar_url || user?.profile?.avatar_url || null

  // ── Fetch fresh profile via SECURITY DEFINER RPC ─────────
  useEffect(() => {
    async function load() {
      if (!user?.id) return
      // Use get_my_profile RPC (bypasses RLS) for reliable read
      const { data: rpcResult } = await insforge.database
        .rpc('get_my_profile', { p_user_id: user.id })
      const data = rpcResult?.profile || null
      if (data) {
        // Resolve avatar URL — add apikey so <img> tag can load from InsForge storage
        let resolvedUrl = data.avatar_url || null
        if (resolvedUrl && !resolvedUrl.startsWith('http')) {
          // It's a path, not a full URL — resolve it
          resolvedUrl = await getReadableUrl('profile-photos', resolvedUrl) || resolvedUrl
        }
        setProfile({ ...data, avatar_url: addApiKey(resolvedUrl) })
        setForm({ full_name: data.full_name || '', phone: data.phone || '' })
      }
    }
    load()
  }, [user?.id])

  // ── Handle file selection ─────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)  // use robust validator
    if (err) { toast.error(err); return }
    setPhotoPreview({ url: URL.createObjectURL(file), file })
  }

  // ── Upload photo — public URL → signed URL → fallback ────
  async function handlePhotoUpload() {
    if (!photoPreview?.file || !user?.id) return
    setUploadingPhoto(true)
    try {
      const { url, path } = await uploadProfilePhoto({
        file:     photoPreview.file,
        userId:   user.id,
        churchId: profile?.church_id || church?.id,
      })

      // Save URL via SECURITY DEFINER RPC (bypasses RLS)
      await insforge.database.rpc('update_profile_avatar', {
        p_user_id:    user.id,
        p_avatar_url: url,
      })

      setProfile(prev => ({ ...prev, avatar_url: addApiKey(url) }))
      setPhotoPreview(null)

      // Audit log
      await createAuditLog({
        action:     AUDIT_ACTIONS.PROFILE_PHOTO_UPLOAD,
        actor:      buildActor(user, church),
        entityType: 'user_profile',
        entityId:   user.id,
        description: 'Profile photo updated',
      })

      toast.success('Profile photo updated successfully.')
    } catch (err) {
      console.error('[ProfilePhoto]', err)
      toast.error('Photo upload failed. Please check file type, size, or storage permissions.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  // ── Remove photo ──────────────────────────────────────────
  async function handleRemovePhoto() {
    if (!user?.id) return
    await insforge.database.rpc('update_profile_avatar', {
      p_user_id:    user.id,
      p_avatar_url: null,
    })
    setProfile(prev => ({ ...prev, avatar_url: null }))
    setPhotoPreview(null)
    toast.success('Profile photo removed.')
  }

  // ── Save profile fields ───────────────────────────────────
  async function handleSave() {
    if (!form.full_name.trim()) { toast.error('Full name is required.'); return }
    setSaving(true)
    // Use SECURITY DEFINER RPC — update_my_profile bypasses RLS
    const { data: finalData, error } = await insforge.database
      .rpc('update_my_profile', {
        p_user_id:  user.id,
        p_full_name: form.full_name.trim(),
        p_phone:    form.phone || null,
      })
    if (error) {
      toast.error('Failed to update profile: ' + error.message)
    } else {
      const updated = finalData || profile
      setProfile(prev => ({ ...prev, ...updated }))
      setForm({ full_name: updated?.full_name || '', phone: updated?.phone || '' })
      await createAuditLog({
        action:     AUDIT_ACTIONS.PROFILE_UPDATE,
        actor:      buildActor(user, church),
        entityType: 'user_profile',
        entityId:   user.id,
        description: 'Profile name/phone updated',
      })
      toast.success('Profile updated successfully.')
      setEditMode(false)
    }
    setSaving(false)
  }

  function cancelEdit() {
    setEditMode(false)
    setPhotoPreview(null)
    setForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' })
  }

  // ── Avatar display ────────────────────────────────────────
  const displaySrc = photoPreview?.url || avatarUrl || null

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
          <div className="flex items-end justify-between -mt-12 mb-4">

            {/* ── Avatar with upload overlay ── */}
            <div className="relative group">
              {displaySrc ? (
                <img
                  src={displaySrc}
                  alt={userName}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-4 ring-white flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500
                  flex items-center justify-center text-[#1E1B4B] font-black text-2xl
                  shadow-lg ring-4 ring-white flex-shrink-0">
                  {initials}
                </div>
              )}

              {/* Camera overlay (always shown on hover, or in edit mode) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`absolute inset-0 rounded-2xl flex items-center justify-center
                  bg-black/50 text-white transition-opacity duration-200
                  ${editMode ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
                title="Change profile photo"
              >
                <Camera className="w-6 h-6" />
              </button>

              {/* Small camera badge (edit mode) */}
              {editMode && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full
                    bg-[#7C3AED] hover:bg-purple-700 text-white shadow-md
                    flex items-center justify-center transition-colors"
                  title="Upload photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Edit / Cancel button */}
            {!editMode ? (
              <Button variant="secondary" onClick={() => setEditMode(true)}
                className="flex items-center gap-2 text-sm h-9 px-4">
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </Button>
            ) : (
              <button onClick={cancelEdit}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Photo action bar — shown when a new photo is staged */}
          {photoPreview && editMode && (
            <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl">
              <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <p className="text-sm text-purple-800 font-medium flex-1">
                New photo selected. Save to apply.
              </p>
              <Button
                variant="primary"
                loading={uploadingPhoto}
                onClick={handlePhotoUpload}
                className="text-xs h-8 px-3 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploadingPhoto ? 'Uploading…' : 'Upload Now'}
              </Button>
              <button
                onClick={() => setPhotoPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* View mode */}
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
            /* ── Edit form ── */
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#1E1B4B]">Edit Profile</h3>

              {/* Photo hint */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <Camera className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Profile Photo</p>
                    <p className="text-[11px] text-slate-400">JPG, PNG or WEBP · Max {MAX_SIZE_MB}MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors border border-purple-200"
                  >
                    {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

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

      {/* Security card */}
      <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" /> Account Security
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-700">Password</p>
              <p className="text-xs text-slate-400">Last changed: unknown</p>
            </div>
            <button
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors border border-purple-200"
              onClick={() => toast('To change your password, use the "Forgot Password" flow on the login page.', { icon: '🔒', duration: 5000 })}
            >
              Change Password
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Two-Factor Authentication</p>
              <p className="text-xs text-slate-400">Add an extra layer of security</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-semibold">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
