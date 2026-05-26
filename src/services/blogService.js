// ============================================================
// ChurchFlow Liberia — Blog Service
//
// Public read functions (listPublishedPosts, getPostBySlug) use a
// direct REST fetch with the explicit anon key so they work on
// unauthenticated public pages where the InsForge SDK has no session.
// ============================================================
import { insforge } from '../lib/insforge'

const BASE_URL  = import.meta.env.VITE_INSFORGE_URL  || ''
const ANON_KEY  = import.meta.env.VITE_INSFORGE_ANON_KEY || ''
const REST_BASE = BASE_URL.replace(/\/$/, '') + '/rest/v1'

async function pgRest(path, params = {}) {
  const url = new URL(REST_BASE + path)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: {
      'apikey':        ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Accept':        'application/json',
    },
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText)
    throw new Error(`[blogService] ${res.status}: ${msg}`)
  }
  return res.json()
}

export async function listPublishedPosts() {
  try {
    const rows = await pgRest('/blog_posts', {
      select:      'id,slug,title,excerpt,author_name,author_role,category,cover_url,read_time,published_at',
      published:   'eq.true',
      order:       'published_at.desc',
    })
    return Array.isArray(rows) ? rows : []
  } catch (e) {
    console.error(e.message)
    return []
  }
}

export async function getPostBySlug(slug) {
  try {
    const rows = await pgRest('/blog_posts', {
      select:    '*',
      slug:      `eq.${slug}`,
      published: 'eq.true',
      limit:     '1',
    })
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
  } catch (e) {
    console.error(e.message)
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
