// ============================================================
// ChurchFlow Liberia — Individual Blog Post Page (/blog/:slug)
// ============================================================
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Clock, ArrowLeft, User, Tag, Loader2, AlertCircle } from 'lucide-react'
import PublicLayout from './PublicLayout'
import { getPostBySlug } from '../../services/blogService'

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

// Markdown renderer: #/##/###/####, **bold**, *italic*, [links], --- hr,
// - bullet lists. Any heading level renders cleanly — no raw '#' ever shows.
// Strip emoji / pictographs for a clean, professional look
const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{2700}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu

export function stripEmoji(text = '') {
  return text.replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim()
}

function inline(text) {
  return stripEmoji(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-purple-600 underline hover:text-purple-800" target="_blank" rel="noopener noreferrer">$1</a>')
}

function renderBody(body) {
  if (!body) return null
  const lines = body.split('\n')
  const elements = []
  let i = 0
  let listBuf = []

  const flushList = (key) => {
    if (!listBuf.length) return
    elements.push(
      <ul key={`ul-${key}`} className="list-disc pl-6 space-y-1.5 mb-4 text-slate-700 leading-relaxed">
        {listBuf.map((item, n) => (
          <li key={n} dangerouslySetInnerHTML={{ __html: inline(item) }} />
        ))}
      </ul>
    )
    listBuf = []
  }

  while (i < lines.length) {
    const line = lines[i]
    const m = line.match(/^(#{1,6})\s+(.*)$/)
    const isBullet = /^\s*[-*]\s+/.test(line)

    if (isBullet) {
      listBuf.push(line.replace(/^\s*[-*]\s+/, ''))
    } else if (m) {
      flushList(i)
      const level = m[1].length
      const text  = m[2]
      const cls = level <= 1
        ? 'text-2xl font-extrabold text-slate-900 mt-8 mb-3'
        : level === 2
        ? 'text-xl font-extrabold text-slate-900 mt-8 mb-3'
        : 'text-lg font-bold text-slate-800 mt-6 mb-2'
      const Tag = level <= 2 ? (level === 1 ? 'h1' : 'h2') : 'h3'
      elements.push(<Tag key={i} className={cls} dangerouslySetInnerHTML={{ __html: inline(text) }} />)
    } else if (line.trim() === '---') {
      flushList(i)
      elements.push(<hr key={i} className="my-8 border-slate-200" />)
    } else if (line.trim() === '') {
      flushList(i)
    } else {
      flushList(i)
      elements.push(
        <p key={i} className="text-slate-700 leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: inline(line) }} />
      )
    }
    i++
  }
  flushList('end')
  return elements
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    getPostBySlug(slug).then((p) => {
      if (!p) setNotFound(true)
      else setPost(p)
      setLoading(false)
    })
  }, [slug])

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
          </div>
        )}

        {!loading && notFound && (
          <div className="text-center py-24">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-700 mb-2">Post not found</h1>
            <p className="text-sm text-slate-500 mb-6">This article may have been removed or the link may be incorrect.</p>
            <Link to="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              View all articles
            </Link>
          </div>
        )}

        {!loading && post && (
          <article>
            {/* Category */}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${CATEGORY_STYLES[post.category] || CATEGORY_STYLES['General']}`}>
              {post.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              {stripEmoji(post.title)}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> {post.author_name}
                {post.author_role && <span className="text-slate-400">· {post.author_role}</span>}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {formatDate(post.published_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {post.read_time}
              </span>
            </div>

            {/* Cover image */}
            {post.cover_url && (
              <img
                src={post.cover_url} alt={post.title}
                className="w-full rounded-2xl mb-8 object-cover max-h-80"
              />
            )}

            {/* Body */}
            <div className="prose-sm sm:prose max-w-none">
              {renderBody(post.body)}
            </div>

            {/* Footer CTA */}
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500 mb-4">Ready to bring ChurchFlow to your church?</p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Get started free
              </Link>
            </div>
          </article>
        )}
      </div>
    </PublicLayout>
  )
}
