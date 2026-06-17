// ============================================================
// ChurchFlow Liberia — Blog Page (/blog)
// Loads posts from the blog_posts DB table (super admin managed).
// ============================================================
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock, Loader2 } from 'lucide-react'
import PublicLayout from './PublicLayout'
import { listPublishedPosts } from '../../services/blogService'
import { stripEmoji } from './BlogPostPage'

const CATEGORY_STYLES = {
  'Church Management': 'bg-purple-50 text-[#8A19FF]',
  'Finance':           'bg-amber-50 text-amber-600',
  'Industry':          'bg-blue-50 text-blue-600',
  'Ministry Growth':   'bg-green-50 text-green-600',
  'General':           'bg-slate-100 text-slate-600',
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function AuthorAvatar({ name }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CF'
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 text-white text-[10px] font-bold flex-shrink-0">
      {initials}
    </span>
  )
}

function PostCard({ post, featured = false }) {
  const categoryStyle = CATEGORY_STYLES[post.category] || CATEGORY_STYLES['General']

  if (featured) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.18)] transition-all duration-300 lg:flex">
        <div className="lg:w-2/5 min-h-[220px] bg-gradient-to-br from-[#151022] to-[#5B00B8] flex items-center justify-center flex-shrink-0">
          {post.cover_url
            ? <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
            : <BookOpen className="w-16 h-16 text-white/20" />}
        </div>
        <div className="p-6 lg:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${categoryStyle}`}>{post.category}</span>
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Featured</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3 leading-tight">{stripEmoji(post.title)}</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-3">{stripEmoji(post.excerpt)}</p>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <AuthorAvatar name={post.author_name} />
              <span className="font-semibold text-slate-700">{post.author_name}</span>
              <span>·</span><span>{formatDate(post.published_at)}</span>
              <span>·</span><Clock className="w-3 h-3" /><span>{post.read_time}</span>
            </div>
            <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors">
              Read more <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.12)] transition-all duration-300 flex flex-col">
      <div className="h-36 bg-gradient-to-br from-[#151022] to-[#5B00B8] flex items-center justify-center flex-shrink-0">
        {post.cover_url
          ? <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
          : <BookOpen className="w-10 h-10 text-white/20" />}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <span className={`self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${categoryStyle}`}>{post.category}</span>
        <h3 className="text-sm font-extrabold text-slate-800 mb-2 line-clamp-2 leading-snug">{stripEmoji(post.title)}</h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4 flex-1">{stripEmoji(post.excerpt)}</p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <AuthorAvatar name={post.author_name} />
            <span>{post.author_name}</span>
            <span>·</span><Clock className="w-3 h-3" /><span>{post.read_time}</span>
          </div>
          <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors">
            Read more <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BlogPage() {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listPublishedPosts().then((p) => { setPosts(p); setLoading(false) })
  }, [])

  const featured = posts[0] || null
  const rest     = posts.slice(1)

  return (
    <PublicLayout>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-50 text-[#8A19FF] text-xs font-bold uppercase tracking-widest mb-3">Blog</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Insights for Liberian Churches</h1>
          <p className="text-base text-slate-500 max-w-xl mx-auto">Practical guides, industry trends, and best practices for modern church management.</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No articles published yet. Check back soon.</p>
          </div>
        )}

        {!loading && featured && <PostCard post={featured} featured />}

        {!loading && rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
