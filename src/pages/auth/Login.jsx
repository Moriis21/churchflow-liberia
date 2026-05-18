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

        {/* Church image + headline */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Church building image */}
          <div className="relative w-full max-w-xs mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-white/5 blur-xl" />
            <img
              src="/church.png"
              alt="Church"
              className="relative w-full object-contain drop-shadow-2xl"
              style={{ filter: 'brightness(1.05) contrast(1.02)' }}
              onError={(e) => {
                // Fallback: hide if image not found
                e.target.style.display = 'none'
              }}
            />
          </div>

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
