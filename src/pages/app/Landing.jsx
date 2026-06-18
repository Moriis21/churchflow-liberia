// ============================================================
// ChurchFlow Liberia — Public Landing / Marketing Page
// ============================================================
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import FloatingAIAssistant from '../../components/ai/FloatingAIAssistant'
import ChurchFlowBackground from '../../components/ui/ChurchFlowBackground'
import { insforge } from '../../lib/insforge'
import {
  Users,
  CheckSquare,
  DollarSign,
  Calendar,
  MessageSquare,
  Video,
  Star,
  CheckCircle,
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  TrendingUp,
  Shield,
  ShieldCheck,
  Clock,
  Heart,
  Zap,
  Globe2,
  MessageCircle,
  Camera,
  PlayCircle,
} from 'lucide-react'

// ─── Global animation styles ─────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes stepPulse {
    0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
    50%  { transform: scale(1.06); box-shadow: 0 0 0 16px rgba(124,58,237,0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(124,58,237,0); }
  }
  @keyframes lineGrow {
    from { width: 0%; }
    to   { width: 100%; }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

// ─── Navbar — polished mobile-first ──────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing',  href: '#pricing'  },
    { label: 'About',    href: '#about'    },
    { label: 'Contact',  href: '#contact'  },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/97 backdrop-blur-lg border-b border-slate-100/80 shadow-[0_1px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bar — 52px mobile, 60px desktop */}
        <div className="flex items-center justify-between h-[52px] sm:h-[60px]">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] overflow-hidden bg-[#151022] flex items-center justify-center shadow-sm shadow-purple-500/20 flex-shrink-0">
              <img src="/logo.png" alt="ChurchFlow Liberia" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
            </div>
            <span className="font-bold text-sm sm:text-base leading-tight text-slate-900">
              Church<span className="text-purple-600">Flow</span>{' '}
              <span className="text-amber-500">Liberia</span>
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(link => (
              <a key={link.label} href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-purple-700 px-4 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
              Login
            </Link>
            <Link to="/register"
              className="text-sm font-semibold text-white bg-[#111111] px-4 py-1.5 rounded-lg hover:bg-black shadow-sm shadow-black/20 transition-all hover:-translate-y-px">
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger — perfectly centred */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
          </button>
        </div>

        {/* Mobile drawer — animated */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="md:hidden border-t border-slate-100 py-3 space-y-0.5"
            >
              {navLinks.map(link => (
                <a key={link.label} href={link.href} onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors">
                  {link.label}
                </a>
              ))}
              <div className="pt-2.5 px-3 flex flex-col gap-2">
                <Link to="/login" onClick={() => setOpen(false)}
                  className="text-center text-sm font-semibold text-slate-700 border border-slate-200 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  Login
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}
                  className="text-center text-sm font-semibold text-white bg-[#111111] py-2.5 rounded-xl hover:bg-black transition-colors">
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

// ─── Demo Video Modal ─────────────────────────────────────────
function DemoModal({ isOpen, onClose }) {
  if (!isOpen) return null
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ animation: 'fadeInUp 0.3s ease both' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
          aria-label="Close demo video"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video header */}
        <div className="bg-[#151022] px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#151022] overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="ChurchFlow" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">ChurchFlow Liberia</p>
            <p className="text-amber-400 text-xs">Full Platform Demo</p>
          </div>
        </div>

        {/* YouTube embed — 16:9 */}
        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1"
            title="ChurchFlow Liberia Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer note */}
        <div className="bg-[#151022] px-6 py-3 flex items-center justify-between">
          <p className="text-white/60 text-xs">
            See how ChurchFlow manages members, attendance, finance and more.
          </p>
          <a
            href="/register"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Get Started Free →
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Hero — polished mobile-first ─────────────────────────────
// Branding, colors, and structure: UNCHANGED.
// Improvements: tighter mobile spacing, motion fade-ups,
// better line-breaks, reduced button height, floating badges.
function Hero() {
  const [demoOpen, setDemoOpen] = React.useState(false)

  // Shared fade-up variants
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
  })

  const BADGES = [
    { icon: Users,     label: 'Built for Liberian Churches'    },
    { icon: TrendingUp,label: 'Members, Attendance & Finance'  },
    { icon: Shield,    label: '99.9% Uptime Guaranteed'        },
  ]

  return (
    <section className="relative overflow-hidden pastel-canvas pt-14 pb-12 sm:pt-24 sm:pb-20">

      {/* Soft pastel glow accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full glow-purple opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-96 h-96 rounded-full glow-mint opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 w-80 h-80 rounded-full glow-blue opacity-50 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">

          {/* Top badge — frosted glass on light */}
          <motion.div {...fadeUp(0)}
            className="inline-flex items-center gap-1.5 glass-card text-slate-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-5 sm:mb-8"
          >
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 flex-shrink-0" />
            Built specifically for Liberian churches
          </motion.div>

          {/* Headline — dark text on pastel */}
          <motion.h1 {...fadeUp(0.08)}
            className="text-[1.65rem] xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] leading-[1.18] tracking-tight mb-4 sm:mb-6 px-2 sm:px-0"
          >
            Stop Losing Church Records.{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Start Building a Smarter Ministry.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p {...fadeUp(0.16)}
            className="text-sm sm:text-lg text-slate-600 leading-[1.7] max-w-[86%] sm:max-w-2xl mx-auto mb-7 sm:mb-10"
          >
            ChurchFlow helps Liberian churches manage members, track attendance,
            record offerings, and stay connected — all in one place.
          </motion.p>

          {/* CTA Buttons — shorter on mobile, reduced shadow */}
          <motion.div {...fadeUp(0.24)}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-14"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-white bg-[#111111] px-7 sm:px-8 py-3 sm:py-4 rounded-2xl hover:bg-black shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <button
              onClick={() => setDemoOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-[#111827] bg-white border border-[#D1D5DB] px-7 sm:px-8 py-3 sm:py-4 rounded-2xl hover:bg-slate-50 hover:border-[#9CA3AF] shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100">
                <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-700" fill="currentColor" />
              </span>
              Watch Demo
            </button>
          </motion.div>

          {/* Trust badges — floating, smaller on mobile */}
          <motion.div {...fadeUp(0.32)}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-16"
          >
            {BADGES.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.5,
                }}
                className="flex items-center gap-1.5 glass-card text-slate-700 text-[11px] sm:text-sm font-medium px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full"
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                {label}
              </motion.div>
            ))}
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div {...fadeUp(0.4)}
            className="relative mx-auto max-w-4xl overflow-hidden sm:overflow-visible"
          >
            {/* Soft pastel glow behind the panel */}
            <div className="absolute -inset-2 bg-gradient-to-r from-violet-400/30 via-fuchsia-300/25 to-blue-400/30 rounded-[2rem] blur-2xl" />
            <div className="relative bg-white/80 backdrop-blur-2xl border border-white/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_24px_70px_-20px_rgba(91,0,184,0.45)]">

              {/* Browser-style header bar */}
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="bg-slate-100/80 border border-white rounded-lg px-3 sm:px-6 py-1 sm:py-1.5 text-slate-500 text-[10px] sm:text-xs font-medium">
                  churchflow.innova-lib.com/app/dashboard
                </div>
                <div className="w-12 sm:w-16" />
              </div>

              {/* Pastel-tinted stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-5">
                {[
                  { label: 'Total Members',      value: '248',         tint: 'tint-lavender', bar: 'from-violet-500 to-purple-600' },
                  { label: "Today's Attendance", value: '186',         tint: 'tint-mint',     bar: 'from-emerald-400 to-teal-500'  },
                  { label: 'Total Offerings',    value: 'LRD 125,750', tint: 'tint-cream',    bar: 'from-amber-400 to-yellow-500'  },
                  { label: 'Visitors Today',     value: '4',           tint: 'tint-blue',     bar: 'from-blue-500 to-indigo-500'   },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.tint} border border-white/80 rounded-xl p-3 sm:p-4 shadow-sm`}>
                    <p className="text-slate-500 text-[10px] sm:text-xs mb-1 leading-tight">{stat.label}</p>
                    <p className="text-slate-900 font-extrabold text-sm sm:text-lg leading-none">{stat.value}</p>
                    <div className={`mt-1.5 sm:mt-2 h-0.5 sm:h-1 rounded-full bg-gradient-to-r ${stat.bar} w-3/4`} />
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="col-span-2 tint-blue border border-white/80 rounded-xl p-3 sm:p-4 h-24 sm:h-32 shadow-sm">
                  <p className="text-slate-500 text-[10px] sm:text-xs mb-2 sm:mb-3 font-medium">Attendance Overview</p>
                  <div className="flex items-end gap-1 sm:gap-1.5 h-12 sm:h-16">
                    {[60, 75, 50, 90, 70, 85, 80].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-violet-600 to-purple-400"
                        style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="tint-mint border border-white/80 rounded-xl p-3 sm:p-4 h-24 sm:h-32 shadow-sm">
                  <p className="text-slate-500 text-[10px] sm:text-xs mb-2 sm:mb-3 font-medium">Offerings</p>
                  <div className="flex items-center justify-center h-12 sm:h-16">
                    <div className="relative w-10 h-10 sm:w-14 sm:h-14">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-4 border-violet-300" />
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 border-r-amber-400 rotate-45" />
                      <div className="absolute inset-2 flex items-center justify-center">
                        <span className="text-slate-700 text-[8px] sm:text-[9px] font-bold">62%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>


      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Users,
    title: 'Member Management',
    tint: 'tint-lavender',
    desc: 'Maintain complete profiles for every member — contact details, departments, and spiritual records in one place.',
  },
  {
    icon: CheckSquare,
    title: 'Attendance Tracking',
    tint: 'tint-mint',
    desc: 'Record and analyse Sunday and midweek attendance across all services and branches with ease.',
  },
  {
    icon: DollarSign,
    title: 'Finance & Offerings',
    tint: 'tint-cream',
    desc: 'Log tithes, offerings, and special donations. Generate transparent financial reports in LRD and USD.',
  },
  {
    icon: Calendar,
    title: 'Events Management',
    tint: 'tint-blue',
    desc: 'Plan, promote, and track church programmes from conventions to outreach campaigns.',
  },
  {
    icon: MessageSquare,
    title: 'SMS & Notifications',
    tint: 'tint-aqua',
    desc: 'Send bulk SMS announcements and birthday greetings to your congregation instantly.',
  },
  {
    icon: Video,
    title: 'Live Streaming',
    tint: 'tint-rose',
    desc: 'Stream services to YouTube, Facebook, or Zoom and embed sermon archives directly in ChurchFlow.',
  },
]

function useInView(threshold = 0.15) {
  const ref = React.useRef(null)
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
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

function Features() {
  const [sectionRef, sectionVisible] = useInView(0.1)

  return (
    <section id="features" className="py-24 pastel-canvas" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className="text-center max-w-2xl mx-auto mb-16 transition-all duration-700"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4 border border-purple-100">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Everything your church needs in one place
          </h2>
          <p className="text-lg text-slate-600">
            Purpose-built tools to help Liberian churches grow, stay organised, and minister effectively.
          </p>
        </div>

        {/* Grid — 3×2 frosted-glass cards with pastel tints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, tint }, i) => (
            <div
              key={title}
              className={`group relative ${tint} glass-card rounded-3xl p-6 overflow-hidden hover:-translate-y-1.5 transition-all duration-300`}
              style={{
                opacity: sectionVisible ? 1 : 0,
                transform: sectionVisible ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease`,
                transitionDelay: `${i * 80}ms`,
              }}
            >
              {/* Soft glow behind the card */}
              <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/40 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 flex items-center justify-center mb-5 shadow-sm group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-purple-700 group-hover:border-transparent transition-all duration-300">
                <Icon className="w-6 h-6 text-purple-700 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="relative text-base font-bold text-slate-900 mb-2">{title}</h3>
              <p className="relative text-sm text-slate-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Stats Bar — value-based proof points ─────────────────────
// We deliberately show capability/trust signals rather than live
// church/member counts: a new platform showing "0 churches" destroys
// credibility. These are always true and speak to the value prop.
function StatsBar() {
  const [ref, visible] = useInView(0.2)

  const stats = [
    { value: 'LRD + USD', label: 'Dual-Currency Giving' },
    { value: 'Bank-Level', label: 'Security & Encryption' },
    { value: '99.9%',      label: 'Uptime Guaranteed' },
    { value: '24/7',       label: 'Support Available' },
  ]

  return (
    <section className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 py-14" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }, i) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1"
              style={{
                animation: visible ? `countUp 0.5s ease ${i * 100}ms both` : 'none',
                opacity: visible ? 1 : 0,
              }}
            >
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {value}
              </span>
              <span className="text-sm font-medium text-white/70 uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────
function useStepInView(threshold = 0.2) {
  const ref = React.useRef(null)
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
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

function HowItWorks() {
  const [sectionRef, sectionVisible] = useStepInView(0.15)

  const steps = [
    {
      num: '01',
      title: 'Quick Setup',
      Icon: Zap,
      color: 'from-[#151022] to-violet-700',
      glow: 'shadow-violet-900/40',
      desc: 'Create your church profile in minutes. Add your church name, location, branches, and branding. No technical skills required.',
      delay: 0,
    },
    {
      num: '02',
      title: 'Add Your Members',
      Icon: Users,
      color: 'from-[#151022] to-[#5B00B8]',
      glow: 'shadow-purple-700/40',
      desc: 'Import or manually add your congregation. Assign departments, record baptism status, and track membership history.',
      delay: 200,
    },
    {
      num: '03',
      title: 'Track & Grow',
      Icon: TrendingUp,
      color: 'from-amber-500 to-yellow-500',
      glow: 'shadow-amber-400/40',
      desc: 'Record attendance, offerings, and events. Use built-in analytics to understand and grow your ministry.',
      delay: 400,
    },
  ]

  return (
    <section id="about" className="py-24 bg-white overflow-hidden" ref={sectionRef}>
      <style>{GLOBAL_STYLES}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div
          className="text-center max-w-2xl mx-auto mb-20 transition-all duration-700"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'translateY(0)' : 'translateY(32px)',
          }}
        >
          <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4 border border-purple-100">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Designed for Church.{' '}
            <span className="text-purple-600">Built for Impact.</span>
          </h2>
          <p className="text-lg text-slate-500">
            Get up and running in under 10 minutes with our simple onboarding process.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 relative">

          {/* Animated connector line (desktop only) */}
          <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-400 via-purple-500 to-amber-400 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: sectionVisible ? '100%' : '0%',
                transitionDelay: '300ms',
              }}
            />
          </div>

          {steps.map(({ num, title, Icon, color, glow, desc, delay }) => (
            <div
              key={num}
              className="flex flex-col items-center text-center relative"
              style={{
                opacity: sectionVisible ? 1 : 0,
                transform: sectionVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
                transition: `opacity 0.6s ease, transform 0.6s ease`,
                transitionDelay: `${delay}ms`,
              }}
            >
              {/* Step circle */}
              <div
                className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${color} flex flex-col items-center justify-center mb-6 shadow-2xl ${glow} relative z-10`}
                style={{
                  animation: sectionVisible ? `stepPulse 2s ease-in-out ${delay + 600}ms 1` : 'none',
                }}
              >
                <Icon className="w-7 h-7 text-white mb-1" />
                <span className="text-xl font-black text-white/80 leading-none">{num}</span>
              </div>

              {/* Arrow between steps on mobile */}
              {num !== '03' && (
                <div className="md:hidden flex justify-center my-2">
                  <div
                    className="flex flex-col items-center gap-1"
                    style={{
                      opacity: sectionVisible ? 1 : 0,
                      transition: 'opacity 0.5s ease',
                      transitionDelay: `${delay + 300}ms`,
                    }}
                  >
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1 h-3 rounded-full bg-purple-300"
                        style={{
                          opacity: sectionVisible ? (1 - i * 0.25) : 0,
                          transition: `opacity 0.4s ease`,
                          transitionDelay: `${delay + 350 + i * 60}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Text */}
              <h3
                className="text-xl font-bold text-slate-800 mb-3"
                style={{
                  opacity: sectionVisible ? 1 : 0,
                  transform: sectionVisible ? 'translateY(0)' : 'translateY(16px)',
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                  transitionDelay: `${delay + 200}ms`,
                }}
              >
                {title}
              </h3>
              <p
                className="text-sm text-slate-500 leading-relaxed max-w-xs"
                style={{
                  opacity: sectionVisible ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                  transitionDelay: `${delay + 350}ms`,
                }}
              >
                {desc}
              </p>

              {/* Animated underline accent */}
              <div
                className="mt-5 h-1 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 transition-all duration-700"
                style={{
                  width: sectionVisible ? '48px' : '0px',
                  transitionDelay: `${delay + 500}ms`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA nudge — no emojis */}
        <div
          className="mt-16 text-center"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
            transitionDelay: '800ms',
          }}
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#111111] px-6 py-3 rounded-full shadow-md shadow-black/25 hover:bg-black hover:-translate-y-0.5 transition-all"
          >
            Start your free church account today — no credit card required
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Why ChurchFlow — honest value pillars (no fabricated quotes) ──
const PILLARS = [
  {
    icon: ShieldCheck,
    tint: 'tint-lavender',
    title: 'Built for accountability',
    desc: 'Every tithe, offering, and expense is logged with a full audit trail in LRD and USD — so leadership and congregation can trust the numbers.',
  },
  {
    icon: Clock,
    tint: 'tint-mint',
    title: 'Hours back every week',
    desc: 'Attendance, member records, and reports that used to take hours of paperwork now take minutes — from any phone or computer.',
  },
  {
    icon: Heart,
    tint: 'tint-blue',
    title: 'Made for Liberian churches',
    desc: 'Dual-currency giving, SMS that reaches every member, and a workflow designed around how Liberian congregations actually run.',
  },
]

function Testimonials() {
  const [ref, visible] = useInView(0.1)

  return (
    <section className="py-24 pastel-canvas" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="text-center max-w-2xl mx-auto mb-16 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          <span className="inline-block text-sm font-semibold text-purple-700 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4 border border-white/70">
            Why ChurchFlow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            A modern foundation for your ministry
          </h2>
          <p className="text-lg text-slate-600">
            Replace scattered paper records with one secure, transparent system built for the way Liberian churches serve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => {
            const Icon = p.icon
            return (
              <div
                key={p.title}
                className={`group relative ${p.tint} glass-card rounded-3xl p-7 overflow-hidden flex flex-col hover:-translate-y-1.5 transition-all duration-300`}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(32px)',
                  transition: `opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease`,
                  transitionDelay: `${i * 120}ms`,
                }}
              >
                <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/40 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 flex items-center justify-center mb-5 shadow-sm group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-purple-700 group-hover:border-transparent transition-all duration-300">
                  <Icon className="w-6 h-6 text-purple-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="relative text-lg font-bold text-slate-900 mb-2">{p.title}</h3>
                <p className="relative text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────
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
      'Basic reports',
      'SMS alerts',
      '1 branch',
      'Email support',
    ],
    cta: 'Start for Free',
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
      'Full reports & analytics',
      'Bulk SMS',
      'Up to 3 branches',
      'Finance module',
      'Priority support',
    ],
    cta: 'Get Started Free',
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
      'Multi-branch support',
      'Custom branding',
      'Priority support',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
  },
]

function Pricing() {
  const [ref, visible] = useInView(0.1)

  return (
    <section id="pricing" className="py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="text-center max-w-2xl mx-auto mb-16 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4 border border-purple-100">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Choose the perfect plan for your ministry
          </h2>
          <p className="text-lg text-slate-500">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={[
                'relative rounded-3xl p-8 flex flex-col',
                plan.popular
                  ? 'bg-gradient-to-br from-[#151022] via-purple-800 to-violet-700 text-white shadow-2xl shadow-purple-900/40 scale-105 ring-4 ring-purple-400/30'
                  : 'bg-gradient-to-br from-white to-purple-50/40 border border-purple-100/70 shadow-[0_4px_20px_-4px_rgba(124,58,237,0.12)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.2)] hover:-translate-y-1 transition-all duration-300',
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
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 text-xs font-extrabold px-5 py-1.5 rounded-full shadow-lg shadow-amber-500/30 uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-slate-800'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? 'text-white/70' : 'text-slate-500'}`}>
                  {plan.desc}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-2">
                  <span className={`text-4xl font-extrabold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                    {plan.lrd}
                  </span>
                  <span className={`text-sm font-semibold mb-1 ${plan.popular ? 'text-white/60' : 'text-slate-400'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${plan.popular ? 'text-yellow-300/80' : 'text-slate-400'}`}>
                  approx. {plan.usd} USD/mo
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <CheckCircle
                      className={`w-4.5 h-4.5 flex-shrink-0 ${plan.popular ? 'text-yellow-400' : 'text-purple-500'}`}
                      style={{ width: '1.1rem', height: '1.1rem' }}
                    />
                    <span className={`text-sm ${plan.popular ? 'text-white/85' : 'text-slate-600'}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={[
                  'block text-center font-bold py-3.5 px-6 rounded-2xl transition-all hover:-translate-y-0.5 text-sm',
                  plan.popular
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50'
                    : 'bg-[#111111] text-white shadow-md shadow-black/25 hover:bg-black',
                ].join(' ')}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400 mt-10">
          All prices are inclusive of VAT where applicable. Prices shown in Liberian Dollar (LRD) and USD.
        </p>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-20 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-950 mb-4 leading-tight">
          Ready to transform your ministry?
        </h2>
        <p className="text-lg text-amber-800 mb-8">
          Join ChurchFlow Liberia — the smart way to manage your ministry, members, and finances.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-base font-bold text-white bg-gradient-to-r from-[#5B00B8] to-[#3D108A] px-10 py-4 rounded-2xl shadow-xl shadow-purple-900/30 hover:from-violet-800 hover:to-purple-900 transition-all hover:-translate-y-1 hover:shadow-purple-900/50"
        >
          Get Started Free — It&apos;s Free for 14 Days
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  )
}

// ─── Footer link route map ────────────────────────────────────
const FOOTER_ROUTE_MAP = {
  'Features': '/features',
  'Pricing': '/pricing',
  'Changelog': '/changelog',
  'Roadmap': '/roadmap',
  'Status': '/status',
  'About Us': '/about',
  'Blog': '/blog',
  'Careers': '/careers',
  'Press': '/press',
  'Contact': '/contact',
  'Documentation': '/docs',
  'Help Centre': '/help',
  'Tutorials': '/tutorials',
  'Webinars': '/webinars',
  'Community': '/community',
  'Privacy Policy': '/privacy',
  'Terms of Service': '/terms',
  'Cookie Policy': '/cookies',
  'GDPR': '/gdpr',
}

// ─── Footer ───────────────────────────────────────────────────
function Footer() {
  const columns = [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Changelog', 'Roadmap', 'Status'],
    },
    {
      title: 'Company',
      links: ['About Us', 'Blog', 'Careers', 'Press', 'Contact'],
    },
    {
      title: 'Resources',
      links: ['Documentation', 'Help Centre', 'Tutorials', 'Webinars', 'Community'],
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
    },
  ]

  const socials = [
    { icon: Globe2, label: 'Facebook', href: '#' },
    { icon: MessageCircle, label: 'Twitter / X', href: '#' },
    { icon: Camera, label: 'Instagram', href: '#' },
    { icon: PlayCircle, label: 'YouTube', href: '#' },
  ]

  return (
    <footer id="contact" className="bg-[#151022] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="ChurchFlow Liberia" className="w-10 h-10 rounded-xl object-contain flex-shrink-0" />
              <span className="font-bold text-lg">
                ChurchFlow <span className="text-purple-300">Liberia</span>
              </span>
            </div>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs mb-6">
              The number-one church management platform built for Liberian churches. Manage members, offerings, and growth — all in one place.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-purple-600 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      to={FOOTER_ROUTE_MAP[link] || '#'}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 ChurchFlow Liberia. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built by{' '}
            <a
              href="https://wa.me/231770787020"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-2"
            >
              Morris L. Dorley Jr
            </a>
            {' '}·{' '}
            <a
              href="https://wa.me/231770787020"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              +231 77 078 7020
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen font-sans antialiased">
      <Navbar />
      <Hero />
      <Features />
      <StatsBar />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTABanner />
      <Footer />
      {/* AI Assistant — floats on all public pages */}
      <FloatingAIAssistant />
    </div>
  )
}
