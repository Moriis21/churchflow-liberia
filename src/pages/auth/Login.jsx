// ============================================================
// ChurchFlow Liberia — Login Page
// ============================================================
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Users,
  Wallet,
  CalendarCheck,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Input, Button } from '../../components/ui'

// ─── Left-panel decorative church graphic ────────────────────
function ChurchGraphic() {
  return (
    <div className="relative flex items-center justify-center w-48 h-48 mx-auto mb-8">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse" />
      <div className="absolute inset-4 rounded-full bg-white/5" />
      {/* Cross */}
      <div className="relative z-10 flex flex-col items-center gap-0">
        {/* Vertical beam */}
        <div className="w-5 h-24 bg-gradient-to-b from-amber-300 to-amber-500 rounded-full shadow-lg shadow-amber-400/40" />
        {/* Horizontal beam */}
        <div
          className="w-20 h-5 bg-gradient-to-r from-amber-300 to-amber-500 rounded-full shadow-lg shadow-amber-400/40"
          style={{ marginTop: '-68px', marginBottom: '0' }}
        />
      </div>
      {/* Soft radial glow */}
      <div className="absolute inset-8 rounded-full bg-amber-400/10 blur-xl" />
    </div>
  )
}

const BENEFITS = [
  { icon: Users, text: 'Manage all your members in one place' },
  { icon: Wallet, text: 'Track tithes, offerings & expenses' },
  { icon: CalendarCheck, text: 'Monitor attendance with ease' },
]

const DEMO_ROLES = [
  { label: 'Church Admin', role: 'church_admin', color: 'from-violet-500 to-purple-600' },
  { label: 'Pastor', role: 'pastor', color: 'from-indigo-500 to-blue-600' },
  { label: 'Treasurer', role: 'treasurer', color: 'from-amber-500 to-yellow-600' },
]

// ─── Component ───────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate()
  const { login, demoLogin } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(null)
  const [errors, setErrors] = useState({})

  // ── Validation ──────────────────────────────────────────
  function validate() {
    const errs = {}
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters'
    return errs
  }

  // ── Submit ───────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const { error } = await login(email, password)
      if (error) {
        toast.error(error.message || 'Invalid credentials. Please try again.')
      } else {
        toast.success('Welcome back!')
        navigate('/app/dashboard')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Demo login ───────────────────────────────────────────
  async function handleDemoLogin(role) {
    setDemoLoading(role)
    try {
      await demoLogin(role)
      toast.success(`Signed in as demo ${role.replace('_', ' ')}`)
      navigate('/app/dashboard')
    } catch {
      toast.error('Demo login failed. Please try again.')
    } finally {
      setDemoLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #2D1B69 40%, #4C1D95 70%, #7C3AED 100%)' }}
      >
        {/* Background decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-700/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-800/10 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ChurchFlow Liberia" className="w-14 h-14 object-contain rounded-xl" />
            <div>
              <p className="text-white font-bold text-xl leading-tight">ChurchFlow</p>
              <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold">Liberia</p>
            </div>
          </div>
        </div>

        {/* Central content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <ChurchGraphic />

          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight max-w-sm">
            Stop losing church records.{' '}
            <span className="text-amber-400">Start building a smarter ministry.</span>
          </h1>

          <p className="mt-4 text-purple-200 text-base max-w-xs leading-relaxed">
            Trusted by churches across Liberia to manage members, finances, and more.
          </p>
        </div>

        {/* Benefits */}
        <div className="relative z-10 space-y-4">
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

      {/* ── Right panel ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg leading-none">✝</span>
            </div>
            <div>
              <p className="text-slate-800 font-bold text-lg leading-tight">ChurchFlow</p>
              <p className="text-purple-400 text-xs tracking-widest uppercase">Liberia</p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-[#1E1B4B]">Welcome Back</h2>
              <p className="mt-1 text-slate-500 text-sm">Sign in to your ChurchFlow account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                id="login-email"
                name="email"
                placeholder="pastor@church.lr"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
                icon={Mail}
                error={errors.email}
                required
                autoComplete="email"
              />

              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                  icon={Lock}
                  error={errors.password}
                  required
                  autoComplete="current-password"
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="pointer-events-auto text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">or try a demo</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Demo login */}
            <div className="space-y-2.5">
              <p className="text-xs text-center text-slate-500 mb-3">
                Explore ChurchFlow without an account
              </p>
              {DEMO_ROLES.map(({ label, role, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleDemoLogin(role)}
                  disabled={demoLoading !== null}
                  className={[
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl',
                    'bg-gradient-to-r text-white text-sm font-semibold',
                    'transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-[0.99]',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    color,
                  ].join(' ')}
                >
                  <span>Demo as {label}</span>
                  {demoLoading === role ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  )}
                </button>
              ))}
            </div>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Secure church management for Liberian ministries
          </p>
        </div>
      </div>
    </div>
  )
}
