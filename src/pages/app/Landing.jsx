// ============================================================
// ChurchFlow Liberia — Public Landing / Marketing Page
// ============================================================
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Cross,
  Users,
  CheckSquare,
  DollarSign,
  Calendar,
  MessageSquare,
  Video,
  Star,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  TrendingUp,
  Shield,
  Zap,
  Globe2,
  MessageCircle,
  Camera,
  PlayCircle,
  ChevronRight,
} from 'lucide-react'

// ─── Navbar ──────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-md shadow-purple-500/30">
              <Cross className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg text-slate-900 leading-tight">
              ChurchFlow{' '}
              <span className="text-purple-600">Liberia</span>
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 px-5 py-2 rounded-xl hover:from-violet-700 hover:to-purple-800 shadow-md shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:-translate-y-0.5"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-slate-100 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 px-4 flex flex-col gap-2">
              <Link
                to="/login"
                className="text-center text-sm font-semibold text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-center text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2.5 rounded-xl hover:from-violet-700 hover:to-purple-800 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1E1B4B] via-[#2D1F6E] to-[#4C1D95] pt-24 pb-20">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Built specifically for Liberian churches
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Stop Losing Church Records.{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Start Building a Smarter Ministry.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto mb-10">
            ChurchFlow helps Liberian churches manage members, track attendance, record offerings,
            and stay connected — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-bold text-amber-950 bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-4 rounded-2xl hover:from-yellow-300 hover:to-amber-400 shadow-xl shadow-yellow-500/30 transition-all hover:-translate-y-1 hover:shadow-yellow-500/50"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-white border-2 border-white/30 px-8 py-4 rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm">
              <Video className="w-5 h-5 text-white/80" />
              Watch Demo
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-16">
            {[
              { icon: Users, label: '500+ Churches' },
              { icon: TrendingUp, label: '25,000+ Members Tracked' },
              { icon: Shield, label: '99.9% Uptime' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white/85 text-sm font-medium px-5 py-2.5 rounded-full"
              >
                <Icon className="w-4 h-4 text-yellow-400" />
                {label}
              </div>
            ))}
          </div>

          {/* Dashboard mockup */}
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/50 to-purple-600/50 rounded-3xl blur-xl" />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
              {/* Mock header bar */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="bg-white/10 rounded-lg px-6 py-1.5 text-white/50 text-xs">
                  app.churchflow.lr/dashboard
                </div>
                <div className="w-16" />
              </div>

              {/* Mock stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total Members', value: '248', color: 'from-violet-500 to-purple-700' },
                  { label: "Today's Attendance", value: '186', color: 'from-amber-400 to-yellow-500' },
                  { label: 'Total Offerings', value: 'LRD 125,750', color: 'from-emerald-400 to-teal-600' },
                  { label: 'Visitors Today', value: '4', color: 'from-blue-500 to-indigo-600' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 border border-white/10 rounded-xl p-4">
                    <p className="text-white/50 text-xs mb-1">{stat.label}</p>
                    <p className="text-white font-bold text-lg leading-none">{stat.value}</p>
                    <div className={`mt-2 h-1 rounded-full bg-gradient-to-r ${stat.color} w-3/4 opacity-70`} />
                  </div>
                ))}
              </div>

              {/* Mock charts row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-white/10 border border-white/10 rounded-xl p-4 h-32">
                  <p className="text-white/50 text-xs mb-3">Attendance Overview</p>
                  <div className="flex items-end gap-1.5 h-16">
                    {[60, 75, 50, 90, 70, 85, 80].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-violet-500 to-purple-400 opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="bg-white/10 border border-white/10 rounded-xl p-4 h-32">
                  <p className="text-white/50 text-xs mb-3">Offerings</p>
                  <div className="flex items-center justify-center h-16">
                    <div className="relative w-14 h-14">
                      <div className="w-14 h-14 rounded-full border-4 border-violet-400/50" />
                      <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-amber-400 border-r-amber-400 rotate-45" />
                      <div className="absolute inset-2 flex items-center justify-center">
                        <span className="text-white/70 text-[9px] font-semibold">62%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Users,
    title: 'Member Management',
    desc: 'Maintain complete profiles for every member — contact details, departments, and spiritual records in one place.',
  },
  {
    icon: CheckSquare,
    title: 'Attendance Tracking',
    desc: 'Record and analyse Sunday and midweek attendance across all services and branches with ease.',
  },
  {
    icon: DollarSign,
    title: 'Finance & Offerings',
    desc: 'Log tithes, offerings, and special donations. Generate transparent financial reports in LRD and USD.',
  },
  {
    icon: Calendar,
    title: 'Events Management',
    desc: 'Plan, promote, and track church programmes from conventions to outreach campaigns.',
  },
  {
    icon: MessageSquare,
    title: 'SMS & Notifications',
    desc: 'Send bulk SMS announcements and birthday greetings to your congregation instantly.',
  },
  {
    icon: Video,
    title: 'Live Streaming',
    desc: 'Stream services to YouTube, Facebook, or Zoom and embed sermon archives directly in ChurchFlow.',
  },
]

function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4 border border-purple-100">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Everything your church needs in one place
          </h2>
          <p className="text-lg text-slate-500">
            Purpose-built tools to help Liberian churches grow, stay organised, and minister effectively.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.15)] hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 border border-purple-100 flex items-center justify-center mb-5 group-hover:from-violet-600 group-hover:to-purple-700 group-hover:border-transparent transition-all duration-300 shadow-sm">
                <Icon className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: '500+', label: 'Churches' },
    { value: '25,000+', label: 'Members Managed' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
  ]

  return (
    <section className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
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
function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Quick Setup',
      desc: 'Create your church profile in minutes. Add your church name, location, branches, and branding. No technical skills required.',
    },
    {
      num: '02',
      title: 'Add Your Members',
      desc: 'Import or manually add your congregation. Assign departments, record baptism status, and track membership history.',
    },
    {
      num: '03',
      title: 'Track & Grow',
      desc: 'Record attendance, offerings, and events. Use built-in analytics to understand and grow your ministry.',
    },
  ]

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200" />

          {steps.map(({ num, title, desc }, i) => (
            <div key={num} className="flex flex-col items-center text-center relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1E1B4B] to-purple-700 flex items-center justify-center mb-6 shadow-xl shadow-purple-900/30 relative z-10">
                <span className="text-3xl font-black text-white">{num}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">{desc}</p>
              {i < steps.length - 1 && (
                <ChevronRight className="md:hidden text-purple-300 w-8 h-8 mt-6 rotate-90" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Pastor David Kollie',
    role: 'Senior Pastor',
    church: 'Grace Assembly, Monrovia',
    quote:
      "ChurchFlow transformed how we operate Grace Assembly. Tracking 300+ members used to be a nightmare — now it takes minutes. Our offerings have also become more transparent and our deacons love it.",
    stars: 5,
    img: 'https://i.pravatar.cc/150?img=14',
  },
  {
    name: 'Sec. Mary Dahn',
    role: 'Church Secretary',
    church: 'Faith Tabernacle, Paynesville',
    quote:
      "Before ChurchFlow, we had attendance sheets scattered everywhere. Now I generate a full attendance report right from my phone every Sunday. This is a blessing for our ministry.",
    stars: 5,
    img: 'https://i.pravatar.cc/150?img=16',
  },
  {
    name: 'Elder James Toe',
    role: 'Head of Finance',
    church: 'New Life Church, Buchanan',
    quote:
      "The finance module is outstanding. We record every tithe and offering in LRD and USD, and the monthly reports keep our congregation informed and our leaders accountable.",
    stars: 5,
    img: 'https://i.pravatar.cc/150?img=18',
  },
]

function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4 border border-purple-100">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Trusted by church leaders across Liberia
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-slate-100 rounded-2xl p-7 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-100"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role} · {t.church}</p>
                </div>
              </div>
            </div>
          ))}
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
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
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
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={[
                'relative rounded-3xl p-8 flex flex-col',
                plan.popular
                  ? 'bg-gradient-to-br from-[#1E1B4B] via-purple-800 to-violet-700 text-white shadow-2xl shadow-purple-900/40 scale-105 ring-4 ring-purple-400/30'
                  : 'bg-white border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]',
              ].join(' ')}
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
                  ≈ {plan.usd}/mo
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
                    : 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-purple-500/25 hover:shadow-purple-500/40',
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
          Join 500+ churches already using ChurchFlow Liberia to grow smarter and minister better.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-base font-bold text-white bg-gradient-to-r from-violet-700 to-purple-800 px-10 py-4 rounded-2xl shadow-xl shadow-purple-900/30 hover:from-violet-800 hover:to-purple-900 transition-all hover:-translate-y-1 hover:shadow-purple-900/50"
        >
          Get Started Free — It's Free for 14 Days
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  )
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
    <footer id="contact" className="bg-[#1E1B4B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-md">
                <Cross className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg">
                ChurchFlow <span className="text-purple-300">Liberia</span>
              </span>
            </div>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs mb-6">
              The #1 church management platform built for Liberian churches. Manage members, offerings, and growth — all in one place.
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
                    <a
                      href="#"
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40 text-center sm:text-left">
            Built for Liberia. Designed for Churches. Powered by Growth.
          </p>
          <p className="text-sm text-white/35">
            © {new Date().getFullYear()} ChurchFlow Liberia. All rights reserved.
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
    </div>
  )
}
