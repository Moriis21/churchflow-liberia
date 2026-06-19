// ============================================================
// ChurchFlow Liberia — Pricing Page (/pricing)
//
// Visual design: UNCHANGED (dark-purple Growth card, amber badge,
//   white cards, purple gradients, checkmarks — exactly as before).
//
// Added from reference component:
//   • motion/react scroll-reveal (blur→clear, y-slide, opacity)
//   • Staggered card entrance delays
//   • Monthly / Yearly billing toggle
//   • @number-flow/react animated price counter on toggle
// ============================================================
import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import NumberFlow from '@number-flow/react'
import {
  CheckCircle, ArrowRight, ChevronDown, ChevronUp,
  Shield, Zap, Users, Phone, HeartHandshake, Globe2,
} from 'lucide-react'
import PublicLayout from './PublicLayout'

// ─── Animation variants (from reference component) ───────────
const revealVariants = {
  hidden: {
    filter: 'blur(10px)',
    y: -20,
    opacity: 0,
  },
  visible: (i = 0) => ({
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.15,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

// Helper: wrap any element in a scroll-triggered reveal
function Reveal({ children, i = 0, className = '', as: Tag = 'div' }) {
  return (
    <motion.div
      className={className}
      custom={i}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={revealVariants}
    >
      {children}
    </motion.div>
  )
}

// ─── Prices — rate $1 = 184 LRD, yearly saves 20% ────────────
const PLANS = [
  {
    name: 'Starter',
    monthlyUsd: 15,
    yearlyUsd:  144,      // $180 × 0.8
    monthlyLrd: 2760,     // $15  × 184
    yearlyLrd:  26496,    // $144 × 184
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
    cta: 'Get Started',
    ctaLink: '/register',
  },
  {
    name: 'Growth',
    monthlyUsd: 45,
    yearlyUsd:  432,      // $540  × 0.8
    monthlyLrd: 8280,     // $45   × 184
    yearlyLrd:  79488,    // $432  × 184
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
    cta: 'Choose Plan',
    ctaLink: '/register',
  },
  {
    name: 'Ministry Pro',
    monthlyUsd: 120,
    yearlyUsd:  1152,     // $1,440 × 0.8
    monthlyLrd: 22080,    // $120  × 184
    yearlyLrd:  211968,   // $1,152 × 184
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
    cta: 'Start Now',
    ctaLink: '/register',
  },
]

const TRUST_STATS = [
  { value: 'LRD + USD', label: 'Dual Currency'   },
  { value: 'Bank-Level',label: 'Data Security'   },
  { value: '99.9%',     label: 'Platform Uptime' },
  { value: '14-day',    label: 'Free Trial'      },
]

const WHY_FEATURES = [
  { icon: Shield,         title: 'No Hidden Fees',       desc: 'What you see is what you pay. No setup fees, no surprise charges.',          color: 'bg-purple-50 text-[#8A19FF]'  },
  { icon: Zap,            title: 'Instant Setup',         desc: 'Your church is up and running in under 5 minutes. No technical skills needed.', color: 'bg-amber-50 text-amber-600'   },
  { icon: Users,          title: 'Grows With You',        desc: 'Start on Starter and upgrade anytime as your congregation grows.',            color: 'bg-blue-50 text-blue-600'     },
  { icon: Phone,          title: 'Mobile Money Payments', desc: 'Pay via Orange Money or MTN MoMo — no international card needed.',           color: 'bg-green-50 text-green-600'   },
  { icon: HeartHandshake, title: 'Local Support',         desc: 'Real support from real people in Liberia who understand your context.',       color: 'bg-rose-50 text-rose-600'     },
  { icon: Globe2,         title: 'Works Offline',         desc: 'Attendance and member lookup work even on slow connections.',                 color: 'bg-indigo-50 text-indigo-600' },
]

const FAQS = [
  { q: 'Is there a free trial?',                       a: 'Yes — all plans include a 14-day free trial with full access. No credit card required.' },
  { q: 'Are prices in LRD or USD?',                    a: 'Both. LRD payments via Orange Money or MTN MoMo. USD via international card or bank transfer.' },
  { q: 'Can I change my plan later?',                  a: 'Yes, upgrade or downgrade at any time. Upgrades take effect immediately.' },
  { q: 'What is the yearly discount?',                 a: 'Yearly billing saves you 20%. Prices shown reflect the discounted annual total.' },
  { q: 'What happens to my data if I cancel?',         a: 'Your data stays accessible for 30 days. Export everything to PDF or Excel before closing.' },
]

// ─── Billing toggle — ChurchFlow brand style ─────────────────
function BillingToggle({ isYearly, onChange }) {
  return (
    <div className="flex justify-center">
      <div className="relative flex items-center bg-slate-100 border border-slate-200 rounded-full p-1 gap-1">
        {/* Monthly */}
        <button
          onClick={() => onChange(false)}
          className={`relative z-10 px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
            !isYearly ? 'text-white' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {!isYearly && (
            <motion.span
              layoutId="billing-pill"
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#151022] to-[#8A19FF]"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        {/* Yearly */}
        <button
          onClick={() => onChange(true)}
          className={`relative z-10 px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 flex items-center gap-2 ${
            isYearly ? 'text-white' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {isYearly && (
            <motion.span
              layoutId="billing-pill"
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#151022] to-[#8A19FF]"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative">Yearly</span>
          <span className={`relative rounded-full px-2 py-0.5 text-[10px] font-bold ${
            isYearly ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
          }`}>
            Save 20%
          </span>
        </button>
      </div>
    </div>
  )
}

// ─── FeyButton — soft radial gradient + inset shadow ─────────
// Adapted from fey-button reference (React version, no next-themes).
// Pass isDark=true for buttons inside the dark-gradient Growth card.
function FeyLockIcon({ isDark }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        stroke={isDark ? '#868F97' : '#4B5563'}
        strokeWidth="1.5"
        d="M13.5 12.8053C14.2525 12.3146 14.75 11.4654 14.75 10.5C14.75 8.98122 13.5188 7.75 12 7.75C10.4812 7.75 9.25 8.98122 9.25 10.5C9.25 11.4654 9.74745 12.3146 10.5 12.8053L10.5 14.75C10.5 15.5784 11.1716 16.25 12 16.25C12.8284 16.25 13.5 15.5784 13.5 14.75L13.5 12.8053Z"
      />
      <circle cx="12" cy="12" r="9.25" stroke={isDark ? '#868F97' : '#4B5563'} strokeWidth="1.5" />
    </svg>
  )
}

// FeyLink — same visual as FeyButton but renders a react-router Link
function FeyLink({ to, children, showLock = false, isDark = false }) {
  const base = [
    'group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3',
    'text-sm font-semibold leading-tight transition-all duration-200 no-underline',
    isDark ? 'text-white' : 'text-slate-900',
    isDark
      ? '[background:radial-gradient(61.35%_50.07%_at_48.58%_50%,rgb(0,0,0)_0%,rgba(255,255,255,0.06)_100%)]'
      : '[background:radial-gradient(61.35%_50.07%_at_48.58%_50%,rgb(255,255,255)_0%,rgba(0,0,0,0.03)_100%)]',
    isDark
      ? '[box-shadow:inset_0_0_0_0.5px_rgba(134,143,151,0.25),inset_1px_1px_0_-0.5px_rgba(134,143,151,0.45),inset_-1px_-1px_0_-0.5px_rgba(134,143,151,0.45)]'
      : '[box-shadow:inset_0_0_0_0.5px_rgba(148,163,184,0.55),inset_1px_1px_0_-0.5px_rgba(148,163,184,0.7),inset_-1px_-1px_0_-0.5px_rgba(148,163,184,0.7)]',
  ].join(' ')

  // hover overlay via a sibling div (pseudo after: won't work on Link)
  return (
    <Link to={to} className={base} style={{ textDecoration: 'none' }}>
      {/* hover fade overlay */}
      <span
        aria-hidden
        className={[
          'absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none',
          isDark
            ? '[background:radial-gradient(61.35%_50.07%_at_48.58%_50%,rgb(0,0,0)_0%,rgb(24,24,24)_100%)]'
            : '[background:radial-gradient(61.35%_50.07%_at_48.58%_50%,rgb(255,255,255)_0%,rgb(242,242,242)_100%)]',
        ].join(' ')}
      />
      <span className="relative z-10 flex items-center gap-2">
        {showLock && <FeyLockIcon isDark={isDark} />}
        {children}
      </span>
    </Link>
  )
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-transparent transition-colors">
        <span className="font-semibold text-[#151022] text-sm sm:text-base">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">{a}</div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────
export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <PublicLayout>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#151022] via-[#2A1F4F] to-[#8A19FF] py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#F59E0B] text-xs font-semibold tracking-widest uppercase mb-6 border border-white/20">
            Transparent Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Choose the perfect plan<br className="hidden sm:block" /> for your ministry
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto leading-relaxed">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="bg-white border-b border-slate-100 py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {TRUST_STATS.map((s, i) => (
            <Reveal key={s.label} i={i}>
              <div className="text-2xl font-black text-[#8A19FF] mb-0.5">{s.value}</div>
              <div className="text-xs text-slate-500 font-medium">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Pricing cards section ── */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">

          {/* Animated title */}
          <Reveal i={0} className="text-center max-w-2xl mx-auto mb-4">
            <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4 border border-purple-100">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate-500">
              Start free, scale as your ministry grows. No hidden fees.
            </p>
          </Reveal>

          {/* Animated billing toggle */}
          <Reveal i={1} className="mb-12">
            <BillingToggle isYearly={isYearly} onChange={setIsYearly} />
          </Reveal>

          {/* Pricing cards — staggered reveal, UNCHANGED design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {PLANS.map((plan, i) => {
              const usdPrice = isYearly ? plan.yearlyUsd  : plan.monthlyUsd
              const lrdPrice = isYearly ? plan.yearlyLrd  : plan.monthlyLrd
              const period   = isYearly ? '/year'          : '/month'

              return (
                <Reveal key={plan.name} i={2 + i}>
                  <div
                    className={[
                      'relative rounded-3xl p-8 flex flex-col h-full',
                      plan.popular
                        ? 'bg-gradient-to-br from-[#151022] via-purple-800 to-violet-700 text-white shadow-2xl shadow-purple-900/40 scale-105 ring-4 ring-purple-400/30'
                        : 'bg-white border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]',
                    ].join(' ')}
                  >
                    {/* Most Popular badge */}
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 text-xs font-extrabold px-5 py-1.5 rounded-full shadow-lg shadow-amber-500/30 uppercase tracking-wider whitespace-nowrap">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Name + desc */}
                    <div className="mb-6">
                      <h3 className={`text-xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-slate-800'}`}>
                        {plan.name}
                      </h3>
                      <p className={`text-sm ${plan.popular ? 'text-white/70' : 'text-slate-500'}`}>
                        {plan.desc}
                      </p>
                    </div>

                    {/* Price — LRD-first for the Liberian market */}
                    <div className="mb-8">
                      <div className="flex items-end gap-1">
                        <span className={`text-4xl font-extrabold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                          LRD&nbsp;<NumberFlow
                            value={lrdPrice}
                            format={{ notation: 'standard' }}
                            className="text-4xl font-extrabold"
                          />
                        </span>
                        <span className={`text-sm font-semibold mb-1 ${plan.popular ? 'text-white/60' : 'text-slate-400'}`}>
                          {period}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${plan.popular ? 'text-yellow-300/80' : 'text-slate-400'}`}>
                        approx. $<NumberFlow
                          value={usdPrice}
                          format={{ notation: 'standard' }}
                        /> USD{period}
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

                    {/* CTA — FeyButton style */}
                    <FeyLink
                      to={plan.ctaLink}
                      isDark={plan.popular}
                      showLock={false}
                    >
                      {plan.cta}
                    </FeyLink>
                  </div>
                </Reveal>
              )
            })}
          </div>

          <Reveal i={5} className="text-center mt-10">
            <p className="text-sm text-slate-400">
              All prices are inclusive of VAT where applicable · 14-day free trial on all plans · Yearly billing saves 20%
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Why ChurchFlow ── */}
      <section className="py-16 px-4 bg-transparent">
        <div className="max-w-5xl mx-auto">
          <Reveal i={0} className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-[#151022] mb-2">Why churches choose ChurchFlow</h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">Every plan includes these guarantees.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <Reveal key={f.title} i={i * 0.5}>
                  <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all h-full">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#151022] text-sm mb-1">{f.title}</p>
                      <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Compare note ── */}
      <section className="py-12 px-4 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal i={0}>
            <h2 className="text-2xl font-bold text-[#151022] mb-3">Not sure which plan fits?</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Most growing churches start on <strong>Growth</strong>. Under 100 members? <strong>Starter</strong> is perfect. Large multi-campus ministry? <strong>Ministry Pro</strong> has everything.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#8A19FF] text-[#8A19FF] font-semibold text-sm hover:bg-purple-50 transition-colors">
              Talk to our team <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Payment methods ── */}
      <section className="py-10 px-4 bg-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal i={0}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">Accepted payment methods in Liberia</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: 'Orange Money',  color: 'bg-orange-100 text-orange-700 border-orange-200' },
                { name: 'MTN MoMo',      color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                { name: 'Bank Transfer', color: 'bg-blue-100 text-blue-700 border-blue-200'       },
                { name: 'USD Card',      color: 'bg-slate-100 text-slate-700 border-slate-200'    },
              ].map(m => (
                <span key={m.name} className={`px-5 py-2 rounded-full border text-sm font-semibold ${m.color}`}>
                  {m.name}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <Reveal i={0} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#151022] mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about ChurchFlow pricing.</p>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} i={i * 0.1}>
                <FAQItem {...faq} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal i={0}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-950 mb-4 leading-tight">
              Start your free 14-day trial today
            </h2>
            <p className="text-lg text-amber-800 mb-8">
              Set up your church in minutes. No contracts. Cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 text-base font-bold text-white bg-[#111111] px-10 py-4 rounded-2xl shadow-xl shadow-black/30 hover:bg-black transition-all hover:-translate-y-1"
              >
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 text-base font-bold text-amber-950 bg-white/70 hover:bg-white px-8 py-4 rounded-2xl transition-all"
              >
                Talk to Sales
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </PublicLayout>
  )
}
