// ============================================================
// ChurchFlow Liberia — Roadmap Page (/roadmap)
// ============================================================
import React from 'react'
import { Link } from 'react-router-dom'
import {
  Loader2, Clock, Lightbulb, CreditCard,
  MessageSquare, QrCode, Smartphone, Globe2,
  DollarSign, Brain, Mic2, Megaphone, ArrowRight, CheckCircle
} from 'lucide-react'
import PublicLayout from './PublicLayout'

const COLUMNS = [
  {
    id: 'in-progress',
    label: 'In Progress',
    icon: Loader2,
    iconClass: 'text-[#7C3AED] animate-spin',
    headerBg: 'bg-purple-50 border-[#7C3AED]/20',
    headerText: 'text-[#7C3AED]',
    dotColor: 'bg-[#7C3AED]',
    items: [
      {
        icon: CreditCard,
        title: 'Orange Money Integration',
        description: 'Accept Orange Money payments directly within ChurchFlow for subscription billing and in-platform offering donations. Working with Orange Liberia on the API integration.',
        eta: 'Q3 2026',
        tags: ['Payments', 'Finance'],
      },
      {
        icon: MessageSquare,
        title: 'WhatsApp Notifications',
        description: 'Send church announcements, event reminders, and birthday greetings directly via WhatsApp. Will use WhatsApp Business API for bulk messaging.',
        eta: 'Q3 2026',
        tags: ['Communications'],
      },
      {
        icon: QrCode,
        title: 'QR Code Attendance (Full)',
        description: 'Complete QR-based check-in system. Members receive a unique QR code that can be scanned at church entrance for instant attendance marking. Print and digital codes supported.',
        eta: 'Q2 2026',
        tags: ['Attendance'],
      },
    ],
  },
  {
    id: 'coming-soon',
    label: 'Coming Soon',
    icon: Clock,
    iconClass: 'text-amber-500',
    headerBg: 'bg-amber-50 border-amber-200',
    headerText: 'text-amber-600',
    dotColor: 'bg-amber-500',
    items: [
      {
        icon: Smartphone,
        title: 'Native Mobile App (iOS and Android)',
        description: 'Dedicated native apps for iPhone and Android with full offline capability, push notifications, and biometric login. Currently in design and planning phase.',
        eta: 'Q4 2026',
        tags: ['Mobile', 'PWA'],
      },
      {
        icon: Globe2,
        title: 'Church Website Builder',
        description: 'A simple drag-and-drop website builder so every church can have a professional public website linked to their ChurchFlow account — with service times, location, and giving links.',
        eta: 'Q4 2026',
        tags: ['Website', 'Marketing'],
      },
      {
        icon: DollarSign,
        title: 'Multi-Currency Giving',
        description: 'Support for giving in multiple currencies simultaneously — LRD, USD, and EUR. Useful for diaspora church members sending offerings from abroad.',
        eta: 'Q1 2027',
        tags: ['Finance', 'Diaspora'],
      },
    ],
  },
  {
    id: 'planned',
    label: 'Planned',
    icon: Lightbulb,
    iconClass: 'text-slate-400',
    headerBg: 'bg-slate-50 border-slate-200',
    headerText: 'text-slate-500',
    dotColor: 'bg-slate-300',
    items: [
      {
        icon: Brain,
        title: 'AI-Powered Ministry Insights',
        description: 'Intelligent recommendations and trend analysis powered by AI. Identify members at risk of disengagement, spot attendance patterns, and receive pastoral care suggestions.',
        eta: 'Q2 2027',
        tags: ['AI', 'Analytics'],
      },
      {
        icon: Mic2,
        title: 'Sermon Transcription',
        description: 'Automatically transcribe sermon audio and video using AI. Make every message searchable and accessible. Support for English and Liberian English dialects planned.',
        eta: 'Q2 2027',
        tags: ['AI', 'Sermons'],
      },
      {
        icon: Megaphone,
        title: 'Giving Campaigns',
        description: 'Create and manage fundraising campaigns — building projects, missions trips, disaster relief. Set goals, track progress, and accept donations online with donor leaderboards.',
        eta: 'Q3 2027',
        tags: ['Finance', 'Campaigns'],
      },
    ],
  },
]

