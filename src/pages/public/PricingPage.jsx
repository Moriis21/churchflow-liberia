// ============================================================
// ChurchFlow Liberia — Pricing Page (/pricing)
// Card design mirrors the Landing page Pricing section exactly.
// ============================================================
import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle, ArrowRight, ChevronDown, ChevronUp,
  Shield, Zap, Users, Phone, HeartHandshake, Globe2,
} from 'lucide-react'
import PublicLayout from './PublicLayout'

// ─── Scroll-reveal hook (same as Landing page) ────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

// ─── Plans — same data, Landing page visual design ───────────
const PLANS = [
  {
    name: 'Starter',
    lrd: 'LRD 500',
    usd: '$15',
    period: '/month',
    desc: 'Perfect for small congregations getting started.',
    popular: false,
    features: [
      'Up to 100 members',
      '1 church branch',
      'Basic attendance tracking',
      'Finance & offerings module',
      'SMS alerts (50/month)',
      'Email support',
      'Standard reports',
    ],
    cta: 'Start for Free',
    ctaLink: '/register',
  },
  {
    name: 'Growth',
    lrd: 'LRD 1,500',
    usd: '$45',
    period: '/month',
    desc: 'For growing churches that need powerful tools.',
    popular: true,
    features: [
      'Up to 500 members',
      'Up to 3 branches',
      'Full attendance module',
      'Full finance module',
      'Bulk SMS (500/month)',
      'Advanced reports & analytics',
      'Visitor follow-up system',
      'Event management module',
      'Department management',
      'Priority email & chat support',
    ],
    cta: 'Get Started Free',
    ctaLink: '/register',
  },
  {
    name: 'Ministry Pro',
    lrd: 'LRD 4,000',
    usd: '$120',
    period: '/month',
    desc: 'For large ministries and multi-branch churches.',
    popular: false,
    features: [
      'Unlimited members',
      'Unlimited branches',
      'All attendance features',
      'All finance features',
      'Unlimited SMS',
      'Custom branding',
      'API access',
      'Full data export',
      'Dedicated support manager',
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
  },
]

const TRUST_STATS = [
  { value: '500+',   label: 'Churches Served'   },
  { value: 'LRD',    label: 'Local Currency'    },
  { value: '99.9%',  label: 'Platform Uptime'   },
  { value: '14-day', label: 'Free Trial'        },
]

const WHY_FEATURES = [
  { icon: Shield,         title: 'No Hidden Fees',       desc: 'What you see is what you pay. No setup fees, no surprise charges.',          color: 'bg-purple-50 text-[#7C3AED]'  },
  { icon: Zap,            title: 'Instant Setup',         desc: 'Your church is up and running in under 5 minutes. No technical skills needed.', color: 'bg-amber-50 text-amber-600'   },
  { icon: Users,          title: 'Grows With You',        desc: 'Start on Starter and upgrade anytime as your congregation grows.',            color: 'bg-blue-50 text-blue-600'     },
  { icon: Phone,          title: 'Mobile Money Payments', desc: 'Pay via Orange Money or MTN MoMo — no international card needed.',           color: 'bg-green-50 text-green-600'   },
  { icon: HeartHandshake, title: 'Local Support',         desc: 'Real support from real people in Liberia who understand your context.',       color: 'bg-rose-50 text-rose-600'     },
  { icon: Globe2,         title: 'Works Offline',         desc: 'Attendance and member lookup work even on slow connections.',                 color: 'bg-indigo-50 text-indigo-600' },
]

const FAQS = [
  {
    q: 'Is there a free trial available?',
    a: 'Yes. All plans include a 14-day free trial with full access to the features of your chosen tier. No credit card is required to start.',
  },
  {
    q: 'Are prices in Liberian Dollars (LRD) or US Dollars (USD)?',
    a: 'Prices are listed in both LRD and USD for your convenience. LRD payments are processed through local mobile money platforms.',
  },
  {
    q: 'Can I change my plan later?',
    a: 'Absolutely. You can upgrade or downgrade at any time from your church settings. Upgrades take effect immediately.',
  },
  {
    q: 'How is billing handled for Liberian churches?',
    a: 'We accept Orange Money, MTN MoMo, and bank transfers in LRD. USD payments via international bank transfer or card.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your church data remains accessible for 30 days after cancellation. You can export everything in PDF or Excel format.',
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-[#1E1B4B] text-sm sm:text-base">{q}</span>
        {open
          ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  const [ref, visible] = useInView(0.1)

  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#1E1B4B] via-[#312e81] to-[#7C3AED] py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#F59E0B] text-xs font-semibold tracking-widest uppercase mb-6 border border-white/20">
            Transparent Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Choose the perfect plan<br className="hidden sm:block" /> for your ministry
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto leading-relaxed">
            All plans include a 14-day free trial. No credit card required. Built for Liberian churches of every size.
          </p>
        </div>
      </section>

      {/* ── Trust stats bar ── */}
      <section className="bg-white border-b border-slate-100 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {TRUST_STATS.map(s => (
              <div key={s.label}>
                <div className="text-2xl font-black text-[#7C3AED] mb-0.5">{s.value}</div>
                <div className="text-xs text-slate-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing cards — EXACT Landing page design ── */}
      <section className="py-24 bg-white px-4" ref={ref}>
        <div className="max-w-7xl mx-auto">
          <div
            className="text-center max-w-2xl mx-auto mb-16 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
          >
            <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4 border border-purple-100">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate-500">
              Start free, scale as your ministry grows. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                className={[
                  'relative rounded-3xl p-8 flex flex-col',
                  plan.popular
                    ? 'bg-gradient-to-br from-[#1E1B4B] via-purple-800 to-violet-700 text-white shadow-2xl shadow-purple-900/40 scale-105 ring-4 ring-purple-400/30'
                    : 'bg-white border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]',
                ].join(' ')}
                style={
                  plan.popular
                    ? { animation: visible ? 'float 4s ease-in-out infinite' : 'none' }
                    : {
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(32px)',
                        transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`,
                      }
                }
              >
                {/* Most Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 text-xs font-extrabold px-5 py-1.5 rounded-full shadow-lg shadow-amber-500/30 uppercase tracking-wider whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan name + desc */}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-slate-800'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.popular ? 'text-white/70' : 'text-slate-500'}`}>
                    {plan.desc}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-extrabold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                      {plan.usd}
                    </span>
                    <span className={`text-sm font-semibold mb-1 ${plan.popular ? 'text-white/60' : 'text-slate-400'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${plan.popular ? 'text-yellow-300/80' : 'text-slate-400'}`}>
                    approx. {plan.lrd}/mo
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckCircle
                        className={`flex-shrink-0 ${plan.popular ? 'text-yellow-400' : 'text-purple-500'}`}
                        style={{ width: '1.1rem', height: '1.1rem' }}
                      />
                      <span className={`text-sm ${plan.popular ? 'text-white/85' : 'text-slate-600'}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <Link
                  to={plan.ctaLink}
                  className={[
                    'block text-center font-bold py-3.5 px-6 rounded-2xl transition-all hover:-translate-y-0.5 text-sm',
                    plan.popular
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50'
                      : 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-purple-500/25 hover:shadow-purple-500/40',
                  ].join(' ')}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-400 mt-10">
            All prices are inclusive of VAT where applicable · Prices in LRD and USD · 14-day free trial on all plans
          </p>
        </div>
      </section>

      {/* ── Why ChurchFlow — feature highlights ── */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-[#1E1B4B] mb-2">Why churches choose ChurchFlow</h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">Every plan includes these guarantees.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_FEATURES.map(f => {
              const Icon = f.icon
              return (
                <div key={f.title} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1E1B4B] text-sm mb-1">{f.title}</p>
                    <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Compare note ── */}
      <section className="py-12 px-4 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1E1B4B] mb-3">Not sure which plan fits?</h2>
          <p className="text-slate-500 mb-6 leading-relaxed">
            Most growing churches start on <strong>Growth</strong>. Under 100 members? <strong>Starter</strong> is perfect. Large multi-campus ministry? <strong>Ministry Pro</strong> has everything you need.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#7C3AED] text-[#7C3AED] font-semibold text-sm hover:bg-purple-50 transition-colors"
          >
            Talk to our team <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Payment methods ── */}
      <section className="py-10 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">Accepted payment methods in Liberia</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Orange Money',   color: 'bg-orange-100 text-orange-700 border-orange-200' },
              { name: 'MTN MoMo',       color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
              { name: 'Bank Transfer',  color: 'bg-blue-100 text-blue-700 border-blue-200'       },
              { name: 'USD Card',       color: 'bg-slate-100 text-slate-700 border-slate-200'    },
            ].map(m => (
              <span key={m.name} className={`px-5 py-2 rounded-full border text-sm font-semibold ${m.color}`}>
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1E1B4B] mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about ChurchFlow pricing.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── CTA — matches Landing page CTA banner ── */}
      <section className="py-20 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-950 mb-4 leading-tight">
            Start your free 14-day trial today
          </h2>
          <p className="text-lg text-amber-800 mb-8">
            Set up your church in minutes. No contracts. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 text-base font-bold text-white bg-gradient-to-r from-violet-700 to-purple-800 px-10 py-4 rounded-2xl shadow-xl shadow-purple-900/30 hover:from-violet-800 hover:to-purple-900 transition-all hover:-translate-y-1"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 text-base font-bold text-amber-950 bg-white/70 hover:bg-white px-8 py-4 rounded-2xl transition-all"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* float animation for popular card */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1.05); }
          50%       { transform: translateY(-8px) scale(1.05); }
        }
      `}</style>

    </PublicLayout>
  )
}
