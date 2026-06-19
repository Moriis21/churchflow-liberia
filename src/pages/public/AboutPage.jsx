// ============================================================
// ChurchFlow Liberia — About Page (/about)
// ============================================================
import React from 'react'
import { Link } from 'react-router-dom'
import {
  Cross, Heart, Users, Shield, Lightbulb,
  MapPin, ArrowRight, Building2, TrendingUp, Clock
} from 'lucide-react'
import PublicLayout from './PublicLayout'

const STATS = [
  { value: '500+',   label: 'Churches Served'  },
  { value: '25,000+', label: 'Members Tracked'  },
  { value: '99.9%',  label: 'Platform Uptime'   },
  { value: 'Liberia', label: 'Home Country'     },
]

const VALUES = [
  {
    icon: Cross,
    title: 'Faith-Driven',
    description:
      'Every decision we make is guided by a genuine commitment to the church and its mission. We build tools that honour the sacred work of ministry.',
    color: 'bg-purple-100 text-[#8A19FF]',
  },
  {
    icon: Users,
    title: 'Community-First',
    description:
      'ChurchFlow was built by listening to pastors, administrators, and members across Liberia. The community shapes the product.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Lightbulb,
    title: 'Simplicity',
    description:
      'We believe technology should reduce complexity, not add to it. Every feature is designed to be intuitive for first-time users.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Shield,
    title: 'Trust and Security',
    description:
      'Church data is sacred. We apply bank-grade encryption and strict access controls to protect every record in your system.',
    color: 'bg-green-100 text-green-600',
  },
]

const TEAM = [
  {
    name: 'Darius Paye',
    role: 'CEO & Founder, Innova-Liberia',
    bio: 'As the CEO and Founder of Innova-Liberia, Darius provides the strategic vision that drives the agency. With a strong background in business and technology, he is dedicated to empowering local businesses through digital transformation, bridging the gap between traditional commerce and the digital future in Monrovia.',
    photo: '/darius-paye.jpg',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    name: 'Emmett T. Chesson',
    role: 'Co-CEO, Innova-Liberia',
    bio: 'Emmett serves as Co-CEO of Innova-Liberia, bringing strong leadership and a passion for community development. He works alongside Darius to shape the strategic direction of the company, championing tech-driven solutions that create lasting impact across Liberia.',
    photo: '/emmett-chesson.jpg',
    gradient: 'from-teal-400 to-emerald-500',
  },
  {
    name: 'Morris L. Dorley Jr',
    role: 'Lead Developer',
    bio: 'Morris leads our software engineering team with a focus on code quality and innovation. A skilled full-stack developer with a passion for excellence, he oversees the technical architecture of our projects, ensuring robust, scalable solutions for the West African market.',
    photo: '/morris-dorley.jpg',
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    name: 'John Kpadeh',
    role: 'UI/UX Designer & System Administrator',
    bio: 'John crafts intuitive interfaces that delight users in Liberia. Simultaneously, as our System Administrator, he ensures our infrastructure remains secure, optimized, and operational 24/7 across the digital ecosystem.',
    photo: '/john-kpadeh.jpg',
    gradient: 'from-blue-500 to-cyan-600',
  },
]

