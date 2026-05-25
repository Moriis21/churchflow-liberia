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
import { uploadProfilePhoto, getReadableFileUrl, validateImageUpload as validateImageFile, BUCKETS } from '../../services/imageStorage'
import { createAuditLog, buildActor, AUDIT_ACTIONS } from '../../services/auditLog'
import { downloadMyData, deleteMyAccount, DELETE_CONFIRM_PHRASE } from '../../services/gdprService'
import { useNavigate } from 'react-router-dom'

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

// Profile avatar with onError → initials fallback (no broken image icon)
function ProfileAvatar({ src, initials }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500
        flex items-center justify-center text-[#151022] font-black text-2xl
        shadow-lg ring-4 ring-white flex-shrink-0">
        {initials}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt="Profile"
      onError={() => setErr(true)}
      className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-4 ring-white flex-shrink-0"
    />
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { church } = useChurch()
  const navigate = useNavigate()

  const [editMode, setEditMode]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [profile, setProfile]           = useState(null)
  const [form, setForm]                 = useState({ full_name: '', phone: '' })
  const [photoPreview, setPhotoPreview] = useState(null)  // local blob URL for preview
  const fileInputRef                    = useRef(null)

  // GDPR state
  const [exporting,   setExporting]   = useState(false)
  const [showDelete,  setShowDelete]  = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting,    setDeleting]    = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await downloadMyData()
      toast.success('Your data has been downloaded.')
    } catch (err) {
      toast.error(err.message || 'Could not export data.')
    } finally {
      setExporting(false)
    }
  }

  async function handleDelete() {
    if (confirmText !== DELETE_CONFIRM_PHRASE) return
    setDeleting(true)
    try {
      await deleteMyAccount(confirmText)
      toast.success('Your account has been deleted.')
      await logout()
      navigate('/landing', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Could not delete account.')
      setDeleting(false)
    }
  }

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
        // Resolve avatar — prefer stored path → generate fresh signed URL
        const pathOrUrl = data.avatar_path || data.avatar_url || null
        const resolvedUrl = pathOrUrl
          ? await getReadableFileUrl(BUCKETS.PROFILE_PHOTOS, pathOrUrl)
          : null
        setProfile({ ...data, avatar_url: resolvedUrl })
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

  // ── Upload photo ─────────────────────────────────────────
  async function handlePhotoUpload() {
    if (!photoPreview?.file || !user?.id) return
    setUploadingPhoto(true)
    try {
      // Upload → get back { path, url } — both stored in DB
      const { url, path } = await uploadProfilePhoto({
        file:     photoPreview.file,
        userId:   user.id,
        churchId: profile?.church_id || church?.id,
      })

      // Save BOTH path (permanent) and url (signed, 7-day) to DB
      await insforge.database.rpc('update_profile_avatar', {
        p_user_id:     user.id,
        p_avatar_url:  url,
        p_avatar_path: path,
      })

      setProfile(prev => ({ ...prev, avatar_url: url, avatar_path: path }))
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
        <h2 className="text-2xl font-extrabold text-[#151022]">My Profile</h2>
        <p className="text-slate-500 text-sm mt-1">View and manage your account details.</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-[#151022] via-purple-700 to-violet-600" />

        {/* Avatar + name */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">

            {/* ── Avatar with upload overlay ── */}
            <div className="relative group">
              <ProfileAvatar src={displaySrc} initials={initials} />

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
                    bg-[#8A19FF] hover:bg-purple-700 text-white shadow-md
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
                <h3 className="text-xl font-bold text-[#151022]">{userName}</h3>
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
              <h3 className="text-base font-bold text-[#151022]">Edit Profile</h3>

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
            <button
              onClick={() => navigate('/app/settings')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Manage in Settings →
            </button>
          </div>
        </div>
      </div>

      {/* ── Privacy & Data (GDPR) ────────────────────────────── */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Privacy &amp; Your Data</h2>
          <p className="text-xs text-slate-400 mt-0.5">Your data rights under privacy laws (GDPR Articles 15 &amp; 17).</p>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Export */}
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700">Download my data</p>
              <p className="text-xs text-slate-400">
                Export everything we store about you as a single JSON file.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 transition-colors"
            >
              {exporting ? 'Preparing…' : 'Download'}
            </button>
          </div>

          {/* Delete */}
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-red-700">Delete my account</p>
              <p className="text-xs text-slate-400">
                Permanently scrub your profile, member record, and personal info. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => { setConfirmText(''); setShowDelete(true) }}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete account…
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete confirmation modal ─────────────────────────── */}
      {showDelete && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
             onClick={() => !deleting && setShowDelete(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-[#151022] text-base mb-1">Delete your account?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              This will scrub your profile, member record, and personal information from
              ChurchFlow Liberia. Church attendance and offering totals will keep their
              aggregates but your personal details will be removed.
            </p>
            <p className="text-sm text-slate-600 mt-3">
              Type <code className="px-1 py-0.5 bg-slate-100 rounded text-xs font-mono">{DELETE_CONFIRM_PHRASE}</code> below to confirm.
            </p>
            <input
              type="text" value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={DELETE_CONFIRM_PHRASE}
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500"
              autoFocus
              disabled={deleting}
            />
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== DELETE_CONFIRM_PHRASE || deleting}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting…' : 'Yes, delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
