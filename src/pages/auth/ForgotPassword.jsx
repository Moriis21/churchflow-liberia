// ============================================================
// ChurchFlow Liberia — Forgot Password Page
// Flow:
//   Step 1 → user enters email → sendResetPasswordEmail()
//   Step 2 → user enters OTP code + new password → resetPassword()
//   Step 3 → success → redirect to login
// ============================================================
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound, ShieldCheck, RefreshCw, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { insforge } from '../../lib/insforge'
import { Button } from '../../components/ui'

// ─── Shared logo ─────────────────────────────────────────────
function AppLogo() {
  return (
    <div className="flex items-center gap-2.5 mb-8">
      <img
        src="/logo.png"
        alt="ChurchFlow Liberia"
        className="w-10 h-10 rounded-xl object-contain"
        onError={e => {
          e.target.style.display = 'none'
          e.target.nextSibling.style.display = 'flex'
        }}
      />
      {/* Fallback icon if logo.png fails */}
      <div
        style={{ display: 'none' }}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500
          items-center justify-center shadow-lg flex-shrink-0"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.2}
          viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 3v4m0 0L9 9m3-2l3 2M5 21h14M5 21V10.5M19 21V10.5M9 8V6a3 3 0 016 0v2M9 8h6" />
        </svg>
      </div>
      <div className="leading-tight">
        <span className="block text-base font-extrabold tracking-tight text-[#1E1B4B]">ChurchFlow</span>
        <span className="block text-[10px] font-semibold text-amber-500 tracking-widest uppercase">Liberia</span>
      </div>
    </div>
  )
}

