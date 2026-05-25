// ============================================================
// ChurchFlow Liberia — Image Storage Service
// ============================================================
//
// ROOT CAUSE: InsForge storage requires auth for ALL URL access,
// even on buckets marked public = true. Raw public URLs fail
// in browser <img> tags because they can't send auth headers.
//
// SOLUTION: createSignedUrl() embeds the token in the URL as a
// query parameter → works directly in <img src="..."> tags.
//
// STRATEGY:
//   1. Upload → get back { path, url }
//   2. Save BOTH path (permanent) and url (signed, 7-day) to DB
//   3. On display: generate fresh signed URL from stored path
//   4. onError fallback → show initials avatar / church initial
// ============================================================
import { insforge } from '../lib/insforge'

// ─── Bucket constants ─────────────────────────────────────────
export const BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  CHURCH_LOGOS:   'church-logos',
  MEMBER_PHOTOS:  'member-photos',
  CHURCH_ASSETS:  'church-assets',
}

// ─── Config ───────────────────────────────────────────────────
const SIGNED_URL_TTL = 604800   // 7 days
const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES  = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// ─── Validate image file ──────────────────────────────────────
export function validateImageUpload(file) {
  if (!file) return 'No file selected.'
  const type = file.type?.toLowerCase()
  if (!ALLOWED_TYPES.includes(type)) {
    return 'Only JPG, JPEG, PNG, or WEBP images are allowed.'
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `Image must be under 5 MB (yours is ${(file.size / 1024 / 1024).toFixed(1)} MB).`
  }
  return null
}

// Re-export as validateImageFile for backward compatibility
export { validateImageUpload as validateImageFile, validateImageUpload as validatePhotoFile }

// ─── Extract storage path from full URL or return path as-is ─
//
// Supabase/InsForge public URL:
//   .../storage/v1/object/public/{bucket}/{path}
// Signed URL:
//   .../storage/v1/object/sign/{bucket}/{path}?token=...
//
export function extractPath(pathOrUrl, bucket) {
  if (!pathOrUrl) return null
  // Already a path (no scheme) → use as-is
  if (!pathOrUrl.startsWith('http://') && !pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  const markers = [
    `/storage/v1/object/public/${bucket}/`,
    `/storage/v1/object/sign/${bucket}/`,
    `/storage/v1/object/authenticated/${bucket}/`,
  ]
  for (const marker of markers) {
    const idx = pathOrUrl.indexOf(marker)
    if (idx !== -1) {
      return decodeURIComponent(pathOrUrl.slice(idx + marker.length).split('?')[0])
    }
  }
  return null
}

// ─── Module-level signed-URL cache ────────────────────────────
//
// Without this, a list of 50 avatars triggers 50 createSignedUrl
// round-trips on every render. With it: each (bucket, path) pair
// resolves once per page load and lives in memory for a configurable
// TTL. Cache key is `bucket|path` so different buckets stay isolated.
//
const _signedUrlCache = new Map()
const _inflight       = new Map()
const CACHE_TTL_MS = 60 * 60 * 1000  // refresh signed URL every hour (TTL is 7d but stay safe)

function _cacheGet(key) {
  const entry = _signedUrlCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    _signedUrlCache.delete(key)
    return null
  }
  return entry.value
}
function _cacheSet(key, value) {
  _signedUrlCache.set(key, { value, at: Date.now() })
}

// Public: drop the cache when you intentionally want a fresh URL
// (e.g. just after re-uploading an avatar with the same path).
export function clearImageUrlCache(bucket = null, path = null) {
  if (!bucket) { _signedUrlCache.clear(); return }
  if (!path) {
    for (const k of _signedUrlCache.keys()) {
      if (k.startsWith(bucket + '|')) _signedUrlCache.delete(k)
    }
    return
  }
  _signedUrlCache.delete(`${bucket}|${path}`)
}

