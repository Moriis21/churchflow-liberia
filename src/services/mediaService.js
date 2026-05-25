// ============================================================
// ChurchFlow Liberia — Bible Learning Media Service
//
// Thin wrapper over the media_resources table + platform feature
// flags. Read-only for end users; writes are super-admin only.
// ============================================================
import { insforge } from '../lib/insforge'

export async function listMediaResources({ provider = null, category = null } = {}) {
  let q = insforge.database
    .from('media_resources')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('title', { ascending: true })

  if (provider) q = q.eq('provider', provider)
  if (category) q = q.eq('category', category)

  const { data, error } = await q
  if (error) {
    console.warn('[mediaService] list failed:', error.message)
    return []
  }
  return data || []
}

export async function isFeatureEnabled(key) {
  try {
    const { data } = await insforge.database
      .from('platform_feature_flags')
      .select('enabled')
      .eq('key', key)
      .maybeSingle()
    // Default to true when flag row is missing (don't hide modules accidentally)
    return data?.enabled !== false
  } catch {
    return true
  }
}

export async function setFeatureFlag(key, enabled) {
  const { error } = await insforge.database.rpc('set_feature_flag', {
    p_key:     key,
    p_enabled: !!enabled,
  })
  if (error) throw new Error(error.message)
}

// ─── Watch history ───────────────────────────────────────────
export async function logMediaView(resourceId, { position = null, completed = false } = {}) {
  if (!resourceId) return
  try {
    await insforge.database.rpc('log_media_view', {
      p_resource_id: resourceId,
      p_position:    position,
      p_completed:   completed,
    })
  } catch (err) {
    // Non-blocking — view logging must never break playback
    console.warn('[mediaService] logMediaView failed:', err?.message)
  }
}

export async function listMyWatchHistory(limit = 8) {
  try {
    const { data, error } = await insforge.database.rpc('list_my_watch_history', { p_limit: limit })
    if (error) return []
    return Array.isArray(data) ? data.map((r) => ({ ...r, id: r.resource_id })) : []
  } catch {
    return []
  }
}

// ─── AI outputs (summary / questions / devotional) ───────────
export async function getCachedAiOutput(resourceId, kind) {
  const { data, error } = await insforge.database
    .from('media_ai_outputs')
    .select('content, model, created_at')
    .eq('resource_id', resourceId)
    .eq('kind', kind)
    .maybeSingle()
  if (error) return null
  return data || null
}

export async function saveAiOutput(resourceId, kind, content, model) {
  try {
    await insforge.database.rpc('save_media_ai_output', {
      p_resource_id: resourceId,
      p_kind:        kind,
      p_content:     content,
      p_model:       model || null,
    })
  } catch (err) {
    console.warn('[mediaService] saveAiOutput failed:', err?.message)
  }
}

// ─── Embed helpers ───────────────────────────────────────────
// Normalize various URLs into something safe to drop into an iframe.

const YT_PATTERNS = [
  /youtube\.com\/watch\?v=([\w-]{11})/,
  /youtu\.be\/([\w-]{11})/,
  /youtube\.com\/embed\/([\w-]{11})/,
  /youtube\.com\/shorts\/([\w-]{11})/,
]
function youtubeId(url) {
  if (!url) return null
  for (const p of YT_PATTERNS) {
    const m = url.match(p); if (m) return m[1]
  }
  return null
}

const VIMEO_PATTERN = /vimeo\.com\/(\d+)/
function vimeoId(url) {
  if (!url) return null
  const m = url.match(VIMEO_PATTERN); return m ? m[1] : null
}

// Returns { type, src } or null. type ∈ 'youtube' | 'vimeo' | 'mp4' | null
export function resolveEmbed(resource) {
  if (!resource) return null
  const raw = resource.embed_url || resource.video_url || ''
  const yt = youtubeId(raw)
  if (yt) {
    // youtube-nocookie domain reduces tracking + plays inside CSP frame-src
    return {
      type: 'youtube',
      src:  `https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1`,
    }
  }
  const vm = vimeoId(raw)
  if (vm) {
    return { type: 'vimeo', src: `https://player.vimeo.com/video/${vm}` }
  }
  if (/\.mp4(\?|$)/i.test(raw)) {
    return { type: 'mp4', src: raw }
  }
  return null
}
