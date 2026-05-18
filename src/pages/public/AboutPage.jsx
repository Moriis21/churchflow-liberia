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
    color: 'bg-purple-100 text-[#7C3AED]',
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
    name: 'Samuel Kwame',
    role: 'Co-Founder and CEO',
    bio: 'Former church administrator and software engineer with 8 years of experience building ministry tools across West Africa.',
    initials: 'SK',
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    name: 'Grace Kollie',
    role: 'Co-Founder and Head of Product',
    bio: 'Product designer and former youth pastor who spent 5 years serving in Monrovia churches before co-founding ChurchFlow.',
    initials: 'GK',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    name: 'Emmanuel Gbaye',
    role: 'Head of Engineering',
    bio: 'Full-stack engineer passionate about building robust, offline-capable software for emerging markets and local communities.',
    initials: 'EG',
    gradient: 'from-blue-500 to-cyan-600',
  },
]

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E1B4B] via-[#312e81] to-[#7C3AED] py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#F59E0B] text-xs font-semibold tracking-widest uppercase mb-6 border border-white/20">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            Built for Liberia.<br />Designed for Churches.
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto leading-relaxed">
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
                <div className="text-3xl font-black text-[#7C3AED] mb-1">{stat.value}</div>
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 text-[#7C3AED] text-xs font-semibold mb-5">
                <Heart className="w-3.5 h-3.5" />
                Our Mission
              </div>
              <h2 className="text-3xl font-extrabold text-[#1E1B4B] mb-5 leading-tight">
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
              <blockquote className="text-lg text-[#1E1B4B] font-semibold leading-relaxed italic mb-6">
                "ChurchFlow exists to help Liberian churches stop losing members, records, and ministry opportunities through modern, affordable technology."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                  SK
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1E1B4B]">Samuel Kwame</p>
                  <p className="text-xs text-slate-500">Co-Founder and CEO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-semibold mb-5">
            <MapPin className="w-3.5 h-3.5" />
            Founded in Monrovia, Liberia
          </div>
          <h2 className="text-3xl font-extrabold text-[#1E1B4B] mb-8 leading-tight">The ChurchFlow Story</h2>

          <div className="space-y-6 text-slate-600 leading-relaxed">
            <p>
              Founded in 2026 in Monrovia, Liberia, ChurchFlow was born out of a need witnessed firsthand in local churches. Our founders — a software engineer and a former youth pastor — spent years watching Liberian congregations struggle with paper attendance sheets, lost member records, and manual offering tracking that made it nearly impossible to understand where the ministry stood financially or pastorally.
            </p>
            <p>
              After conversations with over 50 pastors and church administrators across Montserrado County, a common picture emerged: churches were growing, but their administrative systems were not keeping up. Members were falling through the cracks. Offerings were unaccounted for. Visitors never heard from the church again after their first Sunday.
            </p>
            <p>
              ChurchFlow was the answer to this problem — a dedicated, affordable, locally-tailored church management system that works on the mobile networks Liberians actually use, priced in a currency Liberian churches actually earn, and designed to be simple enough for any church secretary to learn on day one.
            </p>
            <p>
              Today, ChurchFlow serves hundreds of churches across Liberia, from small neighbourhood congregations to multi-branch ministries. We are proud to be a Liberian-built product serving the Liberian church.
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <p className="font-semibold text-[#1E1B4B] text-sm">Founded 2026</p>
                <p className="text-xs text-slate-500">Monrovia, Liberia</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-[#1E1B4B] text-sm">500+ Churches</p>
                <p className="text-xs text-slate-500">Across Liberia</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-[#1E1B4B] text-sm">99.9% Uptime</p>
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
            <h2 className="text-3xl font-extrabold text-[#1E1B4B] mb-3">Our Core Values</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              These values guide every product decision, every customer interaction, and every line of code we write.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map(v => {
              const Icon = v.icon
              return (
                <div key={v.title} className="bg-slate-50 rounded-2xl p-7 border border-slate-100">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${v.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E1B4B] mb-2">{v.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{v.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-[#1E1B4B] mb-3">The Team Behind ChurchFlow</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Built by people who love the church and technology — with deep roots in Liberian ministry.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {TEAM.map(member => (
              <div key={member.name} className="bg-white rounded-2xl p-7 border border-slate-200 text-center shadow-sm">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-black text-lg mx-auto mb-4 shadow`}>
                  {member.initials}
                </div>
                <h3 className="font-bold text-[#1E1B4B] text-base mb-0.5">{member.name}</h3>
                <p className="text-[#7C3AED] font-semibold text-xs mb-3">{member.role}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1E1B4B] py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-4">Join the ChurchFlow family</h2>
          <p className="text-purple-300 mb-8 leading-relaxed">
            Hundreds of Liberian churches have already made the switch. Your ministry is next.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#F59E0B] text-[#1E1B4B] font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
