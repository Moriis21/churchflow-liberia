// ============================================================
// ChurchFlow Liberia, Help Centre Page (/help)
// ============================================================
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Rocket, Users, DollarSign, CalendarCheck,
  CalendarDays, CreditCard, ArrowRight, ChevronRight,
  MessageSquare, BookOpen, Mail
} from 'lucide-react'
import PublicLayout from './PublicLayout'

const CATEGORIES = [
  {
    icon: Rocket,
    title: 'Getting Started',
    description: 'Account setup, church profile, first steps',
    count: 12,
    color: 'bg-purple-100 text-[#8A19FF]',
    href: '/docs',
  },
  {
    icon: Users,
    title: 'Member Management',
    description: 'Profiles, departments, import, family links',
    count: 18,
    color: 'bg-blue-100 text-blue-600',
    href: '/docs#members',
  },
  {
    icon: DollarSign,
    title: 'Finance and Offerings',
    description: 'Recording offerings, receipts, LRD/USD, reports',
    count: 15,
    color: 'bg-amber-100 text-amber-600',
    href: '/docs#offering',
  },
  {
    icon: CalendarCheck,
    title: 'Attendance',
    description: 'Recording attendance, QR codes, service types',
    count: 10,
    color: 'bg-green-100 text-green-600',
    href: '/docs#attendance',
  },
  {
    icon: CalendarDays,
    title: 'Events',
    description: 'Creating events, RSVP, reminders, attendance',
    count: 9,
    color: 'bg-pink-100 text-pink-600',
    href: '/docs#evt-create',
  },
  {
    icon: CreditCard,
    title: 'Account and Billing',
    description: 'Plans, payment, upgrades, cancellation',
    count: 11,
    color: 'bg-indigo-100 text-indigo-600',
    href: '/pricing',
  },
]

const POPULAR_ARTICLES = [
  { title: 'How to add your first church member',                  category: 'Members',         href: '/docs#g-members'    },
  { title: 'Recording Sunday offering and generating a receipt',   category: 'Finance',         href: '/docs#g-offerings'  },
  { title: 'How to mark attendance for a Sunday service',          category: 'Attendance',      href: '/docs#g-attendance' },
  { title: 'Sending SMS messages to your congregation',            category: 'Communications',  href: '/docs#g-sms'        },
  { title: 'Creating events and accepting RSVPs',                  category: 'Events',          href: '/docs#g-events'     },
  { title: 'Uploading sermons and live streaming',                 category: 'Sermons',         href: '/docs#g-sermons'    },
  { title: 'The member portal, what members can do',              category: 'Members',         href: '/docs#g-portal'     },
  { title: 'Exporting your church data to CSV',                    category: 'Settings',        href: '/docs#g-export'          },
  { title: 'How to export your personal data (GDPR Article 15)',  category: 'Privacy & Data',  href: '/docs#g-export-personal' },
  { title: 'How to delete your account permanently',              category: 'Privacy & Data',  href: '/docs#g-delete-account'  },
  { title: 'Your data rights, what ChurchFlow stores about you', category: 'Privacy & Data',  href: '/gdpr'                   },
  { title: 'Billing, plans, and how to pay',                       category: 'Billing',         href: '/docs#g-billing'         },
  { title: 'Getting started, your first 15 minutes',              category: 'Getting Started', href: '/docs#intro'              },
]

const CATEGORY_COLORS = {
  'Getting Started': 'bg-purple-50 text-[#8A19FF]',
  'Finance':         'bg-amber-50 text-amber-600',
  'Attendance':      'bg-green-50 text-green-600',
  'Members':         'bg-blue-50 text-blue-600',
  'Events':          'bg-pink-50 text-pink-600',
  'Settings':        'bg-slate-100 text-slate-600',
  'Communications':  'bg-indigo-50 text-indigo-600',
  'Sermons':         'bg-rose-50 text-rose-600',
  'Billing':         'bg-emerald-50 text-emerald-600',
  'Privacy & Data':  'bg-red-50 text-red-600',
}

export default function HelpCentrePage() {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? POPULAR_ARTICLES.filter(a =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.category.toLowerCase().includes(query.toLowerCase())
      )
    : POPULAR_ARTICLES

  return (
    <PublicLayout>
      {/* Hero + Search */}
      <section className="pastel-canvas py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] mb-4">How can we help you?</h1>
          <p className="text-slate-600 text-base mb-8 leading-relaxed">
            Search our help articles or browse by category below.
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for articles, topics, or keywords..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-[#151022] text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 shadow-lg"
            />
          </div>
          {query && (
            <p className="text-slate-600 text-sm mt-3">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{query}"
            </p>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#151022] mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.title}
                  to={cat.href}
                  className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-[#8A19FF] hover:shadow-md transition-all"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#151022] text-sm mb-0.5 group-hover:text-[#8A19FF] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-2">{cat.description}</p>
                    <span className="text-xs text-slate-400">{cat.count} articles</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#8A19FF] transition-colors flex-shrink-0 mt-0.5" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular articles */}
      <section className="py-16 px-4 bg-transparent">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#151022] mb-8">
            {query ? `Search Results` : 'Popular Articles'}
          </h2>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium mb-2">No articles found for "{query}"</p>
              <p className="text-slate-400 text-sm">Try a different keyword or browse the categories above.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((article, idx) => (
                <li key={idx}>
                  <Link
                    to={article.href || '/docs'}
                    className="group flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-[#8A19FF] hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <BookOpen className="w-4 h-4 text-slate-300 group-hover:text-[#8A19FF] flex-shrink-0 transition-colors" />
                      <span className="text-sm font-medium text-[#151022] group-hover:text-[#8A19FF] transition-colors truncate">
                        {article.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`hidden sm:inline px-2.5 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[article.category] || 'bg-slate-100 text-slate-600'}`}>
                        {article.category}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#8A19FF] transition-colors" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Still need help */}
      <section className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-[#151022] mb-2">Still need help?</h2>
            <p className="text-slate-500 text-sm">Our support team is based in Monrovia and ready to assist your church.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="text-center p-7 rounded-2xl border border-slate-200 hover:border-[#8A19FF] hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-[#8A19FF]" />
              </div>
              <h3 className="font-bold text-[#151022] text-sm mb-2">Live Chat</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">Chat with the ChurchFlow Assistant, instant answers about features, pricing, and setup.</p>
              <button
                onClick={() => window.dispatchEvent(new Event('churchflow:open-ai-chat'))}
                className="px-4 py-2 rounded-lg bg-[#8A19FF] text-white text-xs font-semibold hover:bg-[#5B00B8] transition-colors">
                Start Chat
              </button>
            </div>
            <div className="text-center p-7 rounded-2xl border border-slate-200 hover:border-[#8A19FF] hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-[#151022] text-sm mb-2">Email Support</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">Send us an email and we will respond within 24 business hours.</p>
              <Link
                to="/contact"
                className="inline-block px-4 py-2 rounded-lg border border-[#8A19FF] text-[#8A19FF] text-xs font-semibold hover:bg-purple-50 transition-colors"
              >
                Send Email
              </Link>
            </div>
            <div className="text-center p-7 rounded-2xl border border-slate-200 hover:border-[#8A19FF] hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-[#151022] text-sm mb-2">Documentation</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">Explore detailed guides and references in our full docs centre.</p>
              <Link
                to="/docs"
                className="inline-block px-4 py-2 rounded-lg border border-blue-300 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition-colors"
              >
                Read Docs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
