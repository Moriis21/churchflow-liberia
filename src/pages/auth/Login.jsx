// ============================================================
// ChurchFlow Liberia — Login Page (Mobile-First, Fully Fixed)
// ============================================================
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  Wallet,
  CalendarCheck,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Input, Button } from '../../components/ui'
import { insforge } from '../../lib/insforge'

// ─── Church Building SVG Illustration ────────────────────────
// Matches the white church with steeple, cross, arched windows & steps
function ChurchIllustration() {
  return (
    <div className="relative flex items-end justify-center w-full max-w-[300px] mx-auto mb-6 drop-shadow-2xl">
      {/* Soft glow behind building */}
      <div className="absolute inset-0 rounded-full bg-white/10 blur-3xl scale-75" />

      <svg
        viewBox="0 0 300 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full"
        aria-label="Church building illustration"
      >
        {/* ── Ground shadow ── */}
        <ellipse cx="150" cy="272" rx="110" ry="8" fill="rgba(0,0,0,0.18)" />

        {/* ══ LEFT WING / NAVE ══ */}
        {/* Roof (pitched) */}
        <polygon points="28,168 90,130 90,210 28,210" fill="#D4A96A" />
        <polygon points="28,168 90,130 90,132 30,170" fill="#C49050" />
        {/* Wall */}
        <rect x="28" y="168" width="62" height="42" fill="white" />
        {/* Arched window left */}
        <rect x="42" y="175" width="20" height="22" rx="10" fill="#C8D8F0" stroke="#B0C4DE" strokeWidth="1.5" />
        <rect x="51" y="175" width="2" height="22" fill="#A8B8D0" />
        <rect x="42" y="185" width="20" height="2" fill="#A8B8D0" />
        {/* Wall base shadow */}
        <rect x="28" y="206" width="62" height="4" fill="#EEE" />

        {/* ══ RIGHT WING / TRANSEPT ══ */}
        {/* Roof */}
        <polygon points="272,168 210,130 210,210 272,210" fill="#D4A96A" />
        <polygon points="272,168 210,130 210,132 270,170" fill="#C49050" />
        {/* Wall */}
        <rect x="210" y="168" width="62" height="42" fill="white" />
        {/* Arched window right */}
        <rect x="238" y="175" width="20" height="22" rx="10" fill="#C8D8F0" stroke="#B0C4DE" strokeWidth="1.5" />
        <rect x="247" y="175" width="2" height="22" fill="#A8B8D0" />
        <rect x="238" y="185" width="20" height="2" fill="#A8B8D0" />
        {/* Wall base shadow */}
        <rect x="210" y="206" width="62" height="4" fill="#EEE" />

        {/* ══ MAIN BODY / NAVE ══ */}
        {/* Roof (wide pitched) */}
        <polygon points="85,148 215,148 215,210 85,210" fill="white" />
        {/* Roof slope left */}
        <polygon points="75,158 150,115 150,118 80,161" fill="#D4A96A" />
        {/* Roof slope right */}
        <polygon points="225,158 150,115 150,118 220,161" fill="#C49050" />
        {/* Roof main surface */}
        <polygon points="80,160 150,116 220,160 215,160 150,120 85,160" fill="#D4A96A" />
        {/* Main wall */}
        <rect x="85" y="160" width="130" height="50" fill="white" />
        {/* Front door arch */}
        <rect x="130" y="175" width="40" height="35" rx="20" fill="#8B7355" />
        <rect x="134" y="185" width="15" height="25" rx="3" fill="#6B5335" />
        <rect x="151" y="185" width="15" height="25" rx="3" fill="#6B5335" />
        {/* Door handle */}
        <circle cx="149" cy="200" r="2" fill="#D4A96A" />
        {/* Arched windows on nave */}
        <rect x="93" y="168" width="22" height="26" rx="11" fill="#C8D8F0" stroke="#B0C4DE" strokeWidth="1.5" />
        <rect x="103" y="168" width="2" height="26" fill="#A8B8D0" />
        <rect x="93" y="180" width="22" height="2" fill="#A8B8D0" />
        <rect x="185" y="168" width="22" height="26" rx="11" fill="#C8D8F0" stroke="#B0C4DE" strokeWidth="1.5" />
        <rect x="195" y="168" width="2" height="26" fill="#A8B8D0" />
        <rect x="185" y="180" width="22" height="2" fill="#A8B8D0" />
        {/* Cornerstone lines */}
        <line x1="85" y1="190" x2="87" y2="190" stroke="#DDD" strokeWidth="1" />
        <line x1="213" y1="190" x2="215" y2="190" stroke="#DDD" strokeWidth="1" />
        {/* Wall base shadow */}
        <rect x="85" y="206" width="130" height="4" fill="#EEE" />

        {/* ══ STEPS ══ */}
        <rect x="120" y="210" width="60" height="7"  rx="1" fill="#D0CCC8" />
        <rect x="114" y="217" width="72" height="7"  rx="1" fill="#C8C4C0" />
        <rect x="108" y="224" width="84" height="8"  rx="1" fill="#C0BCB8" />
        {/* Step shadows */}
        <rect x="120" y="210" width="60" height="2" fill="rgba(0,0,0,0.06)" />
        <rect x="114" y="217" width="72" height="2" fill="rgba(0,0,0,0.06)" />
        <rect x="108" y="224" width="84" height="2" fill="rgba(0,0,0,0.06)" />

        {/* ══ CENTRAL TOWER / STEEPLE ══ */}
        {/* Tower base */}
        <rect x="120" y="90" width="60" height="80" fill="white" />
        {/* Tower sides shadow */}
        <rect x="120" y="90" width="4" height="80" fill="rgba(0,0,0,0.05)" />
        <rect x="176" y="90" width="4" height="80" fill="rgba(0,0,0,0.08)" />
        {/* Louvered belfry openings */}
        <rect x="128" y="110" width="18" height="28" rx="9" fill="#9BA8C0" stroke="#8090B0" strokeWidth="1" />
        <line x1="137" y1="110" x2="137" y2="138" stroke="#7080A0" strokeWidth="1" />
        <rect x="154" y="110" width="18" height="28" rx="9" fill="#9BA8C0" stroke="#8090B0" strokeWidth="1" />
        <line x1="163" y1="110" x2="163" y2="138" stroke="#7080A0" strokeWidth="1" />
        {/* Horizontal lines on belfry */}
        <line x1="128" y1="124" x2="146" y2="124" stroke="#7080A0" strokeWidth="1" />
        <line x1="154" y1="124" x2="172" y2="124" stroke="#7080A0" strokeWidth="1" />
        {/* Tower cornice */}
        <rect x="116" y="86" width="68" height="8" fill="#ECECEC" />
        <rect x="116" y="86" width="68" height="2" fill="#DDD" />

        {/* ══ STEEPLE PYRAMID ══ */}
        {/* Pyramid body */}
        <polygon points="150,12 116,86 184,86" fill="#E8E4E0" />
        {/* Pyramid shading */}
        <polygon points="150,12 116,86 150,86" fill="rgba(0,0,0,0.06)" />
        {/* Steeple outline */}
        <polygon points="150,12 116,86 184,86" stroke="#D0CCC8" strokeWidth="1" fill="none" />

        {/* ══ CROSS (golden, prominent) ══ */}
        {/* Vertical beam */}
        <rect x="146" y="2" width="8" height="36" rx="4" fill="url(#goldGrad)" />
        {/* Horizontal beam */}
        <rect x="136" y="12" width="28" height="8" rx="4" fill="url(#goldGrad)" />
        {/* Cross glow */}
        <rect x="146.5" y="2.5" width="7" height="35" rx="3.5" fill="rgba(255,255,255,0.3)" />

        {/* ══ GRADIENT DEFS ══ */}
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// ─── Google SVG Icon ─────────────────────────────────────────
function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

const BENEFITS = [
  { icon: Users, text: 'Manage all your members in one place' },
  { icon: Wallet, text: 'Track tithes, offerings and expenses' },
  { icon: CalendarCheck, text: 'Monitor attendance with ease' },
]

const DEMO_ROLES = [
  { label: 'Church Admin', role: 'church_admin', color: 'from-violet-600 to-purple-700' },
  { label: 'Pastor',        role: 'pastor',       color: 'from-indigo-500 to-blue-600' },
  { label: 'Treasurer',     role: 'treasurer',    color: 'from-amber-500 to-yellow-600' },
]

// ─── Component ───────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate()
  const { login, demoLogin } = useAuth()

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [rememberMe,  setRememberMe]  = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [demoLoading, setDemoLoading] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors,      setErrors]      = useState({})

  function validate() {
    const e = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Minimum 6 characters'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const { error } = await login(email, password)
      if (error) { toast.error(error.message || 'Invalid credentials. Please try again.') }
      else { toast.success('Welcome back!'); navigate('/app/dashboard') }
    } catch { toast.error('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    try {
      await insforge.auth.signInWithOAuth({
        provider: 'google',
        redirectTo: `${window.location.origin}/app/dashboard`,
      })
    } catch {
      toast.error('Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  async function handleDemoLogin(role) {
    setDemoLoading(role)
    try {
      await demoLogin(role)
      toast.success(`Signed in as demo ${role.replace('_', ' ')}`)
      navigate('/app/dashboard')
    } catch { toast.error('Demo login failed.') }
    finally { setDemoLoading(null) }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ════════════ LEFT PANEL (desktop only) ════════════ */}
      <div
        className="hidden md:flex md:w-[52%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #1E1B4B 0%, #2D1B69 40%, #4C1D95 70%, #7C3AED 100%)' }}
      >
        {/* Blur blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-700/20 blur-3xl pointer-events-none" />

        {/* Back button */}
        <Link
          to="/landing"
          className="relative z-10 self-start flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.png" alt="ChurchFlow Liberia" className="w-12 h-12 object-contain rounded-xl" />
          <div>
            <p className="text-white font-bold text-lg leading-tight">ChurchFlow</p>
            <p className="text-amber-400 text-[11px] tracking-widest uppercase font-semibold">Liberia</p>
          </div>
        </div>

        {/* Church illustration + headline */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <ChurchIllustration />

          <h1 className="text-2xl xl:text-3xl font-extrabold text-white leading-tight max-w-sm">
            Stop losing church records.{' '}
            <span className="text-amber-400">Start building a smarter ministry.</span>
          </h1>
          <p className="mt-3 text-purple-200 text-sm max-w-xs leading-relaxed">
            Trusted by churches across Liberia to manage members, finances, and more.
          </p>
        </div>

        {/* Benefits */}
        <div className="relative z-10 space-y-3">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                <Icon className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-purple-100 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════ RIGHT PANEL ════════════ */}
      <div className="flex-1 flex flex-col justify-center bg-[#F5F4FF] min-h-screen md:min-h-0 overflow-y-auto">
        <div className="w-full max-w-[420px] mx-auto px-4 py-6 sm:px-6 sm:py-8">

          {/* ── Mobile header ─────────────────────────────── */}
          <div className="md:hidden mb-5">
            {/* Back link */}
            <Link
              to="/landing"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-purple-700 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            {/* Real logo — mobile */}
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="ChurchFlow Liberia"
                className="w-12 h-12 object-contain rounded-xl bg-[#1E1B4B]"
              />
              <div>
                <p className="text-[#1E1B4B] font-bold text-lg leading-tight">ChurchFlow</p>
                <p className="text-purple-500 text-[11px] tracking-widest uppercase font-semibold">Liberia</p>
              </div>
            </div>
          </div>

          {/* ── Login card ────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-100/60 border border-slate-100 p-5 sm:p-7">

            {/* Heading */}
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B]">Welcome Back</h2>
              <p className="mt-0.5 text-slate-500 text-sm">Sign in to your ChurchFlow account</p>
            </div>

            {/* ── Google OAuth ── */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 h-11 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.99] transition-all duration-200 mb-4 disabled:opacity-60"
            >
              {googleLoading ? (
                <svg className="w-4 h-4 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <GoogleIcon size={18} />
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">or sign in with email</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* ── Email / Password form ── */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                id="login-email"
                placeholder="pastor@church.lr"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
                icon={Mail}
                error={errors.email}
                required
                autoComplete="email"
                inputClassName="text-base"
              />

              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                id="login-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                icon={Lock}
                error={errors.password}
                required
                autoComplete="current-password"
                inputClassName="text-base"
                suffix={
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="pointer-events-auto text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full h-11">
                Sign In
              </Button>
            </form>

            {/* Register link */}
            <p className="mt-4 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-purple-600 hover:text-purple-800 font-semibold">
                Register here
              </Link>
            </p>
          </div>

          {/* ── Demo section ─────────────────────────────── */}
          <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[11px] text-slate-400 font-medium tracking-widest uppercase">Try a Demo</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <p className="text-xs text-center text-slate-400 mb-3">Explore ChurchFlow without an account</p>
            <div className="flex flex-col gap-2">
              {DEMO_ROLES.map(({ label, role, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleDemoLogin(role)}
                  disabled={demoLoading !== null}
                  className={[
                    'w-full flex items-center justify-between px-4 h-11 rounded-xl',
                    'bg-gradient-to-r text-white text-sm font-semibold',
                    'transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-[0.99]',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    color,
                  ].join(' ')}
                >
                  <span>Demo as {label}</span>
                  {demoLoading === role
                    ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <ChevronRight className="w-4 h-4 opacity-70" />
                  }
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Secure church management for Liberian ministries
          </p>
        </div>
      </div>
    </div>
  )
}
