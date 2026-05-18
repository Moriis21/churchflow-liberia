// ============================================================
// ChurchFlow Liberia — Blog Page (/blog)
// ============================================================
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, User, Tag, ArrowRight, BookOpen, Clock } from 'lucide-react'
import PublicLayout from './PublicLayout'

const POSTS = [
  {
    id: 1,
    title: '5 Reasons Liberian Churches Are Switching to Digital Record-Keeping',
    excerpt:
      'Paper attendance sheets and handwritten ledgers have served Liberian churches for decades. But as congregations grow and administrative complexity increases, more and more ministries are making the switch to dedicated software. Here is why — and what to look for.',
    date: 'May 15, 2026',
    author: 'Grace Kollie',
    authorRole: 'Head of Product',
    category: 'Church Management',
    readTime: '5 min read',
    slug: '5-reasons-digital-records',
    featured: true,
  },
  {
    id: 2,
    title: 'How to Run a Successful Church Finance Report Every Month',
    excerpt:
      'Transparent financial reporting builds trust between church leadership and the congregation. This guide walks through the monthly finance report process step by step — from recording offerings to presenting the report to your board.',
    date: 'May 8, 2026',
    author: 'Samuel Kwame',
    authorRole: 'CEO',
    category: 'Finance',
    readTime: '7 min read',
    slug: 'monthly-finance-report',
    featured: false,
  },
  {
    id: 3,
    title: 'Digital Transformation in African Churches: Where Are We Now?',
    excerpt:
      'Across sub-Saharan Africa, churches are at very different stages of their digital journey. This article surveys the current state of technology adoption among African congregations and what the next five years are likely to look like.',
    date: 'April 28, 2026',
    author: 'Emmanuel Gbaye',
    authorRole: 'Head of Engineering',
    category: 'Industry',
    readTime: '8 min read',
    slug: 'digital-transformation-african-churches',
    featured: false,
  },
  {
    id: 4,
    title: 'The Complete Guide to Visitor Follow-Up in Your Church',
    excerpt:
      'Studies show that churches that contact first-time visitors within 36 hours see dramatically higher retention rates. This practical guide covers exactly how to build a visitor follow-up system — from the welcome desk to membership.',
    date: 'April 20, 2026',
    author: 'Grace Kollie',
    authorRole: 'Head of Product',
    category: 'Ministry Growth',
    readTime: '6 min read',
    slug: 'visitor-follow-up-guide',
    featured: false,
  },
]

const CATEGORY_STYLES = {
  'Church Management': 'bg-purple-50 text-[#7C3AED]',
  'Finance':           'bg-amber-50 text-amber-600',
  'Industry':          'bg-blue-50 text-blue-600',
  'Ministry Growth':   'bg-green-50 text-green-600',
}

const AUTHOR_INITIALS = {
  'Grace Kollie':    { initials: 'GK', gradient: 'from-amber-400 to-orange-500'    },
  'Samuel Kwame':    { initials: 'SK', gradient: 'from-purple-500 to-violet-600'   },
  'Emmanuel Gbaye':  { initials: 'EG', gradient: 'from-blue-500 to-cyan-600'       },
}

function PostCard({ post, featured = false }) {
  const authorInfo = AUTHOR_INITIALS[post.author] || { initials: 'CF', gradient: 'from-slate-400 to-slate-500' }

  if (featured) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
        <div className="bg-gradient-to-br from-[#1E1B4B] to-[#7C3AED] h-48 flex items-center justify-center p-8">
          <BookOpen className="w-16 h-16 text-white/20" />
        </div>
        <div className="p-7">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_STYLES[post.category] || 'bg-slate-100 text-slate-600'}`}>
              {post.category}
            </span>
            <span className="text-slate-300 text-xs">·</span>
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />{post.readTime}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#1E1B4B] mb-3 leading-tight group-hover:text-[#7C3AED] transition-colors">
            {post.title}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">{post.excerpt}</p>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${authorInfo.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                {authorInfo.initials}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1E1B4B]">{post.author}</p>
                <p className="text-xs text-slate-400">{post.date}</p>
              </div>
            </div>
            <Link
              to={`/blog/${post.slug}`}
              className="flex items-center gap-1.5 text-sm text-[#7C3AED] font-semibold hover:underline"
            >
              Read more
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow group flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_STYLES[post.category] || 'bg-slate-100 text-slate-600'}`}>
          {post.category}
        </span>
        <span className="text-slate-300 text-xs">·</span>
        <span className="text-slate-400 text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />{post.readTime}
        </span>
      </div>
      <h3 className="font-bold text-[#1E1B4B] text-base mb-2 leading-tight group-hover:text-[#7C3AED] transition-colors flex-1">
        {post.title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-3">{post.excerpt}</p>
      <div className="flex items-center justify-between gap-4 mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${authorInfo.gradient} flex items-center justify-center text-white text-xs font-bold`}>
            {authorInfo.initials}
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1E1B4B]">{post.author}</p>
            <p className="text-xs text-slate-400">{post.date}</p>
          </div>
        </div>
        <Link
          to={`/blog/${post.slug}`}
          className="flex items-center gap-1.5 text-xs text-[#7C3AED] font-semibold hover:underline"
        >
          Read
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = ['All', ...Array.from(new Set(POSTS.map(p => p.category)))]

  const filtered = activeCategory === 'All'
    ? POSTS
    : POSTS.filter(p => p.category === activeCategory)

  const [featuredPost, ...restPosts] = filtered

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E1B4B] via-[#312e81] to-[#7C3AED] py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#F59E0B] text-xs font-semibold tracking-widest uppercase mb-6 border border-white/20">
            Blog
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            ChurchFlow Insights
          </h1>
          <p className="text-lg text-purple-200 max-w-xl mx-auto leading-relaxed">
            Practical guides, ministry tips, and insights on church management and digital transformation for African churches.
          </p>
        </div>
      </section>

      {/* Category filter */}
      <div className="bg-white border-b border-slate-100 py-4 px-4 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500">No posts in this category yet.</p>
            </div>
          ) : (
            <>
              {featuredPost && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-5">
                    <Tag className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest">Featured</span>
                  </div>
                  <PostCard post={featuredPost} featured />
                </div>
              )}

              {restPosts.length > 0 && (
                <>
                  <h2 className="text-lg font-bold text-[#1E1B4B] mb-5">More Articles</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {restPosts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#1E1B4B] py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-white mb-3">Get articles in your inbox</h2>
          <p className="text-purple-300 text-sm mb-7 leading-relaxed">
            Subscribe to ChurchFlow Insights and receive practical ministry management tips monthly.
          </p>
          <Link
            to="/community"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F59E0B] text-[#1E1B4B] font-bold text-sm hover:bg-amber-400 transition-colors"
          >
            Subscribe to Newsletter
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