// ─── Countdown timer ─────────────────────────────────────────
function CountdownTimer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) { onExpire?.(); return }
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left])
  const m = Math.floor(left / 60)
  const s = left % 60
  const urgent = left <= 60
  return (
    <span className={`font-mono font-bold ${urgent ? 'text-red-600' : 'text-slate-600'}`}>
      {m}:{s.toString().padStart(2, '0')}
    </span>
  )
}

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep]               = useState(1)
  const [email, setEmail]             = useState('')
  const [otp, setOtp]                 = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPw, setConfirmPw]     = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [resending, setResending]     = useState(false)
  const [codeExpired, setCodeExpired] = useState(false)
  const [emailError, setEmailError]   = useState('')
  const [pwError, setPwError]         = useState('')

  // ── Step 1: Send reset email ──────────────────────────────
  async function handleSendEmail(e) {
    e.preventDefault()
    setEmailError('')
    if (!email.trim()) { setEmailError('Email address is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address.'); return
    }
    setLoading(true)
    try {
      const { data, error } = await insforge.auth.sendResetPasswordEmail({
        email: email.trim().toLowerCase(),
      })
      if (error) throw error
      toast.success('Reset code sent! Check your inbox.')
      setCodeExpired(false)
      setOtp('')
      setStep(2)
    } catch (err) {
      const msg = err?.message || 'Failed to send reset email. Please try again.'
      setEmailError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Resend code ───────────────────────────────────────────
  async function handleResend() {
    setResending(true)
    try {
      const { error } = await insforge.auth.sendResetPasswordEmail({
        email: email.trim().toLowerCase(),
      })
      if (error) throw error
      toast.success('New code sent to ' + email)
      setOtp('')
      setCodeExpired(false)
      setPwError('')
    } catch (err) {
      toast.error(err?.message || 'Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  // ── Step 2: Reset password ────────────────────────────────
  async function handleResetPassword(e) {
    e.preventDefault()
    setPwError('')

    if (!otp.trim()) { setPwError('Please enter the reset code.'); return }
    if (otp.trim().length < 4) { setPwError('Code too short — check your email.'); return }
    if (!newPassword)           { setPwError('New password is required.'); return }
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPw) { setPwError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const { data, error } = await insforge.auth.resetPassword({
        otp:         otp.trim(),
        newPassword: newPassword,
      })
      if (error) throw error
      setStep(3)
    } catch (err) {
      const raw = err?.message || ''
      const expired = /expired|invalid|incorrect/i.test(raw)
      if (expired) {
        setCodeExpired(true)
        setPwError('This code has expired or is incorrect. Please request a new one.')
      } else {
        setPwError(raw || 'Reset failed. Please request a new code.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 p-8">
          <AppLogo />

          {/* ── Step 1: Enter email ── */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-[#1E1B4B] mb-1">Forgot Password?</h1>
                <p className="text-sm text-slate-500">
                  Enter your email and we'll send you a reset code.
                </p>
              </div>
              <form onSubmit={handleSendEmail} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setEmailError('') }}
                      placeholder="your@email.com" autoComplete="email" autoFocus
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all
                        focus:ring-2 focus:ring-purple-100
                        ${emailError ? 'border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
                    />
                  </div>
                  {emailError && <p className="mt-1.5 text-xs text-red-600 font-medium">{emailError}</p>}
                </div>
                <Button variant="primary" type="submit" loading={loading} className="w-full h-11 font-semibold">
                  {loading ? 'Sending…' : 'Send Reset Code'}
                </Button>
              </form>
            </>
          )}

          {/* ── Step 2: Enter code + new password ── */}
          {step === 2 && (
            <>
              <div className="mb-5">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100
                  flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-purple-600" />
                </div>
                <h1 className="text-2xl font-extrabold text-[#1E1B4B] mb-1">Enter Reset Code</h1>
                <p className="text-sm text-slate-500">
                  We sent a reset code to <span className="font-semibold text-slate-700">{email}</span>.
                  Check your inbox (and spam folder).
                </p>
              </div>

              {/* Expiry warning */}
              {!codeExpired && (
                <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                  <span>Code valid for:</span>
                  <CountdownTimer seconds={300} onExpire={() => setCodeExpired(true)} />
                  <span className="ml-auto">— enter it quickly!</span>
                </div>
              )}
              {codeExpired && (
                <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  ⚠️ Code expired. Click "Resend Code" to get a new one.
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
                {/* Single-line code input — reliable for any format */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Reset Code (from email)
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => { setOtp(e.target.value); setPwError(''); setCodeExpired(false) }}
                    placeholder="Paste or type your code here"
                    autoComplete="one-time-code"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono text-center tracking-widest
                      outline-none transition-all focus:ring-2 focus:ring-purple-100
                      ${pwError ? 'border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
                  />
                  <p className="text-[11px] text-slate-400 mt-1 text-center">
                    Copy the exact code from your email — don't retype it
                  </p>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPw ? 'text' : 'password'} value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setPwError('') }}
                      placeholder="Min. 8 characters" autoComplete="new-password"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all
                        focus:ring-2 focus:ring-purple-100
                        ${pwError ? 'border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPw}
                      onChange={e => { setConfirmPw(e.target.value); setPwError('') }}
                      placeholder="Re-enter new password" autoComplete="new-password"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all
                        focus:ring-2 focus:ring-purple-100
                        ${pwError ? 'border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {pwError && (
                  <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                    {pwError}
                  </p>
                )}

                <Button variant="primary" type="submit" loading={loading}
                  className="w-full h-11 font-semibold" disabled={codeExpired}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                </Button>

                {/* Resend */}
                <div className="text-center pt-1">
                  <p className="text-xs text-slate-400 mb-1">
                    {codeExpired ? 'Your code expired.' : "Didn't receive it?"}
                  </p>
                  <button type="button" onClick={handleResend} disabled={resending}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800
                      disabled:opacity-50 flex items-center gap-1.5 mx-auto transition-colors">
                    <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Sending…' : 'Resend New Code'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100
                flex items-center justify-center mx-auto mb-5">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#1E1B4B] mb-2">Password Reset!</h1>
              <p className="text-sm text-slate-500 mb-6">
                Your password has been updated. Sign in with your new password.
              </p>
              <Button variant="primary" onClick={() => navigate('/login')} className="w-full h-11 font-semibold">
                Go to Sign In
              </Button>
            </div>
          )}

          {step < 3 && (
            <div className="mt-6 text-center">
              <Link to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">&copy; {new Date().getFullYear()} ChurchFlow Liberia</p>
      </div>
    </div>
  )
}