// ─── Generate a signed URL (primary display method) ──────────
//
// Signed URLs include the token as a query param → work in
// browser <img> tags without needing auth headers.
// TTL default: 7 days (refreshed on every page load).
//
export async function getSignedImageUrl(bucket, pathOrUrl, ttl = SIGNED_URL_TTL) {
  if (!pathOrUrl || !bucket) return null

  const path = extractPath(pathOrUrl, bucket)
  if (!path) return null

  try {
    const { data, error } = await insforge.storage
      .from(bucket)
      .createSignedUrl(path, ttl)
    if (!error && (data?.signedUrl || data?.signed_url)) {
      return data.signedUrl || data.signed_url
    }
    if (error) console.warn(`[imageStorage] createSignedUrl(${bucket}/${path}):`, error.message)
  } catch (err) {
    console.warn('[imageStorage] createSignedUrl threw:', err?.message)
  }
  return null
}

// ─── Get readable file URL ─────────────────────────────────────
// Primary:  signed URL (always works in <img> tags)
// Fallback: public URL + apikey query param
//
export async function getReadableFileUrl(bucket, pathOrUrl) {
  if (!pathOrUrl || !bucket) return null

  // Blob / data URLs are already displayable
  if (pathOrUrl.startsWith('blob:') || pathOrUrl.startsWith('data:')) {
    return pathOrUrl
  }

  // Cache hit? Skip the round-trip entirely.
  const cacheKey = `${bucket}|${pathOrUrl}`
  const cached = _cacheGet(cacheKey)
  if (cached) return cached

  // In-flight de-dup: parallel callers for the same key share one
  // promise instead of firing N round-trips for the same avatar.
  const inflight = _inflight.get(cacheKey)
  if (inflight) return inflight

  const promise = _resolveReadableUrl(bucket, pathOrUrl)
  _inflight.set(cacheKey, promise)
  try {
    const out = await promise
    if (out) _cacheSet(cacheKey, out)
    return out
  } finally {
    _inflight.delete(cacheKey)
  }
}

// Inner resolver — actually does the work without caching.
async function _resolveReadableUrl(bucket, pathOrUrl) {
  // 1. Signed URL — most reliable for InsForge
  const signed = await getSignedImageUrl(bucket, pathOrUrl)
  if (signed) return signed

  // 2. Public URL with anon key as query param
  const path = extractPath(pathOrUrl, bucket)
  if (path) {
    try {
      const { data } = insforge.storage.from(bucket).getPublicUrl(path)
      const pub = data?.publicUrl || data?.url
      if (pub && !pub.includes('undefined') && !pub.includes('null')) {
        const key = import.meta.env.VITE_INSFORGE_ANON_KEY || ''
        return pub + (pub.includes('?') ? '&' : '?') + 'apikey=' + key
      }
    } catch { /* ignore */ }
  }

  // 3. Manual URL construction (last resort)
  const base = import.meta.env.VITE_INSFORGE_URL || ''
  const storagePath = path || pathOrUrl
  if (base && storagePath && !storagePath.startsWith('http')) {
    const key = import.meta.env.VITE_INSFORGE_ANON_KEY || ''
    return `${base}/storage/v1/object/public/${bucket}/${storagePath}?apikey=${key}`
  }

  return null
}

// Backward-compatible alias
export { getReadableFileUrl as getReadableUrl }

// ─── Build storage paths ──────────────────────────────────────
export function buildAvatarPath(userId, churchId, file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const ts  = Date.now()
  const cid = churchId || 'platform'
  return `${cid}/${userId}/avatar-${ts}.${ext}`
}

export function buildLogoPath(churchId, file) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const ts  = Date.now()
  return `${churchId}/logo-${ts}.${ext}`
}

export function buildMemberPhotoPath(memberId, churchId, file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const ts  = Date.now()
  return `${churchId || 'x'}/${memberId}/photo-${ts}.${ext}`
}

