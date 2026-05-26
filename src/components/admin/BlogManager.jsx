// ============================================================
// ChurchFlow Liberia — Blog Manager (Super Admin)
// Create, edit, publish, and delete blog posts.
// ============================================================
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, X, Save, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { listAllPosts, savePost, deletePost } from '../../services/blogService'

const CATEGORIES = ['Church Management', 'Finance', 'Industry', 'Ministry Growth', 'General']

const EMPTY = {
  slug: '', title: '', excerpt: '', body: '',
  author_name: '', author_role: '', category: 'General',
  cover_url: '', read_time: '5 min read', published: false,
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function BlogManager() {
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // null | post object
  const [saving,  setSaving]  = useState(false)
  const [deleting,setDeleting]= useState(null)   // post id being deleted

  async function load() {
    setLoading(true)
    try { setPosts(await listAllPosts()) } catch (e) { toast.error(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function openNew()  { setEditing({ ...EMPTY }) }
  function openEdit(p){ setEditing({ ...p }) }
  function cancel()   { setEditing(null) }

  function onChange(field, value) {
    setEditing(prev => {
      const next = { ...prev, [field]: value }
      // auto-generate slug from title if new post
      if (field === 'title' && !prev.id) next.slug = slugify(value)
      return next
    })
  }

  async function handleSave() {
    if (!editing.title.trim()) { toast.error('Title is required.'); return }
    if (!editing.slug.trim())  { toast.error('Slug is required.');  return }
    if (!editing.excerpt.trim()){ toast.error('Excerpt is required.'); return }
    setSaving(true)
    try {
      await savePost(editing)
      toast.success(editing.id ? 'Post updated.' : 'Post created.')
      setEditing(null)
      load()
    } catch (e) { toast.error(e.message) }
    setSaving(false)
  }

  async function handleDelete(id) {
    setDeleting(id)
    try {
      await deletePost(id)
      toast.success('Post deleted.')
      setPosts(p => p.filter(x => x.id !== id))
    } catch (e) { toast.error(e.message) }
    setDeleting(null)
  }

  async function togglePublish(post) {
    try {
      await savePost({ ...post, published: !post.published })
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: !p.published } : p))
      toast.success(post.published ? 'Post unpublished.' : 'Post published.')
    } catch (e) { toast.error(e.message) }
  }

  if (editing !== null) {
    return (
      <div className="space-y-6">
        {/* Editor header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-800">{editing.id ? 'Edit Post' : 'New Blog Post'}</h2>
          <button onClick={cancel} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Title */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
            <input value={editing.title} onChange={e => onChange('title', e.target.value)}
              placeholder="Post title"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400" />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Slug * <span className="font-normal text-slate-400">(URL path)</span></label>
            <input value={editing.slug} onChange={e => onChange('slug', e.target.value)}
              placeholder="my-post-slug"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 font-mono" />
            <p className="text-[10px] text-slate-400 mt-1">/blog/{editing.slug || 'my-post-slug'}</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
            <select value={editing.category} onChange={e => onChange('category', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 bg-white">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Author Name</label>
            <input value={editing.author_name} onChange={e => onChange('author_name', e.target.value)}
              placeholder="Grace Kollie"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400" />
          </div>

          {/* Author role */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Author Role</label>
            <input value={editing.author_role} onChange={e => onChange('author_role', e.target.value)}
              placeholder="Head of Product"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400" />
          </div>

          {/* Read time */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Read Time</label>
            <input value={editing.read_time} onChange={e => onChange('read_time', e.target.value)}
              placeholder="5 min read"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400" />
          </div>

          {/* Cover URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Cover Image URL <span className="font-normal text-slate-400">(optional)</span></label>
            <input value={editing.cover_url} onChange={e => onChange('cover_url', e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400" />
          </div>

          {/* Excerpt */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Excerpt * <span className="font-normal text-slate-400">(shown on blog listing)</span></label>
            <textarea value={editing.excerpt} onChange={e => onChange('excerpt', e.target.value)}
              rows={3} placeholder="A short summary of the post..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 resize-none" />
          </div>

          {/* Body */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Body * <span className="font-normal text-slate-400">— supports ## headings, **bold**, *italic*, --- divider</span>
            </label>
            <textarea value={editing.body} onChange={e => onChange('body', e.target.value)}
              rows={16} placeholder="Write your post here..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 resize-y font-mono" />
          </div>

          {/* Publish toggle */}
          <div className="lg:col-span-2 flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <input type="checkbox" id="pub" checked={!!editing.published}
              onChange={e => onChange('published', e.target.checked)}
              className="w-4 h-4 accent-purple-600 cursor-pointer" />
            <label htmlFor="pub" className="text-sm font-semibold text-slate-700 cursor-pointer">
              Publish immediately — visible to all visitors on /blog
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : (editing.id ? 'Save changes' : 'Create post')}
          </button>
          <button onClick={cancel} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800">Blog Posts</h2>
          <p className="text-sm text-slate-500 mt-0.5">Create and manage articles shown on the public /blog page.</p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
          <p className="text-sm text-slate-400 mb-3">No blog posts yet.</p>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
            <Plus className="w-4 h-4" /> Write your first post
          </button>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${post.published ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{post.category}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 truncate">{post.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate">/blog/{post.slug} · {post.author_name} · {post.read_time}</p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {post.published && (
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="View post">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => togglePublish(post)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  title={post.published ? 'Unpublish' : 'Publish'}>
                  {post.published
                    ? <Eye className="w-4 h-4 text-green-600" />
                    : <EyeOff className="w-4 h-4 text-slate-400" />}
                </button>
                <button onClick={() => openEdit(post)}
                  className="p-2 rounded-lg hover:bg-purple-50 text-slate-500 hover:text-purple-700 transition-colors" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id}
                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                  {deleting === post.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
