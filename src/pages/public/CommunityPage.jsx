// ============================================================
// ChurchFlow Liberia, Community Page (/community)
// Waitlist forms save to InsForge community_waitlist table.
// ============================================================
import React, { useState } from 'react'
import {
  Users, MessageCircle, Mail, Calendar, ArrowRight,
  Video, Globe, CheckCircle, Heart, TrendingUp, Mic2, Phone,
} from 'lucide-react'
import PublicLayout from './PublicLayout'
import { insforge } from '../../lib/insforge'

const STATS = [
  { value: '1,800+', label: 'Community Members', icon: Users       },
  { value: '50+',    label: 'Monthly Discussions', icon: MessageCircle },
  { value: '12',     label: 'Webinars Hosted',    icon: Video       },
  { value: '6',      label: 'Countries Reached',  icon: Globe       },
]

const BENEFITS = [
  'Get early access to new ChurchFlow features before public release',
  'Connect directly with the ChurchFlow product team and founders',
  'Share feedback that shapes the product roadmap',
  'Learn from other church administrators across Liberia and West Africa',
  'Access exclusive webinars, guides, and church management templates',
  'Be part of a movement transforming Liberian church administration',
]

const WEBINARS = [
  {
    title: 'Getting the Most Out of ChurchFlow Finance Module',
    date: 'June 5, 2026',
    time: '3:00 PM WAT',
    speaker: 'Morris L. Dorley Jr, Founder',
    description:
      'A live walkthrough of every Finance module feature, recording offerings, generating receipts, building monthly reports, and exporting to Excel. Q&A included.',
    seats: 12,
    icon: Video,
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-[#8A19FF] text-white',
  },
  {
    title: 'Building a Visitor Follow-Up System That Works',
    date: 'June 19, 2026',
    time: '3:00 PM WAT',
    speaker: 'Innova-Liberia Team',
    description:
      'Learn how leading Liberian churches are using ChurchFlow\'s visitor management tools to convert first-time visitors into committed members. Real case studies included.',
    seats: 28,
    icon: Users,
    color: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-500 text-white',
  },
]

// ─── Single channel signup card ───────────────────────────────
function ChannelCard({ icon: Icon, title, description, members, label, color, border, type, placeholder, inputType }) {
  const [value,    setValue]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)
  const [err,      setErr]      = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) { setErr('Please enter a value.'); return }
    setErr('')
    setLoading(true)
    try {
      await insforge.database.rpc('join_community_waitlist', {
        p_type:  type,
        p_value: value.trim(),
      })
      setDone(true)
      setValue('')
    } catch {
      setErr('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const btnColors = {
    email:     'bg-amber-500 hover:bg-amber-600',
    whatsapp:  'bg-green-600 hover:bg-green-700',
    facebook:  'bg-blue-600 hover:bg-blue-700',
  }

  return (
    <div className={`bg-white rounded-2xl border ${border} p-7 flex flex-col shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-[#151022] text-base mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">{description}</p>

      <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
        <Users className="w-3 h-3" />
        {members}
      </div>

      {done ? (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {type === 'email'    && 'You are subscribed! Welcome to the newsletter.'}
          {type === 'whatsapp' && 'Request received! We will add you shortly.'}
          {type === 'facebook' && 'Request received! Check your Facebook for an invite.'}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type={inputType}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
          />
          {err && <p className="text-xs text-red-500">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-60 ${btnColors[type]}`}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <>
                {label}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}

export default function CommunityPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pastel-canvas py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full glass-card text-purple-700 text-xs font-semibold tracking-widest uppercase mb-6 border border-white/70">
            Community
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] leading-tight mb-5">
            Join the ChurchFlow Community
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Connect with hundreds of church administrators, pastors, and ministry leaders across Liberia. Share knowledge, learn best practices, and grow together.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {STATS.map(stat => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="flex items-center gap-2 px-5 py-2.5 bg-white/60 rounded-xl border border-white/70">
                  <Icon className="w-4 h-4 text-[#5B00B8]" />
                  <span className="text-[#111827] font-bold text-sm">{stat.value}</span>
                  <span className="text-slate-600 text-sm">{stat.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Community channels, waitlist forms */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#151022] mb-3">Where We Connect</h2>
            <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
              Sign up for your preferred community channel below. All spaces are free and moderated by the ChurchFlow team.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Email Newsletter */}
            <ChannelCard
              icon={Mail}
              title="Email Newsletter"
              description="Monthly digest of product updates, new blog posts, ministry management tips, and upcoming ChurchFlow events. No spam."
              members="1,200+ subscribers"
              label="Subscribe"
              color="bg-amber-100 text-amber-600"
              border="border-amber-200"
              type="email"
              inputType="email"
              placeholder="your@email.com"
            />

            {/* WhatsApp Group */}
            <ChannelCard
              icon={Phone}
              title="WhatsApp Group"
              description="Real-time announcements, feature updates, and quick Q&A with the ChurchFlow team and fellow users. Perfect for staying in the loop."
              members="300+ members"
              label="Join WhatsApp"
              color="bg-green-100 text-green-600"
              border="border-green-200"
              type="whatsapp"
              inputType="tel"
              placeholder="+231 XX XXX XXXX"
            />

            {/* Facebook Group */}
            <ChannelCard
              icon={Globe}
              title="Facebook Community Group"
              description="Join 500+ church administrators and pastors discussing best practices, sharing tips, and asking questions. A supportive space for everyone."
              members="500+ members"
              label="Join Group"
              color="bg-blue-100 text-blue-600"
              border="border-blue-200"
              type="facebook"
              inputType="text"
              placeholder="Your Facebook name"
            />

          </div>
        </div>
      </section>

      {/* Why join */}
      <section className="py-16 px-4 bg-transparent border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="w-full lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-[#8A19FF] rounded-lg text-xs font-semibold mb-5">
                <Heart className="w-3.5 h-3.5" />
                Community Benefits
              </div>
              <h2 className="text-2xl font-extrabold text-[#151022] mb-5">Why join the community?</h2>
              <ul className="space-y-3">
                {BENEFITS.map(b => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-[#8A19FF] flex-shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#151022] to-[#8A19FF] rounded-2xl p-8 text-white">
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
              <h2 className="text-2xl font-extrabold text-[#151022] mb-1">Upcoming Webinars</h2>
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
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${webinar.badge}`}>Free</span>
                  </div>
                  <h3 className="font-bold text-[#151022] text-sm leading-tight mb-2">{webinar.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4">{webinar.description}</p>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#151022]">{webinar.speaker}</p>
                      <p className="text-xs text-slate-400">{webinar.seats} seats remaining</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-[#8A19FF] text-white text-xs font-bold hover:bg-[#5B00B8] transition-colors">
                      Register
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 pastel-canvas">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-[#111827] mb-3">Ready to get started?</h2>
          <p className="text-purple-700 text-sm leading-relaxed mb-8">
            Sign up above to join your preferred community channel, email newsletter, WhatsApp, or Facebook, and become part of Liberia's growing church management community.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#F59E0B] text-[#151022] font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg"
          >
            Register Your Church Free
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </PublicLayout>
  )
}
