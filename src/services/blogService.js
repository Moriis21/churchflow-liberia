// ============================================================
// ChurchFlow Liberia — Blog Service
// ============================================================
import { insforge } from '../lib/insforge'

export async function listPublishedPosts() {
  const { data, error } = await insforge.database
    .from('blog_posts')
    .select('id,slug,title,excerpt,author_name,author_role,category,cover_url,read_time,published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (error) { console.error('[blogService]', error.message); return [] }
  return data || []
}

export async function getPostBySlug(slug) {
  const { data, error } = await insforge.database
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  if (error) { console.error('[blogService]', error.message); return null }
  return data || null
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
