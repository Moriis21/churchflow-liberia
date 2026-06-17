// ============================================================
// ChurchFlow Liberia — Blog Service
// ============================================================
import { insforge } from '../lib/insforge'

const BASE_URL = import.meta.env.VITE_INSFORGE_URL  || ''
const ANON_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY || ''

// Direct fetch using InsForge's /api/database/records path + anon key.
// Works for both logged-in and anonymous users.
async function anonFetch(table, params = {}) {
  const base = BASE_URL.replace(/\/$/, '') + '/api/database/records/' + table
  const qs   = Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
  const url  = qs ? `${base}?${qs}` : base
  const res  = await fetch(url, {
    method:      'GET',
    credentials: 'omit',   // never send session cookies — anon key only
    headers: {
      'apikey':        ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Accept':        'application/json',
    },
  })
  if (!res.ok) throw new Error(`InsForge ${res.status}`)
  return res.json()
}

// IMPORTANT: public reads use anonFetch ONLY — never the SDK.
// The SDK attaches a stored (possibly expired) session token as the
// Authorization header and retries it, causing 401s for visitors who
// once logged in. A pure anon fetch with credentials:'omit' is the
// reliable path for public pages.
export async function listPublishedPosts() {
  try {
    const rows = await anonFetch('blog_posts', {
      select:    'id,slug,title,excerpt,author_name,author_role,category,cover_url,read_time,published_at',
      published: 'eq.true',
      order:     'published_at.desc',
    })
    return Array.isArray(rows) ? rows : []
  } catch (e) {
    console.error('[blog]', e.message)
    return []
  }
}

export async function getPostBySlug(slug) {
  try {
    const rows = await anonFetch('blog_posts', {
      select:    '*',
      slug:      `eq.${slug}`,
      published: 'eq.true',
      limit:     '1',
    })
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
  } catch (e) {
    console.error('[blog]', e.message)
    return null
  }
}

// ─── Super Admin only ─────────────────────────────────────────
export async function listAllPosts() {
  const { data, error } = await insforge.database
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

export async function savePost(post) {
  const now = new Date().toISOString()
  const payload = {
    slug:        post.slug,
    title:       post.title,
    excerpt:     post.excerpt,
    body:        post.body,
    author_name: post.author_name,
    author_role: post.author_role,
    category:    post.category,
    cover_url:   post.cover_url || null,
    read_time:   post.read_time,
    published:   !!post.published,
    published_at: post.published ? (post.published_at || now) : null,
    updated_at:  now,
  }
  if (post.id) {
    const { data, error } = await insforge.database
      .from('blog_posts').update(payload).eq('id', post.id).select().maybeSingle()
    if (error) throw new Error(error.message)
    return data
  }
  const { data, error } = await insforge.database
    .from('blog_posts').insert({ ...payload, created_at: now }).select().maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function deletePost(id) {
  const { error } = await insforge.database.from('blog_posts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
