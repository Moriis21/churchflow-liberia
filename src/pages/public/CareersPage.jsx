// ============================================================
// ChurchFlow Liberia — Careers Page (/careers)
// ============================================================
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, MapPin, Clock, Users, Rocket, Heart,
  Globe, ArrowRight, CheckCircle, Code2, HeadphonesIcon, Handshake
} from 'lucide-react'
import PublicLayout from './PublicLayout'

const OPENINGS = [
  {
    id: 'frontend-dev',
    title: 'Frontend Developer',
    type: 'Full-time',
    location: 'Remote (West Africa)',
    department: 'Engineering',
    icon: Code2,
    color: 'bg-purple-100 text-[#7C3AED]',
    summary:
      'We are looking for a skilled React developer to help build and maintain the ChurchFlow web application. You will work closely with our Head of Engineering on new features, performance improvements, and the upcoming native mobile app.',
    responsibilities: [
      'Build and maintain React components using Tailwind CSS',
      'Collaborate on the ChurchFlow design system and component library',
      'Optimise application performance for low-bandwidth environments',
      'Write clean, well-tested, and documented code',
      'Participate in code reviews and sprint planning',
    ],
    requirements: [
      '2+ years of professional React development experience',
      'Strong knowledge of Tailwind CSS and responsive design',
      'Experience with REST APIs and modern state management',
      'Familiarity with PWA development (preferred)',
      'Strong written and verbal communication in English',
    ],
  },
  {
    id: 'customer-success',
    title: 'Customer Success Manager',
    type: 'Full-time',
    location: 'Monrovia, Liberia',
    department: 'Customer Success',
    icon: HeadphonesIcon,
    color: 'bg-amber-100 text-amber-600',
    summary:
      'Join our customer success team as the primary point of contact for onboarding new churches and supporting existing customers. You will help church administrators get the most out of ChurchFlow and be a passionate advocate for our users.',
    responsibilities: [
      'Onboard new church accounts and guide them through setup',
      'Respond to customer support tickets within SLA timeframes',
      'Conduct regular check-in calls with key church accounts',
      'Identify at-risk accounts and implement retention strategies',
      'Collect and document customer feedback for the product team',
    ],
    requirements: [
      'Prior customer success, support, or church administration experience',
      'Excellent communication skills in English and Liberian English',
      'Strong empathy and patience for non-technical users',
      'Comfortable with SaaS tools and basic technical troubleshooting',
      'Genuine interest in the church and ministry space',
    ],
  },
  {
    id: 'partnership-manager',
    title: 'Church Partnership Manager',
    type: 'Full-time',
    location: 'Monrovia, Liberia (with travel)',
    department: 'Partnerships',
    icon: Handshake,
    color: 'bg-green-100 text-green-600',
    summary:
      'Lead ChurchFlow\'s outreach to denominations, church networks, and ministry associations across Liberia. Build long-term relationships that help entire denominations transition to digital church management.',
    responsibilities: [
      'Identify and engage denominational leaders and church networks',
      'Present ChurchFlow at church conferences and ministry events',
      'Negotiate partnership and group licensing agreements',
      'Develop and execute regional church acquisition strategies',
      'Work with the product team to understand church-specific needs',
    ],
    requirements: [
      '3+ years of sales, partnerships, or ministry leadership experience',
      'Existing relationships within Liberian church networks (strongly preferred)',
      'Comfortable with public speaking and group presentations',
      'Self-starter who can manage their own schedule and pipeline',
      'Valid driver\'s licence and willingness to travel within Liberia',
    ],
  },
]

const VALUES = [
  { icon: Heart,   text: 'Work that genuinely serves the church and community'   },
  { icon: Rocket,  text: 'Real ownership and impact from day one'                 },
  { icon: Globe,   text: 'Remote-friendly with a Liberian-first culture'          },
  { icon: Users,   text: 'Small team, big mission'                               },
]

export default function CareersPage() {
  const [expanded, setExpanded] = useState(null)

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E1B4B] via-[#312e81] to-[#7C3AED] py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#F59E0B] text-xs font-semibold tracking-widest uppercase mb-6 border border-white/20">
            Careers at ChurchFlow
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            Join Our Mission
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto leading-relaxed">
            We are building technology that helps Liberian churches thrive. If you love both ministry and software, we want to hear from you.
          </p>
        </div>
      </section>

      {/* Why join */}
      <section className="py-16 px-4 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#1E1B4B] mb-8 text-center">Why ChurchFlow</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map(v => {
              const Icon = v.icon
              return (
                <div key={v.text} className="flex items-center gap-3 p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  <p className="text-[#1E1B4B] text-sm font-medium">{v.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-[#1E1B4B]">Open Positions</h2>
            <span className="px-3 py-1 bg-[#7C3AED] text-white rounded-full text-xs font-bold">
              {OPENINGS.length} openings
            </span>
          </div>

          <div className="space-y-4">
            {OPENINGS.map(job => {
              const Icon = job.icon
              const isOpen = expanded === job.id
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Job header */}
                  <div
                    className="flex flex-wrap items-start justify-between gap-4 p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : job.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${job.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1E1B4B] text-base mb-1">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.type}</span>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.department}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        to="/contact"
                        onClick={e => e.stopPropagation()}
                        className="px-5 py-2 rounded-lg bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] transition-colors"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="px-6 pb-6 border-t border-slate-100 pt-5">
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">{job.summary}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-[#1E1B4B] text-sm mb-3">Responsibilities</h4>
                          <ul className="space-y-2">
                            {job.responsibilities.map(r => (
                              <li key={r} className="flex items-start gap-2 text-xs text-slate-600">
                                <CheckCircle className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0 mt-0.5" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1E1B4B] text-sm mb-3">Requirements</h4>
                          <ul className="space-y-2">
                            {job.requirements.map(r => (
                              <li key={r} className="flex items-start gap-2 text-xs text-slate-600">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="text-slate-400 text-xs">
                          To apply, email your CV and a short note about why you want to join ChurchFlow to
                          <strong className="text-slate-600 ml-1">careers@churchflow.lr</strong>
                        </p>
                        <Link
                          to="/contact"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] transition-colors"
                        >
                          Apply Now
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* No role match */}
      <section className="py-16 px-4 bg-white border-t border-slate-100 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-[#1E1B4B] mb-3">Do not see a role that fits?</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            We are always interested in hearing from talented people who are passionate about the intersection of ministry and technology. Send us your CV and we will keep you in mind for future openings.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#7C3AED] text-[#7C3AED] font-semibold text-sm hover:bg-purple-50 transition-colors"
          >
            Send a Speculative Application
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
