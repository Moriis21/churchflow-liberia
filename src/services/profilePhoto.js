// ============================================================
// ChurchFlow Liberia — Profile Photo Upload Service
// Handles upload → URL with public + signed URL fallbacks.
// ============================================================
import { insforge } from '../lib/insforge'

const BUCKET      = 'profile-photos'
const MAX_SIZE_MB  = 5
const ALLOWED     = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

// ─── Validate file ────────────────────────────────────────────
export function validatePhotoFile(file) {
  if (!file) return 'No file selected.'
  if (!ALLOWED.includes(file.type)) return 'Only JPG, PNG or WEBP images are allowed.'
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return `Image must be under ${MAX_SIZE_MB}MB.`
  return null // valid
}

// ─── Build storage path ───────────────────────────────────────
export function buildPhotoPath(userId, churchId, file) {
  const ext       = file.name.split('.').pop().toLowerCase().replace('jpg', 'jpeg')
  const timestamp = Date.now()
  const cid       = churchId || 'no-church'
  return `${cid}/${userId}/avatar-${timestamp}.${ext}`
}

// ─── Get readable URL (public → signed fallback) ─────────────
export async function getProfilePhotoUrl(path) {
  if (!path) return null
  try {
    // Try public URL first (works if bucket is public)
    const { data } = insforge.storage.from(BUCKET).getPublicUrl(path)
    if (data?.publicUrl && !data.publicUrl.includes('undefined')) {
      return data.publicUrl
    }
  } catch { /* fall through */ }

  try {
    // Fallback: signed URL valid for 1 hour
    const { data, error } = await insforge.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600)
    if (!error && data?.signedUrl) return data.signedUrl
  } catch { /* fall through */ }

  return null // caller should show default avatar
}

// ─── Upload photo ─────────────────────────────────────────────
/**
 * Upload profile photo to InsForge storage.
 * Returns { url, path } on success, throws on failure.
 */
export async function uploadProfilePhoto({ file, userId, churchId }) {
  const validErr = validatePhotoFile(file)
  if (validErr) throw new Error(validErr)

  const path = buildPhotoPath(userId, churchId, file)

  // Upload with upsert (replace existing)
  const { error: uploadErr } = await insforge.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert:      true,
      contentType: file.type,
      cacheControl: '3600',
    })

  if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`)

  // Get the readable URL
  const url = await getProfilePhotoUrl(path)
  if (!url) throw new Error('Upload succeeded but could not retrieve photo URL.')

  return { url, path }
}

// ─── Save URL to user_profiles ────────────────────────────────
export async function saveAvatarUrl(userId, url) {
  const { error } = await insforge.database
    .rpc('update_profile_avatar', {
      p_user_id:   userId,
      p_avatar_url: url,
    })
  if (error) {
    // Fallback to direct update
    const { error: directErr } = await insforge.database
      .from('user_profiles')
      .update({ avatar_url: url })
      .eq('id', userId)
    if (directErr) throw new Error(`Failed to save photo URL: ${directErr.message}`)
  }
}
