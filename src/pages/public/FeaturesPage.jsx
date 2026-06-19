// ============================================================
// ChurchFlow Liberia — Features Page (/features)
// ============================================================
import React from 'react'
import { Link } from 'react-router-dom'
import {
  Users, CalendarCheck, DollarSign, CalendarDays,
  MessageSquare, Tv2, UserPlus, Heart,
  LayoutGrid, BarChart2, GitBranch, Smartphone,
  CheckCircle, ArrowRight, Shield, Zap, Globe, FileText
} from 'lucide-react'
import PublicLayout from './PublicLayout'

const FEATURES = [
  {
    icon: Users,
    title: 'Member Management',
    subtitle: 'Complete member profiles at your fingertips',
    description:
      'Maintain rich, searchable member records including personal details, family relationships, baptism status, joining date, department affiliation, and contact history. Quickly filter by department, status, or attendance pattern. Export lists as PDF or Excel at any time.',
    highlights: [
      'Full member profiles with photo upload',
      'Family tree and relationship linking',
      'Baptism, confirmation, and membership status',
      'Department and role assignment',
      'Search and filter by any field',
      'Bulk import via CSV',
    ],
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: CalendarCheck,
    title: 'Attendance Tracking',
    subtitle: 'Know who is present every service',
    description:
      'Record attendance for every service type — Sunday services, mid-week Bible study, youth programs, special events, and more. Generate QR codes for instant check-in, or use manual roll-call. View trends, identify absentees, and automate follow-up messages for members missing multiple sessions.',
    highlights: [
      'QR code self-check-in for members',
      'Manual attendance capture by department',
      'Multiple service types supported',
      'Automatic absentee flagging',
      'Monthly and yearly trend charts',
      'Export attendance reports',
    ],
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: DollarSign,
    title: 'Finance & Offerings',
    subtitle: 'Transparent, organised church finances',
    description:
      'Record all incoming offerings — tithes, building fund, special offerings, missions giving, and more. Support both Liberian Dollar (LRD) and US Dollar (USD). Automatically generate receipt numbers, track envelopes, and produce monthly finance summaries for church leadership.',
    highlights: [
      'Tithe and offering categories',
      'LRD and USD dual-currency support',
      'Automatic receipt generation',
      'Monthly and annual reports',
      'Building fund tracker',
      'Finance dashboard for leadership',
    ],
    color: 'from-amber-400 to-yellow-500',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: CalendarDays,
    title: 'Events Management',
    subtitle: 'Plan and manage every ministry event',
    description:
      'Create and manage crusades, conferences, youth programs, choir rehearsals, outreach events, and more. Set RSVP limits, send automated reminder SMS, track registrations, and capture post-event attendance. Full calendar view with recurring event support.',
    highlights: [
      'Unlimited event types and categories',
      'RSVP and registration tracking',
      'Automated SMS reminders',
      'Calendar and list views',
      'Event attendance capture',
      'Recurring event support',
    ],
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: MessageSquare,
    title: 'SMS & Notifications',
    subtitle: 'Reach your congregation instantly',
    description:
      'Send bulk SMS to all members or targeted groups. Automate birthday greetings, anniversary reminders, event notifications, and pastoral messages. Works with local Liberian networks. Orange Money and MTN MoMo payment notifications coming soon.',
    highlights: [
      'Bulk SMS to all members or groups',
      'Automated birthday and anniversary SMS',
      'Event reminder notifications',
      'Department-targeted messaging',
      'SMS delivery tracking',
      'Orange Money / MTN MoMo (coming soon)',
    ],
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
  {
    icon: Tv2,
    title: 'Live Streaming & Sermons',
    subtitle: 'Connect with members beyond the sanctuary',
    description:
      'Link your YouTube, Facebook Live, or Zoom stream directly in ChurchFlow so members can join from the app. Archive past sermons with titles, series, scripture references, and speaker notes. Members can search, replay, and share sermon recordings.',
    highlights: [
      'YouTube, Facebook, and Zoom integration',
      'Live service announcements',
      'Sermon archive with full metadata',
      'Series and topic organisation',
      'Scripture reference tagging',
      'Member sermon bookmarking',
    ],
    color: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    icon: UserPlus,
    title: 'Visitor Follow-Up',
    subtitle: 'Never lose a first-time visitor again',
    description:
      'Capture visitor information on the day, assign follow-up tasks to care team members, send a welcome SMS, and track the journey from first visit to full membership. Automated follow-up reminders ensure no visitor is forgotten.',
    highlights: [
      'Visitor registration form (physical & digital)',
      'Automatic welcome SMS',
      'Follow-up task assignment',
      'Visit frequency tracking',
      'Convert visitor to member in one click',
      'Follow-up status pipeline',
    ],
    color: 'from-teal-500 to-green-600',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: Heart,
    title: 'Prayer Requests',
    subtitle: 'A dedicated space for intercession',
    description:
      'Members can submit prayer requests publicly, privately, or direct to their pastor only. The prayer team sees requests assigned to them. Celebrate answered prayers by converting requests to testimonies. Leadership can see all requests from a unified dashboard.',
    highlights: [
      'Public, private, and pastor-only requests',
      'Prayer team assignment',
      'Testimony and answered prayer section',
      'Member prayer history',
      'Pastor-only request privacy',
      'Email notification to assigned team',
    ],
    color: 'from-red-400 to-rose-500',
    bg: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  {
    icon: LayoutGrid,
    title: 'Department Management',
    subtitle: 'Organise every arm of your ministry',
    description:
      'Create and manage all church departments — Choir, Ushers, Youth, Women, Men, Children, Missions, Evangelism, and Media. Assign department leaders, track department-level attendance, and run department-specific reports.',
    highlights: [
      '9 default department templates',
      'Custom department creation',
      'Department leader assignment',
      'Department attendance tracking',
      'Member department history',
      'Department performance reports',
    ],
    color: 'from-orange-400 to-amber-500',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    icon: BarChart2,
    title: 'Reports & Analytics',
    subtitle: 'Data-driven decisions for ministry leaders',
    description:
      'Access comprehensive reports for membership growth, attendance trends, financial summaries, visitor conversion rates, and department performance. Export any report as PDF or Excel. Interactive charts and graphs make data easy to understand at a glance.',
    highlights: [
      'Membership growth trends',
      'Attendance pattern analytics',
      'Financial income reports',
      'Visitor conversion funnel',
      'Department performance dashboards',
      'PDF and Excel export',
    ],
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    icon: GitBranch,
    title: 'Multi-Branch Support',
    subtitle: 'Manage all your branches from one login',
    description:
      'Oversee every branch of your ministry from a single dashboard. Compare membership numbers, attendance rates, and finance figures across branches. Each branch maintains its own data while head leadership sees the complete picture.',
    highlights: [
      'Unlimited branch creation',
      'Per-branch dashboards',
      'Cross-branch attendance comparison',
      'Consolidated finance reports',
      'Branch-level admin permissions',
      'Head church unified view',
    ],
    color: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    icon: Smartphone,
    title: 'PWA Mobile App',
    subtitle: 'Works like a native app on any device',
    description:
      'ChurchFlow is a Progressive Web App — install it directly from your browser on Android, iPhone, or tablet. No app store needed. Works offline for attendance and member lookup. Fast, lightweight, and optimised for slower mobile networks common in Liberia.',
    highlights: [
      'Installable on Android and iPhone',
      'No app store download required',
      'Offline member lookup and attendance',
      'Fast on 3G and 4G networks',
      'Push notifications support',
      'Tablet and desktop optimised',
    ],
    color: 'from-lime-500 to-green-600',
    bg: 'bg-lime-50',
    iconColor: 'text-lime-600',
  },
]

const TRUST_ITEMS = [
  { icon: Shield,   label: 'Bank-grade security' },
  { icon: Zap,      label: '99.9% uptime SLA'    },
  { icon: Globe,    label: 'Works across Liberia' },
  { icon: FileText, label: 'Free data export'     },
]

export default function FeaturesPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pastel-canvas py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full glass-card text-purple-700 text-xs font-semibold tracking-widest uppercase mb-6 border border-white/70">
            Full Feature Overview
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] leading-tight mb-5">
            Everything Your Ministry Needs
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            ChurchFlow brings together 12 powerful modules designed specifically for Liberian churches — from attendance tracking to financial reporting, all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#F59E0B] text-[#151022] font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-slate-300 text-[#111827] font-semibold text-sm hover:bg-white/60 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b border-slate-100 py-5">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-8">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-slate-600">
              <Icon className="w-4 h-4 text-[#8A19FF]" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-[#151022] mb-3">All 12 Modules, Fully Included</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Every feature listed below is available on the Growth and Ministry Pro plans. Starter plan includes core modules.</p>
          </div>

          <div className="space-y-16">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              const isReversed = index % 2 !== 0
              return (
                <div
                  key={feature.title}
                  className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 items-center`}
                >
                  {/* Visual card */}
                  <div className={`w-full lg:w-1/2 rounded-2xl p-8 ${feature.bg} border border-white shadow-sm`}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-md`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#151022] mb-2">{feature.title}</h3>
                    <p className="text-[#8A19FF] font-semibold text-sm mb-4">{feature.subtitle}</p>
                    <p className="text-slate-600 leading-relaxed mb-6">{feature.description}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {feature.highlights.map(h => (
                        <li key={h} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${feature.iconColor}`} />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Number badge */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-center gap-4 px-2 lg:px-8">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center text-white font-black text-lg shadow`}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-3xl font-extrabold text-[#151022] leading-tight">{feature.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-base">{feature.description}</p>
                    <Link
                      to="/register"
                      className={`inline-flex items-center gap-2 text-sm font-semibold ${feature.iconColor} hover:underline`}
                    >
                      Try this feature free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pastel-canvas py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#111827] mb-4">Ready to transform your church administration?</h2>
          <p className="text-purple-700 mb-8 leading-relaxed">
            Start your 14-day free trial today. No credit card required. Cancel anytime.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#F59E0B] text-[#151022] font-bold text-base hover:bg-amber-400 transition-colors shadow-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
