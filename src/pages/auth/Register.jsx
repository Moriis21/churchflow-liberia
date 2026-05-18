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
import { useAuth, ROLES } from '../../context/AuthContext'
import { Input, Button } from '../../components/ui'
import { insforge } from '../../lib/insforge'

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
                  ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
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
          <h2 className="text-2xl font-bold text-[#1E1B4B] mb-2">Verify Your Email</h2>
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
              className="w-full text-center text-3xl font-bold tracking-[0.5em] border-2 border-purple-200 rounded-xl px-4 py-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-[#1E1B4B] placeholder-slate-300"
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-lg leading-none">+</span>
          </div>
          <div>
            <p className="text-[#1E1B4B] font-bold text-lg leading-tight">ChurchFlow</p>
            <p className="text-[#F59E0B] text-xs tracking-widest uppercase font-semibold">Liberia</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
          {/* Church banner */}
          <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-700">
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
              <h2 className="text-2xl font-extrabold text-[#1E1B4B]">Create Your Account</h2>
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

// ─── Component ───────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate()
  const { register, verifyEmail, resendVerification, pendingVerificationEmail } = useAuth()
  const [verifyStep, setVerifyStep] = useState(false)
  const [otp, setOtp] = useState('')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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
          <h2 className="text-2xl font-bold text-[#1E1B4B] mb-2">Verify Your Email</h2>
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
              className="w-full text-center text-3xl font-bold tracking-[0.5em] border-2 border-purple-200 rounded-xl px-4 py-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-[#1E1B4B] placeholder-slate-300"
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
      {/* ── Left panel ──────────────────────────────────── */}
      <div
        className="hidden md:flex md:w-[44%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #2D1B69 40%, #4C1D95 70%, #7C3AED 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-700/20 blur-3xl pointer-events-none" />

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

        {/* Center copy */}
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Register Your Church
          </h2>
          <p className="mt-4 text-purple-200 text-sm leading-relaxed max-w-xs mx-auto">
            Join hundreds of Liberian churches already managing their ministry smarter with ChurchFlow.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3">
          {[
            'Free to get started',
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

      {/* ── Right panel ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-start md:justify-center px-5 py-8 sm:px-8 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-[480px] mx-auto">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg leading-none">+</span>
            </div>
            <div>
              <p className="text-slate-800 font-bold text-lg leading-tight">ChurchFlow</p>
              <p className="text-purple-400 text-xs tracking-widest uppercase">Liberia</p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-[#1E1B4B]">Create Your Account</h2>
              <p className="mt-1 text-slate-500 text-sm">Set up ChurchFlow for your ministry</p>
            </div>

            {/* Mobile back link */}
            <Link
              to="/landing"
              className="md:hidden flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-purple-700 transition-colors mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

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
                    <Globe className="w-4 h-4 text-slate-500" />
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

          {/* Footer note */}
          <p className="mt-6 mb-4 text-center text-xs text-slate-400">
            By registering, you agree to our Terms of Service &amp; Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
