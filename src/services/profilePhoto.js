// ============================================================
// ChurchFlow Liberia — Profile Photo & Church Logo Service
// Handles upload → readable URL with full fallback chain.
// InsForge public buckets return URLs in the format:
//   https://{appkey}.us-east.insforge.app/storage/v1/object/public/{bucket}/{path}
// ============================================================
import { insforge } from '../lib/insforge'

// ─── Config ───────────────────────────────────────────────────
const PROFILE_BUCKET  = 'profile-photos'
const LOGO_BUCKET     = 'church-logos'
const MAX_SIZE_BYTES  = 5 * 1024 * 1024   // 5 MB
const ALLOWED_TYPES   = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const SIGNED_URL_TTL  = 3600              // 1 hour

// ─── Validation ───────────────────────────────────────────────
export function validateImageFile(file) {
  if (!file) return 'No file selected.'
  const type = file.type?.toLowerCase()
  if (!ALLOWED_TYPES.includes(type)) {
    return 'Only JPG, JPEG, PNG, or WEBP images are allowed.'
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `Image must be under 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`
  }
  return null
}

// ─── Build storage paths ──────────────────────────────────────
export function buildProfilePhotoPath(userId, churchId, file) {
  const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const ts   = Date.now()
  const cid  = churchId || 'platform'
  return `${cid}/${userId}/avatar-${ts}.${ext}`
}

export function buildChurchLogoPath(churchId, file) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const ts  = Date.now()
  return `${churchId}/logo-${ts}.${ext}`
}

// ─── Get readable URL — public first, signed fallback ─────────
export async function getReadableUrl(bucket, path) {
  if (!path) return null

  // If path is already a full URL (https://...), return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Try public URL first
  try {
    const { data } = insforge.storage.from(bucket).getPublicUrl(path)
    const url = data?.publicUrl || data?.url
    if (url && !url.includes('undefined') && !url.includes('null')) {
      return url
    }
  } catch { /* fall through */ }

  // Fallback: signed URL
  try {
    const { data, error } = await insforge.storage
      .from(bucket)
      .createSignedUrl(path, SIGNED_URL_TTL)
    if (!error && (data?.signedUrl || data?.signed_url)) {
      return data.signedUrl || data.signed_url
    }
  } catch { /* fall through */ }

  return null
}

// ─── Upload profile photo ─────────────────────────────────────
export async function uploadProfilePhoto({ file, userId, churchId }) {
  const err = validateImageFile(file)
  if (err) throw new Error(err)

  const path = buildProfilePhotoPath(userId, churchId, file)

  const { data: uploadData, error: uploadErr } = await insforge.storage
    .from(PROFILE_BUCKET)
    .upload(path, file, {
      upsert:       true,
      contentType:  file.type,
      cacheControl: '3600',
    })

  if (uploadErr) {
    console.error('[ProfilePhoto] Upload error:', uploadErr)
    throw new Error(
      `Upload failed: ${uploadErr.message || uploadErr.error || 'Storage error. Check permissions.'}`
    )
  }

  // Get the URL from the upload response first
  const uploadedPath = uploadData?.path || uploadData?.Key || path

  const url = await getReadableUrl(PROFILE_BUCKET, uploadedPath)
  if (!url) {
    // Last resort: construct URL manually using InsForge URL pattern
    const base = import.meta.env.VITE_INSFORGE_URL || ''
    if (base) {
      const manual = `${base}/storage/v1/object/public/${PROFILE_BUCKET}/${uploadedPath}`
      return { url: manual, path: uploadedPath }
    }
    throw new Error('Upload succeeded but could not retrieve photo URL. Please try again.')
  }

  return { url, path: uploadedPath }
}

// ─── Upload church logo ───────────────────────────────────────
export async function uploadChurchLogo({ file, churchId }) {
  const err = validateImageFile(file)
  if (err) throw new Error(err)

  const path = buildChurchLogoPath(churchId, file)

  const { data: uploadData, error: uploadErr } = await insforge.storage
    .from(LOGO_BUCKET)
    .upload(path, file, {
      upsert:       true,
      contentType:  file.type,
      cacheControl: '86400',
    })

  if (uploadErr) {
    // Fallback: try church-assets bucket if church-logos fails
    const { data: fallbackData, error: fallbackErr } = await insforge.storage
      .from('church-assets')
      .upload(`logos/${path}`, file, {
        upsert:      true,
        contentType: file.type,
      })
    if (fallbackErr) {
      throw new Error(`Logo upload failed: ${uploadErr.message || 'Storage error.'}`)
    }
    const fallbackPath = fallbackData?.path || `logos/${path}`
    const fallbackUrl  = await getReadableUrl('church-assets', fallbackPath)
    return { url: fallbackUrl || '', path: fallbackPath, bucket: 'church-assets' }
  }

  const uploadedPath = uploadData?.path || path
  const url = await getReadableUrl(LOGO_BUCKET, uploadedPath)

  // Manual URL if getReadableUrl fails
  const finalUrl = url || (
    `${import.meta.env.VITE_INSFORGE_URL}/storage/v1/object/public/${LOGO_BUCKET}/${uploadedPath}`
  )

  return { url: finalUrl, path: uploadedPath, bucket: LOGO_BUCKET }
}

// ─── Save avatar URL to user profile ─────────────────────────
export async function saveAvatarUrl(userId, url) {
  const { error } = await insforge.database
    .rpc('update_profile_avatar', {
      p_user_id:    userId,
      p_avatar_url: url,
    })
  if (error) throw new Error(`Failed to save photo to profile: ${error.message}`)
}

// ─── Save member photo URL ────────────────────────────────────
export async function saveMemberPhotoUrl(memberId, url) {
  const { error } = await insforge.database
    .rpc('update_member_photo', {
      p_member_id: memberId,
      p_photo_url: url,
    })
  if (error) throw new Error(`Failed to save photo to member record: ${error.message}`)
}

// ─── Re-export validatePhotoFile alias ───────────────────────
export { validateImageFile as validatePhotoFile }
