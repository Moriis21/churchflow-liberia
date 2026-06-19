// ============================================================
// ChurchFlow Liberia — Changelog Page (/changelog)
// ============================================================
import React from 'react'
import { Link } from 'react-router-dom'
import {
  Tag, CheckCircle, Rocket, Wrench, Zap, ArrowRight
} from 'lucide-react'
import PublicLayout from './PublicLayout'

const RELEASES = [
  {
    version: 'v1.0.0',
    date: 'May 2026',
    type: 'major',
    label: 'Initial Launch',
    badge: 'Latest',
    summary: 'The first stable public release of ChurchFlow Liberia. Built for production use by Liberian churches of every size.',
    sections: [
      {
        heading: 'New Features',
        icon: Rocket,
        color: 'text-green-600',
        items: [
          'Full member management module with profiles, departments, and family linking',
          'Attendance tracking for Sunday services, mid-week Bible study, youth, and custom service types',
          'Finance and offerings module with LRD and USD support and automatic receipt generation',
          'Events management with RSVP, registration tracking, and automated SMS reminders',
          'Progressive Web App (PWA) — installable on Android and iPhone without an app store',
          'Church profile setup wizard for first-time onboarding',
          'Role-based access control for admin, pastor, and staff roles',
          'Multi-branch architecture — manage multiple campus branches from one account',
          'Reports dashboard with PDF and Excel export',
          'Visitor follow-up pipeline with automated welcome SMS',
          'Prayer requests module with public, private, and pastor-only visibility levels',
          'Department management for all 9 ministry departments',
          'Sermon archive with YouTube, Facebook, and Zoom integration',
        ],
      },
      {
        heading: 'Infrastructure',
        icon: Wrench,
        color: 'text-blue-600',
        items: [
          'End-to-end TLS 1.3 encryption for all data in transit',
          'AES-256 encryption at rest for all stored church data',
          'Automatic daily backups with 30-day retention',
          '99.9% uptime SLA with active monitoring',
          'Optimised for 3G and 4G mobile networks across Liberia',
        ],
      },
    ],
  },
  {
    version: 'v0.9.0',
    date: 'April 2026',
    type: 'minor',
    label: 'Beta Release',
    badge: null,
    summary: 'Closed beta release for partner churches. Introduced prayer requests, department management, and reporting.',
    sections: [
      {
        heading: 'New Features',
        icon: Rocket,
        color: 'text-green-600',
        items: [
          'Prayer requests module launched — submit, assign, and mark as answered',
          'Department management module with per-department attendance',
          'Reports and analytics dashboard with 6 chart types',
          'Member profile photo upload capability',
          'CSV bulk member import feature',
          'Attendance trend charts and absentee alerts',
        ],
      },
      {
        heading: 'Improvements',
        icon: Zap,
        color: 'text-amber-600',
        items: [
          'Significant performance improvements on the members list for churches with 200+ members',
          'Improved mobile responsiveness across all dashboard modules',
          'Finance receipts redesigned with church logo and improved layout',
        ],
      },
      {
        heading: 'Bug Fixes',
        icon: CheckCircle,
        color: 'text-slate-500',
        items: [
          'Fixed an issue where attendance records would occasionally show the wrong service date',
          'Resolved a pagination bug on the members list page',
          'Fixed duplicate member creation when importing CSV with phone number variations',
        ],
      },
    ],
  },
  {
    version: 'v0.8.0',
    date: 'March 2026',
    type: 'minor',
    label: 'Alpha Release',
    badge: null,
    summary: 'Internal alpha release introducing multi-branch support and visitor follow-up — tested with 10 pilot churches.',
    sections: [
      {
        heading: 'New Features',
        icon: Rocket,
        color: 'text-green-600',
        items: [
          'Multi-branch support — create and manage multiple church campuses',
          'Visitor follow-up pipeline — capture visitors and track conversion to membership',
          'Automated birthday SMS notifications for members',
          'Branch-level admin permissions and isolated dashboards',
          'Cross-branch attendance and finance comparison reports',
        ],
      },
      {
        heading: 'Infrastructure',
        icon: Wrench,
        color: 'text-blue-600',
        items: [
          'Initial PWA service worker implementation for partial offline capability',
          'Database indexing improvements for faster member search',
          'SMS gateway integration with local Liberian carriers',
        ],
      },
    ],
  },
]

const TYPE_STYLES = {
  major: {
    dot: 'bg-[#8A19FF] ring-4 ring-purple-100',
    badge: 'bg-[#8A19FF] text-white',
    border: 'border-[#8A19FF]',
  },
  minor: {
    dot: 'bg-[#151022] ring-4 ring-slate-100',
    badge: 'bg-slate-100 text-[#151022]',
    border: 'border-slate-200',
  },
}

export default function ChangelogPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pastel-canvas py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full glass-card text-purple-700 text-xs font-semibold tracking-widest uppercase mb-6 border border-white/70">
            Product Updates
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] leading-tight mb-4">
            Changelog
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            A complete record of every ChurchFlow release — new features, improvements, and bug fixes.
          </p>
        </div>
      </section>

      {/* Roadmap link */}
      <div className="bg-white border-b border-slate-100 py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">Looking ahead? Check the roadmap for upcoming features.</p>
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-2 text-sm text-[#8A19FF] font-semibold hover:underline"
          >
            View Roadmap
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Timeline */}
      <section className="py-16 px-4 bg-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 hidden sm:block" />

            <div className="space-y-14">
              {RELEASES.map(release => {
                const style = TYPE_STYLES[release.type]
                return (
                  <div key={release.version} className="relative sm:pl-16">
                    {/* Timeline dot */}
                    <div className={`hidden sm:flex absolute left-0 top-1 w-11 h-11 rounded-full items-center justify-center ${style.dot}`}>
                      <Tag className="w-4 h-4 text-white" />
                    </div>

                    {/* Release card */}
                    <div className={`bg-white rounded-2xl border ${style.border} shadow-sm overflow-hidden`}>
                      {/* Card header */}
                      <div className="flex flex-wrap items-center gap-3 px-7 py-5 border-b border-slate-100">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.badge}`}>
                          {release.version}
                        </span>
                        {release.badge && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F59E0B] text-[#151022]">
                            {release.badge}
                          </span>
                        )}
                        <span className="text-slate-400 text-sm">{release.date}</span>
                        <span className="text-slate-300 text-sm hidden sm:block">·</span>
                        <span className="font-semibold text-[#151022] text-sm">{release.label}</span>
                      </div>

                      {/* Summary */}
                      <div className="px-7 py-5 border-b border-slate-50">
                        <p className="text-slate-600 text-sm leading-relaxed">{release.summary}</p>
                      </div>

                      {/* Sections */}
                      <div className="px-7 py-5 space-y-8">
                        {release.sections.map(section => {
                          const Icon = section.icon
                          return (
                            <div key={section.heading}>
                              <div className={`flex items-center gap-2 text-sm font-bold mb-3 ${section.color}`}>
                                <Icon className="w-4 h-4" />
                                {section.heading}
                              </div>
                              <ul className="space-y-2">
                                {section.items.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0 mt-2" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe nudge */}
      <section className="pastel-canvas py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#111827] mb-3">Stay up to date</h2>
          <p className="text-purple-700 text-sm leading-relaxed mb-6">
            Subscribe to the ChurchFlow newsletter to receive release notes and product announcements directly in your inbox.
          </p>
          <Link
            to="/community"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F59E0B] text-[#151022] font-bold text-sm hover:bg-amber-400 transition-colors"
          >
            Join the Community
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