const TAG_COLORS = {
  'Payments':       'bg-purple-50 text-[#7C3AED]',
  'Finance':        'bg-amber-50 text-amber-600',
  'Communications': 'bg-pink-50 text-pink-600',
  'Attendance':     'bg-green-50 text-green-600',
  'Mobile':         'bg-blue-50 text-blue-600',
  'PWA':            'bg-blue-50 text-blue-600',
  'Website':        'bg-cyan-50 text-cyan-600',
  'Marketing':      'bg-teal-50 text-teal-600',
  'Diaspora':       'bg-indigo-50 text-indigo-600',
  'AI':             'bg-violet-50 text-violet-600',
  'Analytics':      'bg-slate-100 text-slate-600',
  'Sermons':        'bg-orange-50 text-orange-600',
  'Campaigns':      'bg-rose-50 text-rose-600',
}

export default function RoadmapPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E1B4B] via-[#312e81] to-[#7C3AED] py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#F59E0B] text-xs font-semibold tracking-widest uppercase mb-6 border border-white/20">
            Product Roadmap
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            What We Are Building Next
          </h1>
          <p className="text-lg text-purple-200 max-w-xl mx-auto leading-relaxed">
            See what is in progress, what is coming soon, and what is on the horizon for ChurchFlow Liberia.
          </p>
        </div>
      </section>

      {/* Legend */}
      <div className="bg-white border-b border-slate-100 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6">
          {[
            { dot: 'bg-[#7C3AED]', label: 'In Progress — actively being built' },
            { dot: 'bg-amber-500', label: 'Coming Soon — designed, planned for release' },
            { dot: 'bg-slate-300', label: 'Planned — on the roadmap, not yet started' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-slate-600">
              <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* 3-column roadmap */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map(col => {
              const ColIcon = col.icon
              return (
                <div key={col.id} className="flex flex-col gap-4">
                  {/* Column header */}
                  <div className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-bold text-sm ${col.headerBg} ${col.headerText}`}>
                    <ColIcon className={`w-4 h-4 ${col.iconClass}`} />
                    {col.label}
                    <span className="ml-auto bg-white/60 px-2 py-0.5 rounded-full text-xs font-bold">
                      {col.items.length}
                    </span>
                  </div>

                  {/* Cards */}
                  {col.items.map(item => {
                    const Icon = item.icon
                    return (
                      <div key={item.title} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${col.headerBg}`}>
                            <Icon className={`w-4 h-4 ${col.headerText}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#1E1B4B] text-sm leading-tight">{item.title}</h3>
                          </div>
                        </div>

                        <p className="text-slate-500 text-xs leading-relaxed mb-4">{item.description}</p>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            {item.tags.map(tag => (
                              <span
                                key={tag}
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TAG_COLORS[tag] || 'bg-slate-100 text-slate-600'}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${col.dotColor}`} />
                            {item.eta}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Suggest a feature */}
      <section className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-semibold mb-5">
            <CheckCircle className="w-3.5 h-3.5" />
            Your feedback shapes the roadmap
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E1B4B] mb-3">Have a feature request?</h2>
          <p className="text-slate-500 mb-7 leading-relaxed">
            ChurchFlow is shaped by the churches that use it. If there is something you need that is not on the roadmap, let us know. Many of our most-used features started as user requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#7C3AED] text-white font-bold text-sm hover:bg-[#6D28D9] transition-colors shadow-sm"
            >
              Submit a Request
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/community"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl border border-[#7C3AED] text-[#7C3AED] font-semibold text-sm hover:bg-purple-50 transition-colors"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
