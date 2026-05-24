// ============================================================
// ChurchFlow Liberia — Register Page (2-step form)
// ============================================================
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Building2,
  MapPin,
  Users,
  GitBranch,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Globe,
  Church,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Input, Button } from '../../components/ui'
import { insforge } from '../../lib/insforge'

// ─── Church SVG Illustration (same as Login page) ────────────
function ChurchIllustration() {
  return (
    <div className="relative flex items-end justify-center w-full max-w-[300px] mx-auto mb-6 drop-shadow-2xl">
      <div className="absolute inset-0 rounded-full bg-white/10 blur-3xl scale-75" />
      <svg viewBox="0 0 300 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative w-full" aria-label="Church building">
        <ellipse cx="150" cy="272" rx="110" ry="8" fill="rgba(0,0,0,0.18)" />
        <polygon points="28,168 90,130 90,210 28,210" fill="#D4A96A" />
        <polygon points="28,168 90,130 90,132 30,170" fill="#C49050" />
        <rect x="28" y="168" width="62" height="42" fill="white" />
        <rect x="42" y="175" width="20" height="22" rx="10" fill="#C8D8F0" stroke="#B0C4DE" strokeWidth="1.5" />
        <rect x="51" y="175" width="2" height="22" fill="#A8B8D0" />
        <rect x="42" y="185" width="20" height="2" fill="#A8B8D0" />
        <rect x="28" y="206" width="62" height="4" fill="#EEE" />
        <polygon points="272,168 210,130 210,210 272,210" fill="#D4A96A" />
        <polygon points="272,168 210,130 210,132 270,170" fill="#C49050" />
        <rect x="210" y="168" width="62" height="42" fill="white" />
        <rect x="238" y="175" width="20" height="22" rx="10" fill="#C8D8F0" stroke="#B0C4DE" strokeWidth="1.5" />
        <rect x="247" y="175" width="2" height="22" fill="#A8B8D0" />
        <rect x="238" y="185" width="20" height="2" fill="#A8B8D0" />
        <rect x="210" y="206" width="62" height="4" fill="#EEE" />
        <polygon points="85,148 215,148 215,210 85,210" fill="white" />
        <polygon points="80,160 150,116 220,160 215,160 150,120 85,160" fill="#D4A96A" />
        <rect x="85" y="160" width="130" height="50" fill="white" />
        <rect x="130" y="175" width="40" height="35" rx="20" fill="#8B7355" />
        <rect x="134" y="185" width="15" height="25" rx="3" fill="#6B5335" />
        <rect x="151" y="185" width="15" height="25" rx="3" fill="#6B5335" />
        <circle cx="149" cy="200" r="2" fill="#D4A96A" />
        <rect x="93" y="168" width="22" height="26" rx="11" fill="#C8D8F0" stroke="#B0C4DE" strokeWidth="1.5" />
        <rect x="103" y="168" width="2" height="26" fill="#A8B8D0" />
        <rect x="93" y="180" width="22" height="2" fill="#A8B8D0" />
        <rect x="185" y="168" width="22" height="26" rx="11" fill="#C8D8F0" stroke="#B0C4DE" strokeWidth="1.5" />
        <rect x="195" y="168" width="2" height="26" fill="#A8B8D0" />
        <rect x="185" y="180" width="22" height="2" fill="#A8B8D0" />
        <rect x="85" y="206" width="130" height="4" fill="#EEE" />
        <rect x="120" y="210" width="60" height="7" rx="1" fill="#D0CCC8" />
        <rect x="114" y="217" width="72" height="7" rx="1" fill="#C8C4C0" />
        <rect x="108" y="224" width="84" height="8" rx="1" fill="#C0BCB8" />
        <rect x="120" y="90" width="60" height="80" fill="white" />
        <rect x="128" y="110" width="18" height="28" rx="9" fill="#9BA8C0" stroke="#8090B0" strokeWidth="1" />
        <line x1="137" y1="110" x2="137" y2="138" stroke="#7080A0" strokeWidth="1" />
        <rect x="154" y="110" width="18" height="28" rx="9" fill="#9BA8C0" stroke="#8090B0" strokeWidth="1" />
        <line x1="163" y1="110" x2="163" y2="138" stroke="#7080A0" strokeWidth="1" />
        <rect x="116" y="86" width="68" height="8" fill="#ECECEC" />
        <rect x="116" y="86" width="68" height="2" fill="#DDD" />
        <polygon points="150,12 116,86 184,86" fill="#E8E4E0" />
        <polygon points="150,12 116,86 150,86" fill="rgba(0,0,0,0.06)" />
        <rect x="146" y="2" width="8" height="36" rx="4" fill="url(#goldGrad2)" />
        <rect x="136" y="12" width="28" height="8" rx="4" fill="url(#goldGrad2)" />
        <defs>
          <linearGradient id="goldGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// ─── Step progress indicator ─────────────────────────────────
function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {[1, 2].map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex items-center gap-2">
            <div
              className={[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 flex-shrink-0',
                currentStep === step
                  ? 'bg-gradient-to-br from-[#151022] to-[#5B00B8] text-white shadow-lg shadow-purple-500/30'
                  : currentStep > step
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-400',
              ].join(' ')}
            >
              {currentStep > step ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                step
              )}
            </div>
            <span
              className={[
                'text-sm font-medium transition-colors hidden xs:inline',
                currentStep === step ? 'text-purple-700' : currentStep > step ? 'text-green-600' : 'text-slate-400',
              ].join(' ')}
            >
              {step === 1 ? 'Church Info' : 'Admin Account'}
            </span>
          </div>
          {i < 1 && (
            <div className="flex-1 mx-3 h-px bg-slate-200 relative overflow-hidden min-w-[24px]">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-500"
                style={{ width: currentStep > 1 ? '100%' : '0%' }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Member Self-Registration Form ───────────────────────────
function MemberRegisterForm({ pendingChurchName, pendingChurchId }) {
  const navigate = useNavigate()
  const { register, verifyEmail, resendVerification, pendingVerificationEmail } = useAuth()

  const [verifyStep, setVerifyStep] = useState(false)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const { data, error } = await register(
        form.email,
        form.password,
        form.fullName,
        pendingChurchName,
        ROLES.MEMBER,
        pendingChurchId,
      )
      if (error) {
        toast.error(error.message || 'Registration failed. Please try again.')
      } else if (data?.requireEmailVerification) {
        setVerifyStep(true)
        toast.success('Check your email for a 6-digit verification code.')
      } else {
        sessionStorage.removeItem('pending_church_id')
        sessionStorage.removeItem('pending_church_name')
        toast.success('Welcome to ' + pendingChurchName + '!')
        navigate('/app/dashboard')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    if (otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit code from your email.')
      return
    }
    setLoading(true)
    try {
      const { error } = await verifyEmail(otp.trim())
      if (error) {
        toast.error(error.message || 'Invalid or expired code. Please try again.')
      } else {
        sessionStorage.removeItem('pending_church_id')
        sessionStorage.removeItem('pending_church_name')
        toast.success('Email verified! Welcome to ' + pendingChurchName + '.')
        navigate('/app/dashboard')
      }
    } catch {
      toast.error('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // OTP verification screen
  if (verifyStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#151022] mb-2">Verify Your Email</h2>
          <p className="text-slate-500 mb-1 text-sm">We sent a 6-digit code to</p>
          <p className="font-semibold text-purple-700 mb-6 text-sm">{pendingVerificationEmail || form.email}</p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-3xl font-bold tracking-[0.5em] border-2 border-purple-200 rounded-xl px-4 py-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-[#151022] placeholder-slate-300"
            />
            <Button type="submit" variant="primary" className="w-full h-12" loading={loading}>
              Verify &amp; Continue
            </Button>
          </form>
          <button
            type="button"
            onClick={resendVerification}
            className="mt-4 text-sm text-purple-600 hover:underline"
          >
            Didn&apos;t receive it? Resend code
          </button>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setVerifyStep(false)}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Back to registration
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] px-4 py-8">
      {/* Decorative blobs */}
      <div className="fixed -top-32 -left-32 w-96 h-96 rounded-full bg-purple-400/10 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[460px]">
        {/* Logo row */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#151022] to-[#5B00B8] flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-lg leading-none">+</span>
          </div>
          <div>
            <p className="text-[#151022] font-bold text-lg leading-tight">ChurchFlow</p>
            <p className="text-[#F59E0B] text-xs tracking-widest uppercase font-semibold">Liberia</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
          {/* Church banner */}
          <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#151022] to-[#5B00B8]">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Church className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-purple-200 font-medium">Joining</p>
              <p className="text-white font-bold text-sm leading-tight">{pendingChurchName}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Mobile back link */}
            <Link
              to="/landing"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-purple-700 transition-colors mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-[#151022]">Create Your Account</h2>
              <p className="mt-1 text-slate-500 text-sm">Fill in your details to join as a member</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Input
                label="Full Name"
                id="member-name"
                name="fullName"
                placeholder="e.g. Mary Dahn"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                icon={User}
                error={errors.fullName}
                required
                autoComplete="name"
                inputClassName="text-base"
              />

              <Input
                label="Phone Number"
                id="member-phone"
                name="phone"
                placeholder="+231 770 000 000"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                error={errors.phone}
                autoComplete="tel"
                inputClassName="text-base"
              />

              <Input
                label="Email Address"
                type="email"
                id="member-email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                icon={Mail}
                error={errors.email}
                required
                autoComplete="email"
                inputClassName="text-base"
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="member-password"
                name="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                icon={Lock}
                error={errors.password}
                required
                autoComplete="new-password"
                inputClassName="text-base"
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

              <Input
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                id="member-confirm-password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                icon={Lock}
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
                inputClassName="text-base"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="pointer-events-auto text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Password strength */}
              {form.password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => {
                      const strength = Math.min(Math.floor(form.password.length / 3), 4)
                      return (
                        <div
                          key={level}
                          className={[
                            'flex-1 h-1.5 rounded-full transition-colors duration-300',
                            level <= strength
                              ? strength <= 1 ? 'bg-red-400'
                              : strength <= 2 ? 'bg-amber-400'
                              : strength <= 3 ? 'bg-blue-400'
                              : 'bg-green-500'
                              : 'bg-slate-100',
                          ].join(' ')}
                        />
                      )
                    })}
                  </div>
                  <p className="text-xs text-slate-400">
                    {form.password.length < 4 ? 'Too short'
                      : form.password.length < 7 ? 'Weak password'
                      : form.password.length < 10 ? 'Fair password'
                      : 'Strong password'}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2 h-12"
              >
                Join Church
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          By joining, you agree to our Terms of Service &amp; Privacy Policy
        </p>
      </div>
    </div>
  )
}

// ─── Demo role config (same as Login page) ───────────────────
const DEMO_ROLES = [
  { label: 'Church Admin', role: 'church_admin', color: 'from-[#151022] to-[#5B00B8]' },
  { label: 'Pastor',       role: 'pastor',       color: 'from-indigo-500 to-blue-600'   },
  { label: 'Treasurer',    role: 'treasurer',    color: 'from-amber-500 to-yellow-600'  },
]

// ─── Component ───────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate()
  const { register, verifyEmail, resendVerification, pendingVerificationEmail, demoLogin } = useAuth()
  const [verifyStep, setVerifyStep] = useState(false)
  const [otp, setOtp] = useState('')
  const [demoLoading, setDemoLoading] = useState(null)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // ── Demo login handler ───────────────────────────────────
  async function handleDemoLogin(role) {
    setDemoLoading(role)
    try {
      await demoLogin(role)
      toast.success(`Signed in as demo ${role.replace('_', ' ')}`)
      navigate('/app/dashboard')
    } catch (err) {
      toast.error('Demo login failed. Please try again.')
    } finally {
      setDemoLoading(null)
    }
  }

  // ── Form state ───────────────────────────────────────────
  const [churchForm, setChurchForm] = useState({
    churchName: '',
    location: '',
    memberCount: '',
    needsBranches: '',
  })

  const [adminForm, setAdminForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'church_admin',
  })

  const [errors, setErrors] = useState({})

  // ── Detect member invite mode ────────────────────────────
  const searchParams = new URLSearchParams(window.location.search)
  const isMemberMode = searchParams.get('role') === 'member'
  const pendingChurchId = sessionStorage.getItem('pending_church_id')
  const pendingChurchName = sessionStorage.getItem('pending_church_name')

  // If arriving via invite link, render the simplified member form
  if (isMemberMode && pendingChurchId) {
    return (
      <MemberRegisterForm
        pendingChurchName={pendingChurchName || 'Your Church'}
        pendingChurchId={pendingChurchId}
      />
    )
  }

  // ── Field updaters ───────────────────────────────────────
  function updateChurch(field, value) {
    setChurchForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  function updateAdmin(field, value) {
    setAdminForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  // ── Validation ───────────────────────────────────────────
  function validateStep1() {
    const errs = {}
    if (!churchForm.churchName.trim()) errs.churchName = 'Church name is required'
    if (!churchForm.location.trim()) errs.location = 'Location is required'
    if (!churchForm.memberCount) errs.memberCount = 'Please select a member range'
    if (!churchForm.needsBranches) errs.needsBranches = 'Please select an option'
    return errs
  }

  function validateStep2() {
    const errs = {}
    if (!adminForm.fullName.trim()) errs.fullName = 'Full name is required'
    if (!adminForm.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email)) errs.email = 'Enter a valid email'
    if (!adminForm.password) errs.password = 'Password is required'
    else if (adminForm.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (!adminForm.confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (adminForm.password !== adminForm.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  // ── Navigation ───────────────────────────────────────────
  function handleNext() {
    const errs = validateStep1()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStep(2)
  }

  function handleBack() {
    setErrors({})
    setStep(1)
  }

  // ── Submit registration ──────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validateStep2()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const { data, error } = await register(
        adminForm.email,
        adminForm.password,
        adminForm.fullName,
        churchForm.churchName,
        ROLES.CHURCH_ADMIN,
      )
      if (error) {
        toast.error(error.message || 'Registration failed. Please try again.')
      } else if (data?.requireEmailVerification) {
        // Backend requires code verification — show OTP input
        setVerifyStep(true)
        toast.success('Check your email for a 6-digit verification code.')
      } else {
        toast.success('Church registered successfully! Welcome to ChurchFlow.')
        navigate('/app/dashboard')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Verify OTP ───────────────────────────────────────────
  async function handleVerify(e) {
    e.preventDefault()
    if (otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit code from your email.')
      return
    }
    setLoading(true)
    try {
      const { error } = await verifyEmail(otp.trim())
      if (error) {
        toast.error(error.message || 'Invalid or expired code. Please try again.')
      } else {
        toast.success('Email verified! Welcome to ChurchFlow Liberia.')
        navigate('/app/dashboard')
      }
    } catch {
      toast.error('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const memberRanges = [
    { value: 'under50', label: 'Under 50 members' },
    { value: '50-150', label: '50 – 150 members' },
    { value: '150-500', label: '150 – 500 members' },
    { value: '500+', label: 'Over 500 members' },
  ]

  // ── OTP Verification Screen ─────────────────────────────
  if (verifyStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#151022] mb-2">Verify Your Email</h2>
          <p className="text-slate-500 mb-1 text-sm">We sent a 6-digit code to</p>
          <p className="font-semibold text-purple-700 mb-6 text-sm">{pendingVerificationEmail || adminForm.email}</p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-3xl font-bold tracking-[0.5em] border-2 border-purple-200 rounded-xl px-4 py-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-[#151022] placeholder-slate-300"
            />
            <Button type="submit" variant="primary" className="w-full h-12" loading={loading}>
              Verify &amp; Continue
            </Button>
          </form>
          <button
            type="button"
            onClick={resendVerification}
            className="mt-4 text-sm text-purple-600 hover:underline"
          >
            Didn&apos;t receive it? Resend code
          </button>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setVerifyStep(false)}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Back to registration
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ════════════ LEFT PANEL (matches Login exactly) ════════════ */}
      <div
        className="hidden md:flex md:w-[52%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #151022 0%, #2D1B69 40%, #3D108A 70%, #8A19FF 100%)' }}
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

        {/* Church illustration + headline — identical to Login */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <ChurchIllustration />
          <h1 className="text-2xl xl:text-3xl font-extrabold text-white leading-tight max-w-sm">
            Register Your Church.{' '}
            <span className="text-amber-400">Start Managing Smarter.</span>
          </h1>
          <p className="mt-3 text-purple-200 text-sm max-w-xs leading-relaxed">
            Set up your church on ChurchFlow in minutes. Manage members, track attendance, and record offerings all in one place.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3">
          {[
            'Free to get started — no credit card',
            'No technical skills required',
            'Secure & private church data',
            'Multi-branch support available',
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-purple-100 text-sm">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════ RIGHT PANEL ════════════ */}
      <div className="flex-1 flex flex-col justify-start md:justify-center bg-[#F5F4FF] overflow-y-auto">
        <div className="w-full max-w-[480px] mx-auto px-4 py-6 sm:px-6 sm:py-8">

          {/* ── Mobile header (matches Login mobile header) ── */}
          <div className="md:hidden mb-5">
            <Link
              to="/landing"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-purple-700 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="ChurchFlow Liberia"
                className="w-12 h-12 object-contain rounded-xl bg-[#151022]"
              />
              <div>
                <p className="text-[#151022] font-bold text-lg leading-tight">ChurchFlow</p>
                <p className="text-purple-500 text-[11px] tracking-widest uppercase font-semibold">Liberia</p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-100/60 border border-slate-100 p-5 sm:p-7">
            {/* Header */}
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#151022]">Register Your Church</h2>
              <p className="mt-0.5 text-slate-500 text-sm">Set up ChurchFlow for your ministry</p>
            </div>

            {/* Step indicator */}
            <StepIndicator currentStep={step} />

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="space-y-5">
                <Input
                  label="Church Name"
                  id="church-name"
                  name="churchName"
                  placeholder="e.g. Grace Community Church"
                  value={churchForm.churchName}
                  onChange={(e) => updateChurch('churchName', e.target.value)}
                  icon={Building2}
                  error={errors.churchName}
                  required
                  inputClassName="text-base"
                />

                <Input
                  label="Church Location (City)"
                  id="church-location"
                  name="location"
                  placeholder="e.g. Monrovia"
                  value={churchForm.location}
                  onChange={(e) => updateChurch('location', e.target.value)}
                  icon={MapPin}
                  error={errors.location}
                  required
                  inputClassName="text-base"
                />

                {/* Member count select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    <Users className="w-4 h-4 text-slate-400" />
                    Approximate Number of Members
                    <span className="text-red-500 text-base leading-none" aria-hidden="true">*</span>
                  </label>
                  <select
                    value={churchForm.memberCount}
                    onChange={(e) => updateChurch('memberCount', e.target.value)}
                    className={[
                      'w-full rounded-xl border text-base text-slate-800 bg-white px-4 py-2.5',
                      'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
                      errors.memberCount
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                        : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100 hover:border-slate-300',
                    ].join(' ')}
                  >
                    <option value="">Select member range</option>
                    {memberRanges.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {errors.memberCount && (
                    <p className="text-xs text-red-500 mt-0.5">{errors.memberCount}</p>
                  )}
                </div>

                {/* Branch support */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    <GitBranch className="w-4 h-4 text-slate-400" />
                    Do you need branch/multi-location support?
                    <span className="text-red-500 text-base leading-none" aria-hidden="true">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'yes', label: 'Yes, we have branches' },
                      { value: 'no', label: 'No, single location' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={[
                          'flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200',
                          churchForm.needsBranches === opt.value
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                        ].join(' ')}
                      >
                        <input
                          type="radio"
                          name="needsBranches"
                          value={opt.value}
                          checked={churchForm.needsBranches === opt.value}
                          onChange={(e) => updateChurch('needsBranches', e.target.value)}
                          className="sr-only"
                        />
                        <div
                          className={[
                            'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                            churchForm.needsBranches === opt.value
                              ? 'border-purple-600 bg-purple-600'
                              : 'border-slate-300',
                          ].join(' ')}
                        >
                          {churchForm.needsBranches === opt.value && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium leading-snug">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.needsBranches && (
                    <p className="text-xs text-red-500">{errors.needsBranches}</p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  icon={ChevronRight}
                  iconPosition="right"
                  className="w-full mt-2 h-12"
                  onClick={handleNext}
                >
                  Continue to Admin Setup
                </Button>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* Google OAuth */}
                <div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await insforge.auth.signInWithOAuth({
                          provider: 'google',
                          redirectTo: `${window.location.origin}/app/dashboard`,
                        })
                        toast.success('Signed in with Google. Please complete your church setup.')
                        navigate('/app/dashboard')
                      } catch {
                        toast.error('Google sign-in failed. Please try again.')
                      }
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-3 h-12 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium">or create account with email</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <Input
                  label="Full Name"
                  id="admin-name"
                  name="fullName"
                  placeholder="e.g. Pastor John Doe"
                  value={adminForm.fullName}
                  onChange={(e) => updateAdmin('fullName', e.target.value)}
                  icon={User}
                  error={errors.fullName}
                  required
                  autoComplete="name"
                  inputClassName="text-base"
                />

                <Input
                  label="Email Address"
                  type="email"
                  id="admin-email"
                  name="email"
                  placeholder="admin@church.lr"
                  value={adminForm.email}
                  onChange={(e) => updateAdmin('email', e.target.value)}
                  icon={Mail}
                  error={errors.email}
                  required
                  autoComplete="email"
                  inputClassName="text-base"
                />

                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="admin-password"
                  name="password"
                  placeholder="Min. 8 characters"
                  value={adminForm.password}
                  onChange={(e) => updateAdmin('password', e.target.value)}
                  icon={Lock}
                  error={errors.password}
                  required
                  autoComplete="new-password"
                  inputClassName="text-base"
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

                <Input
                  label="Confirm Password"
                  type={showConfirm ? 'text' : 'password'}
                  id="admin-confirm-password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={adminForm.confirmPassword}
                  onChange={(e) => updateAdmin('confirmPassword', e.target.value)}
                  icon={Lock}
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                  inputClassName="text-base"
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="pointer-events-auto text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                {/* Role display (read-only, defaulting to Church Admin) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Role</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    Church Admin (default)
                  </div>
                  <p className="text-xs text-slate-400">
                    You can assign additional roles after setup.
                  </p>
                </div>

                {/* Password strength */}
                {adminForm.password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => {
                        const strength = Math.min(
                          Math.floor(adminForm.password.length / 3),
                          4
                        )
                        return (
                          <div
                            key={level}
                            className={[
                              'flex-1 h-1.5 rounded-full transition-colors duration-300',
                              level <= strength
                                ? strength <= 1
                                  ? 'bg-red-400'
                                  : strength <= 2
                                  ? 'bg-amber-400'
                                  : strength <= 3
                                  ? 'bg-blue-400'
                                  : 'bg-green-500'
                                : 'bg-slate-100',
                            ].join(' ')}
                          />
                        )
                      })}
                    </div>
                    <p className="text-xs text-slate-400">
                      {adminForm.password.length < 4
                        ? 'Too short'
                        : adminForm.password.length < 7
                        ? 'Weak password'
                        : adminForm.password.length < 10
                        ? 'Fair password'
                        : 'Strong password'}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    icon={ChevronLeft}
                    iconPosition="left"
                    className="flex-1 h-12"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="flex-1 h-12"
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            )}

            {/* Login link */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
              >
                Login
              </Link>
            </p>
          </div>

          {/* ── Demo section (same as Login page) ── */}
          <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[11px] text-slate-400 font-medium tracking-widest uppercase">Try a Demo</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <p className="text-xs text-center text-slate-400 mb-3">Explore ChurchFlow without creating an account</p>
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

          {/* Footer note */}
          <p className="mt-4 mb-4 text-center text-xs text-slate-400">
            By registering, you agree to our Terms of Service &amp; Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