// ─── Upload profile photo ─────────────────────────────────────
// Returns { path, url, bucket }
// path: permanent storage path (save to DB as avatar_path)
// url:  fresh signed URL  (save to DB as avatar_url for display)
//
export async function uploadProfilePhoto({ file, userId, churchId }) {
  const err = validateImageUpload(file)
  if (err) throw new Error(err)

  const path = buildAvatarPath(userId, churchId, file)

  const { data: uploaded, error: uploadErr } = await insforge.storage
    .from(BUCKETS.PROFILE_PHOTOS)
    .upload(path, file, {
      upsert:       true,
      contentType:  file.type,
      cacheControl: '3600',
    })

  if (uploadErr) {
    const msg = uploadErr.message || String(uploadErr)
    throw new Error(`Profile photo upload failed: ${msg}`)
  }

  const storedPath = uploaded?.path || path
  clearImageUrlCache(BUCKETS.PROFILE_PHOTOS, storedPath)
  const url = await getReadableFileUrl(BUCKETS.PROFILE_PHOTOS, storedPath)

  return { path: storedPath, url: url || '', bucket: BUCKETS.PROFILE_PHOTOS }
}

// ─── Upload church logo ───────────────────────────────────────
// Returns { path, url, bucket }
//
export async function uploadChurchLogo({ file, churchId }) {
  const err = validateImageUpload(file)
  if (err) throw new Error(err)

  const path = buildLogoPath(churchId, file)

  const { data: uploaded, error: uploadErr } = await insforge.storage
    .from(BUCKETS.CHURCH_LOGOS)
    .upload(path, file, {
      upsert:       true,
      contentType:  file.type,
      cacheControl: '86400',
    })

  if (uploadErr) {
    // Fallback to church-assets bucket
    console.warn('[imageStorage] church-logos failed, trying church-assets:', uploadErr.message)
    const fbPath = `logos/${path}`
    const { data: fb, error: fbe } = await insforge.storage
      .from(BUCKETS.CHURCH_ASSETS)
      .upload(fbPath, file, { upsert: true, contentType: file.type })
    if (fbe) throw new Error(`Logo upload failed: ${uploadErr.message}`)
    const fbStoredPath = fb?.path || fbPath
    const fbUrl = await getReadableFileUrl(BUCKETS.CHURCH_ASSETS, fbStoredPath)
    return { path: fbStoredPath, url: fbUrl || '', bucket: BUCKETS.CHURCH_ASSETS }
  }

  const storedPath = uploaded?.path || path
  clearImageUrlCache(BUCKETS.CHURCH_LOGOS, storedPath)
  const url = await getReadableFileUrl(BUCKETS.CHURCH_LOGOS, storedPath)

  return { path: storedPath, url: url || '', bucket: BUCKETS.CHURCH_LOGOS }
}

// ─── Upload member photo ──────────────────────────────────────
export async function uploadMemberPhoto({ file, memberId, churchId }) {
  const err = validateImageUpload(file)
  if (err) throw new Error(err)

  const path = buildMemberPhotoPath(memberId, churchId, file)

  const { data: uploaded, error: uploadErr } = await insforge.storage
    .from(BUCKETS.MEMBER_PHOTOS)
    .upload(path, file, {
      upsert:       true,
      contentType:  file.type,
      cacheControl: '3600',
    })

  if (uploadErr) throw new Error(`Member photo upload failed: ${uploadErr.message}`)

  const storedPath = uploaded?.path || path
  clearImageUrlCache(BUCKETS.MEMBER_PHOTOS, storedPath)
  const url = await getReadableFileUrl(BUCKETS.MEMBER_PHOTOS, storedPath)

  return { path: storedPath, url: url || '', bucket: BUCKETS.MEMBER_PHOTOS }
}

// ─── Delete old image from storage ───────────────────────────
export async function removeOldImage(bucket, pathOrUrl) {
  if (!pathOrUrl || !bucket) return
  const path = extractPath(pathOrUrl, bucket)
  if (!path) return
  try {
    await insforge.storage.from(bucket).remove([path])
  } catch (e) {
    console.warn('[imageStorage] removeOldImage failed:', e?.message)
  }
}

// ─── addApiKey helper (backward compat) ──────────────────────
export function addApiKey(url) {
  if (!url) return url
  const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY
  if (!anonKey) return url
  if (!url.includes('insforge.app') && !url.includes('insforge.site')) return url
  if (url.includes('apikey=')) return url
  return url + (url.includes('?') ? '&' : '?') + 'apikey=' + anonKey
}