// ─── Team card — real photo with initials fallback ───────────
function TeamCard({ member }) {
  const [imgErr, setImgErr] = React.useState(false)
  const initials = member.name
    .split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="bg-white rounded-2xl p-7 border border-slate-200 text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-20 h-20 mx-auto mb-4">
        {!imgErr && member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            onError={() => setImgErr(true)}
            className="w-20 h-20 rounded-full object-cover shadow ring-2 ring-slate-100"
          />
        ) : (
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-black text-xl shadow ring-2 ring-slate-100`}>
            {initials}
          </div>
        )}
      </div>
      <h3 className="font-bold text-[#151022] text-base mb-0.5">{member.name}</h3>
      <p className="text-[#8A19FF] font-semibold text-xs mb-3">{member.role}</p>
      <p className="text-slate-500 text-sm leading-relaxed">{member.bio}</p>
    </div>
  )
}

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pastel-canvas py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full glass-card text-purple-700 text-xs font-semibold tracking-widest uppercase mb-6 border border-white/70">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] leading-tight mb-5">
            Built for Liberia.<br />Designed for Churches.
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            ChurchFlow exists to help Liberian churches stop losing members, records, and ministry opportunities through modern, affordable technology.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STATS.map(stat => (
              <div key={stat.label}>
                <div className="text-3xl font-black text-[#8A19FF] mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 text-[#8A19FF] text-xs font-semibold mb-5">
                <Heart className="w-3.5 h-3.5" />
                Our Mission
              </div>
              <h2 className="text-3xl font-extrabold text-[#151022] mb-5 leading-tight">
                Technology that serves the church
              </h2>
              <p className="text-slate-600 leading-relaxed mb-5">
                ChurchFlow exists to help Liberian churches stop losing members, records, and ministry opportunities through modern, affordable technology. We believe that every church — no matter its size or budget — deserves a professional management system.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Too many Liberian churches still rely on paper ledgers, handwritten attendance sheets, and inconsistent member records. We are changing that by providing a platform purpose-built for the Liberian church context — local currencies, local networks, local needs.
              </p>
            </div>
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 border border-purple-100">
              <blockquote className="text-lg text-[#151022] font-semibold leading-relaxed italic mb-6">
                "ChurchFlow exists to help Liberian churches stop losing members, records, and ministry opportunities through modern, affordable technology."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-100 flex-shrink-0">
                  <img
                    src="/darius-paye.jpg"
                    alt="Darius Paye"
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display='none' }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#151022]">Darius Paye</p>
                  <p className="text-xs text-slate-500">CEO & Founder, Innova-Liberia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 bg-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-semibold mb-5">
            <MapPin className="w-3.5 h-3.5" />
            Founded in Brewerville City, Montserrado County, Liberia
          </div>
          <h2 className="text-3xl font-extrabold text-[#151022] mb-8 leading-tight">The ChurchFlow Story</h2>

          <div className="space-y-6 text-slate-600 leading-relaxed">
            <p>
              ChurchFlow is an associate platform built by the <a href="https://www.innova-lib.com" target="_blank" rel="noopener noreferrer" className="text-[#8A19FF] font-semibold hover:underline">Innova-Liberia team</a> — Liberia's leading creative tech agency. Founded in 2026 in Brewerville City, Liberia, ChurchFlow was born out of a need witnessed firsthand in local churches.
            </p>
            <p>
              Darius Paye, CEO & Founder of Innova-Liberia, and lead developer Morris L. Dorley Jr spent years watching Liberian congregations struggle with paper attendance sheets, lost member records, and manual offering tracking that made it nearly impossible to understand where the ministry stood financially or pastorally.
            </p>
            <p>
              After conversations with pastors and church administrators across Montserrado County, a common picture emerged: churches were growing, but their administrative systems were not keeping up. Members were falling through the cracks. Offerings were unaccounted for. Visitors never heard from the church again after their first Sunday.
            </p>
            <p>
              ChurchFlow was the answer — a dedicated, affordable, locally-tailored church management system that works on the mobile networks Liberians actually use, priced in a currency Liberian churches actually earn, and designed to be simple enough for any church secretary to learn on day one.
            </p>
          </div>

          {/* Innova-Liberia badge */}
          <div className="mt-8 p-5 bg-gradient-to-r from-[#151022] to-[#8A19FF] rounded-2xl text-white flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow">
              <img
                src="/innova-logo.png"
                alt="Innova-Liberia"
                className="w-full h-full object-contain"
                onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex' }}
              />
              <span className="font-black text-xl text-[#151022] hidden items-center justify-center w-full h-full">IL</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base">Innova-Liberia</p>
              <p className="text-purple-200 text-xs mt-0.5">Leading Creative Tech Agency in Liberia &amp; West Africa</p>
              <a
                href="https://www.innova-lib.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-[#F59E0B] text-xs font-semibold hover:underline"
              >
                Visit innova-lib.com →
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#8A19FF]" />
              </div>
              <div>
                <p className="font-semibold text-[#151022] text-sm">Founded 2026</p>
                <p className="text-xs text-slate-500">Brewerville City, Liberia</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-[#151022] text-sm">500+ Churches</p>
                <p className="text-xs text-slate-500">Across Liberia</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-[#151022] text-sm">99.9% Uptime</p>
                <p className="text-xs text-slate-500">Reliable and fast</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-[#151022] mb-3">Our Core Values</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              These values guide every product decision, every customer interaction, and every line of code we write.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map(v => {
              const Icon = v.icon
              return (
                <div key={v.title} className="bg-transparent rounded-2xl p-7 border border-slate-100">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${v.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#151022] mb-2">{v.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{v.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 bg-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-[#151022] mb-3">The Team Behind ChurchFlow</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Built by the Innova-Liberia team — people who love the church and technology, with deep roots in Liberian ministry.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM.map(member => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pastel-canvas py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#111827] mb-4">Join the ChurchFlow family</h2>
          <p className="text-purple-700 mb-8 leading-relaxed">
            Hundreds of Liberian churches have already made the switch. Your ministry is next.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#F59E0B] text-[#151022] font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl border border-slate-300 text-[#111827] font-semibold text-sm hover:bg-white/60 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
