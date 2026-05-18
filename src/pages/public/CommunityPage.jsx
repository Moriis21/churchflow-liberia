// ============================================================
// ChurchFlow Liberia — Community Page (/community)
// ============================================================
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, MessageCircle, Mail, Calendar, ArrowRight,
  Video, Globe, CheckCircle, Heart, TrendingUp, Mic2
} from 'lucide-react'
import PublicLayout from './PublicLayout'

const CHANNELS = [
  {
    icon: Globe,
    title: 'Facebook Community Group',
    description:
      'Join 500+ church administrators and pastors discussing best practices, sharing tips, and asking questions. A supportive space for everyone using ChurchFlow.',
    members: '500+ members',
    label: 'Join Group',
    color: 'bg-blue-100 text-blue-600',
    border: 'border-blue-200',
    href: '#',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Group',
    description:
      'Real-time announcements, feature updates, and quick Q&A with the ChurchFlow team and fellow users. Perfect for staying in the loop while on the move.',
    members: '300+ members',
    label: 'Join WhatsApp',
    color: 'bg-green-100 text-green-600',
    border: 'border-green-200',
    href: '#',
  },
  {
    icon: Mail,
    title: 'Email Newsletter',
    description:
      'Monthly digest of product updates, new blog posts, ministry management tips, and upcoming ChurchFlow events. Delivered to your inbox, no spam.',
    members: '1,200+ subscribers',
    label: 'Subscribe',
    color: 'bg-amber-100 text-amber-600',
    border: 'border-amber-200',
    href: '#',
  },
]

const WEBINARS = [
  {
    title: 'Getting the Most Out of ChurchFlow Finance Module',
    date: 'June 5, 2026',
    time: '3:00 PM WAT',
    speaker: 'Samuel Kwame, CEO',
    description:
      'A live walkthrough of every Finance module feature — recording offerings, generating receipts, building monthly reports, and exporting to Excel. Q&A included.',
    seats: 12,
    icon: Video,
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-[#7C3AED] text-white',
  },
  {
    title: 'Building a Visitor Follow-Up System That Works',
    date: 'June 19, 2026',
    time: '3:00 PM WAT',
    speaker: 'Grace Kollie, Head of Product',
    description:
      'Learn how leading Liberian churches are using ChurchFlow\'s visitor management tools to convert first-time visitors into committed members. Real case studies included.',
    seats: 28,
    icon: Users,
    color: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-500 text-white',
  },
]

const STATS = [
  { value: '1,800+', label: 'Community Members', icon: Users      },
  { value: '50+',    label: 'Monthly Discussions', icon: MessageCircle },
  { value: '12',     label: 'Webinars Hosted',    icon: Video      },
  { value: '6',      label: 'Countries Reached',  icon: Globe      },
]

const BENEFITS = [
  'Get early access to new ChurchFlow features before public release',
  'Connect directly with the ChurchFlow product team and founders',
  'Share feedback that shapes the product roadmap',
  'Learn from other church administrators across Liberia and West Africa',
  'Access exclusive webinars, guides, and church management templates',
  'Be part of a movement transforming Liberian church administration',
]

export default function CommunityPage() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  async function handleSubscribe(e) {
    e.preventDefault()
    if (!email.trim()) return
    await new Promise(res => setTimeout(res, 600))
    setSubscribed(true)
    setEmail('')
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E1B4B] via-[#312e81] to-[#7C3AED] py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#F59E0B] text-xs font-semibold tracking-widest uppercase mb-6 border border-white/20">
            Community
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            Join the ChurchFlow Community
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto leading-relaxed mb-8">
            Connect with hundreds of church administrators, pastors, and ministry leaders across Liberia. Share knowledge, learn best practices, and grow together.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {STATS.map(stat => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 rounded-xl border border-white/20">
                  <Icon className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-white font-bold text-sm">{stat.value}</span>
                  <span className="text-purple-200 text-sm">{stat.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Community channels */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1E1B4B] mb-3">Where We Connect</h2>
            <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
              Choose the channel that works best for you. All community spaces are free and moderated by the ChurchFlow team.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CHANNELS.map(channel => {
              const Icon = channel.icon
              return (
                <div key={channel.title} className={`bg-white rounded-2xl border ${channel.border} p-7 flex flex-col shadow-sm hover:shadow-md transition-shadow`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${channel.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#1E1B4B] text-base mb-2">{channel.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-1">{channel.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {channel.members}
                    </span>
                    <a
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] transition-colors"
                    >
                      {channel.label}
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why join */}
      <section className="py-16 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="w-full lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-[#7C3AED] rounded-lg text-xs font-semibold mb-5">
                <Heart className="w-3.5 h-3.5" />
                Community Benefits
              </div>
              <h2 className="text-2xl font-extrabold text-[#1E1B4B] mb-5">Why join the community?</h2>
              <ul className="space-y-3">
                {BENEFITS.map(b => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-[#7C3AED] flex-shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#1E1B4B] to-[#7C3AED] rounded-2xl p-8 text-white">
              <TrendingUp className="w-8 h-8 text-[#F59E0B] mb-4" />
              <h3 className="text-xl font-bold mb-3">Growing Together</h3>
              <p className="text-purple-200 text-sm leading-relaxed mb-6">
                The best church management insights come from the churches themselves. When you join the ChurchFlow community, you are joining a conversation that shapes the future of ministry administration in Liberia.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { value: '500+', label: 'Churches' },
                  { value: '6',    label: 'Countries' },
                  { value: '2026', label: 'Founded'   },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-2xl font-black text-[#F59E0B]">{s.value}</div>
                    <div className="text-purple-300 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming webinars */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-[#1E1B4B] mb-1">Upcoming Webinars</h2>
              <p className="text-slate-400 text-sm">Free, live sessions for all ChurchFlow users and community members.</p>
            </div>
            <Mic2 className="w-6 h-6 text-slate-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WEBINARS.map(webinar => {
              const Icon = webinar.icon
              return (
                <div key={webinar.title} className={`rounded-2xl border p-6 ${webinar.color}`}>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {webinar.date} at {webinar.time}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${webinar.badge}`}>
                      Free
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1E1B4B] text-sm leading-tight mb-2">{webinar.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4">{webinar.description}</p>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#1E1B4B]">{webinar.speaker}</p>
                      <p className="text-xs text-slate-400">{webinar.seats} seats remaining</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] transition-colors">
                      Register
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="py-16 px-4 bg-[#1E1B4B]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">Subscribe to ChurchFlow Insights</h2>
          <p className="text-purple-300 text-sm leading-relaxed mb-8">
            Monthly newsletter with product updates, ministry tips, and community highlights. No spam, unsubscribe at any time.
          </p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 p-4 bg-green-900/30 rounded-xl border border-green-500/30 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">You are subscribed. Welcome to the community!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#F59E0B] text-[#1E1B4B] font-bold text-sm hover:bg-amber-400 transition-colors flex-shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
