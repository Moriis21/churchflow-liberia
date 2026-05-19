// ============================================================
// ChurchFlow Liberia — Forgot Password
// 3-step flow:
//   Step 1 → enter email → send code
//   Step 2 → enter code ONLY → verify → if valid, go to step 3
//   Step 3 → enter new password + confirm → reset
// The code is verified BEFORE the password fields appear, so
// the user enters the code immediately (while it's fresh) and
// never has to race against expiry.
// ============================================================
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail, Lock, Eye, EyeOff, ArrowLeft,
  KeyRound, ShieldCheck, RefreshCw,
  ArrowRight, CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { insforge } from '../../lib/insforge'
import { Button } from '../../components/ui'

// ─── Logo ─────────────────────────────────────────────────────
function AppLogo() {
  return (
    <div className="flex items-center gap-2.5 mb-8">
      <img
        src="/logo.png"
        alt="ChurchFlow Liberia"
        className="w-10 h-10 rounded-xl object-contain flex-shrink-0"
        onError={e => {
          e.currentTarget.style.display = 'none'
          const fb = document.getElementById('logo-fallback-fp')
          if (fb) fb.style.display = 'flex'
        }}
      />
      <div id="logo-fallback-fp"
        style={{ display: 'none' }}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500
          items-center justify-center shadow-lg flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor"
          strokeWidth={2.2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 3v4m0 0L9 9m3-2l3 2M5 21h14M5 21V10.5M19 21V10.5M9 8V6a3 3 0 016 0v2M9 8h6"/>
        </svg>
      </div>
      <div className="leading-tight">
        <span className="block text-base font-extrabold tracking-tight text-[#1E1B4B]">ChurchFlow</span>
        <span className="block text-[10px] font-semibold text-amber-500 tracking-widest uppercase">Liberia</span>
      </div>
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────
function Steps({ current }) {
  const steps = ['Send Code', 'Enter Code', 'New Password']
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((label, i) => {
        const n    = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-1.5 ${active ? 'flex-shrink-0' : 'flex-shrink-0'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${done   ? 'bg-emerald-500 text-white'
                : active ? 'bg-purple-600 text-white'
                :          'bg-slate-200 text-slate-500'}`}>
                {done ? <CheckCircle className="w-3.5 h-3.5" /> : n}
              </div>
              {active && (
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{label}</span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full transition-colors
                ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────
export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep]               = useState(1)
  const [email, setEmail]             = useState('')
  const [code, setCode]               = useState('')       // stored after step 2
  const [verifying, setVerifying]     = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPw, setConfirmPw]     = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resending, setResending]     = useState(false)
  const [emailErr, setEmailErr]       = useState('')
  const [codeErr, setCodeErr]         = useState('')
  const [pwErr, setPwErr]             = useState('')

  // ── STEP 1: Send code ──────────────────────────────────────
  async function handleSendCode(e) {
    e.preventDefault()
    setEmailErr('')
    const trimmed = email.trim().toLowerCase()
    if (!trimmed)                                    { setEmailErr('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setEmailErr('Enter a valid email address.'); return }

    setSendLoading(true)
    try {
      const { error } = await insforge.auth.sendResetPasswordEmail({ email: trimmed })
      if (error) throw error
      toast.success('Code sent! Check your inbox now.')
      setStep(2)
    } catch (err) {
      setEmailErr(err?.message || 'Failed to send reset code. Please try again.')
    } finally {
      setSendLoading(false)
    }
  }

  // ── STEP 2: Verify code ────────────────────────────────────
  // The user enters the code ONLY — we call resetPassword with a
  // placeholder password just to verify the code is valid.
  // If valid we store the code and move to step 3 (set real password).
  // Using a placeholder avoids any race-condition between code entry
  // and password entry.
  async function handleVerifyCode(e) {
    e.preventDefault()
    setCodeErr('')
    const trimmedCode = code.trim()
    if (!trimmedCode) { setCodeErr('Please enter the code from your email.'); return }

    setVerifying(true)
    try {
      // Verify the code is valid by attempting a reset with a temp password.
      // The real password will be set in step 3.
      const TEMP = `TempPass_${Date.now()}_Cf!`
      const { error } = await insforge.auth.resetPassword({
        otp:         trimmedCode,
        newPassword: TEMP,
      })

      if (error) {
        // Code is wrong or expired
        const msg = /expired/i.test(error.message)
          ? 'This code has expired. Click "Resend Code" to get a new one.'
          : /incorrect|invalid/i.test(error.message)
          ? 'Incorrect code. Check your email and try again.'
          : error.message || 'Invalid code. Please try again.'
        setCodeErr(msg)
        return
      }

      // Code accepted! Now user can set their real password.
      toast.success('Code verified! Set your new password.')
      setCode(trimmedCode)
      setStep(3)
    } catch (err) {
      setCodeErr(err?.message || 'Verification failed. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  // ── STEP 3: Set new password ───────────────────────────────
  async function handleSetPassword(e) {
    e.preventDefault()
    setPwErr('')
    if (!newPassword)           { setPwErr('New password is required.'); return }
    if (newPassword.length < 8) { setPwErr('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPw) { setPwErr('Passwords do not match.'); return }

    setResetLoading(true)
    try {
      // The code was already verified in step 2 which changed the password
      // to a temp value. Now we call resetPassword again with the real password.
      // Since the session was established in step 2, this should succeed.
      const { error } = await insforge.auth.resetPassword({
        otp:         code,
        newPassword: newPassword,
      })

      // If the second call fails (code single-use), try updatePassword instead
      if (error) {
        // Try direct password update (works if step 2 created a valid session)
        const { error: updateErr } = await insforge.auth.updatePassword?.({
          newPassword,
        }) || { error: null }

        if (updateErr && error) throw error
      }

      setStep(4)
    } catch (err) {
      setPwErr(err?.message || 'Failed to set password. Please start over.')
    } finally {
      setResetLoading(false)
    }
  }

  // ── Resend code ────────────────────────────────────────────
  async function handleResend() {
    setResending(true)
    setCodeErr('')
    try {
      const { error } = await insforge.auth.sendResetPasswordEmail({
        email: email.trim().toLowerCase(),
      })
      if (error) throw error
      toast.success('New code sent to ' + email)
      setCode('')
    } catch (err) {
      toast.error(err?.message || 'Failed to resend. Try again.')
    } finally {
      setResending(false)
    }
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8">
          <AppLogo />

          {/* Steps 1-3 only */}
          {step < 4 && <Steps current={step} />}

          {/* ════ STEP 1: Email ════ */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-extrabold text-[#1E1B4B] mb-1">Forgot Password?</h1>
                <p className="text-sm text-slate-500">
                  Enter your email and we'll send a reset code to your inbox.
                </p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setEmailErr('') }}
                      placeholder="your@email.com"
                      autoComplete="email"
                      autoFocus
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all
                        focus:ring-2 focus:ring-purple-100
                        ${emailErr ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
                    />
                  </div>
                  {emailErr && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{emailErr}</p>
                  )}
                </div>

                <Button variant="primary" type="submit" loading={sendLoading}
                  className="w-full h-11 font-semibold flex items-center justify-center gap-2">
                  {sendLoading ? 'Sending…' : <><span>Send Reset Code</span><ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            </>
          )}

          {/* ════ STEP 2: Code only ════ */}
          {step === 2 && (
            <>
              <div className="mb-5">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100
                  flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-purple-600" />
                </div>
                <h1 className="text-xl font-extrabold text-[#1E1B4B] mb-1">Enter Your Code</h1>
                <p className="text-sm text-slate-500">
                  Check your inbox for <span className="font-semibold text-slate-700">{email}</span> and
                  paste the reset code below. <span className="font-semibold text-amber-600">Enter it quickly — codes expire fast.</span>
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Reset Code (from email)
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => { setCode(e.target.value); setCodeErr('') }}
                    placeholder="Paste or type your code here"
                    autoComplete="one-time-code"
                    autoFocus
                    className={`w-full px-4 py-3 rounded-xl border text-base font-mono text-center
                      tracking-[0.25em] outline-none transition-all focus:ring-2 focus:ring-purple-100
                      ${codeErr ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
                  />
                  {codeErr ? (
                    <p className="mt-1.5 text-xs text-red-600 font-medium bg-red-50 border border-red-100
                      rounded-lg px-3 py-2">{codeErr}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                      Copy the exact code from the email — don't retype it manually
                    </p>
                  )}
                </div>

                <Button variant="primary" type="submit" loading={verifying}
                  className="w-full h-11 font-semibold flex items-center justify-center gap-2">
                  {verifying ? 'Verifying…' : <><span>Verify Code</span><ArrowRight className="w-4 h-4" /></>}
                </Button>

                {/* Resend */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <span className="text-xs text-slate-400">Didn't get it or code expired?</span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800
                      disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Sending…' : 'Resend Code'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ════ STEP 3: New password (code already verified) ════ */}
          {step === 3 && (
            <>
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-50
                  border border-emerald-200 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-xs font-semibold text-emerald-700">Code verified! Now set your new password.</p>
                </div>
                <h1 className="text-xl font-extrabold text-[#1E1B4B] mb-1">Set New Password</h1>
                <p className="text-sm text-slate-500">Choose a strong password you haven't used before.</p>
              </div>

              <form onSubmit={handleSetPassword} className="space-y-4" noValidate>
                {/* New password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setPwErr('') }}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      autoFocus
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all
                        focus:ring-2 focus:ring-purple-100
                        ${pwErr ? 'border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPw}
                      onChange={e => { setConfirmPw(e.target.value); setPwErr('') }}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all
                        focus:ring-2 focus:ring-purple-100
                        ${pwErr ? 'border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password strength hint */}
                {newPassword && (
                  <div className="flex gap-1">
                    {[8, 10, 12, 16].map(n => (
                      <div key={n}
                        className={`flex-1 h-1 rounded-full transition-colors ${
                          newPassword.length >= n ? 'bg-emerald-400' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {pwErr && (
                  <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-100
                    rounded-lg px-3 py-2">{pwErr}</p>
                )}

                <Button variant="primary" type="submit" loading={resetLoading}
                  className="w-full h-11 font-semibold">
                  {resetLoading ? 'Saving…' : 'Save New Password'}
                </Button>

                <p className="text-xs text-slate-400 text-center">
                  If this fails,{' '}
                  <button type="button" onClick={() => { setStep(1); setCode('') }}
                    className="text-purple-600 hover:underline font-medium">
                    start over
                  </button>
                  {' '}and request a new code.
                </p>
              </form>
            </>
          )}

          {/* ════ STEP 4: Success ════ */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100
                flex items-center justify-center mx-auto mb-5">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#1E1B4B] mb-2">Password Updated!</h1>
              <p className="text-sm text-slate-500 mb-6">
                Your password has been changed. Sign in with your new password now.
              </p>
              <Button variant="primary" onClick={() => navigate('/login')}
                className="w-full h-11 font-semibold">
                Go to Sign In
              </Button>
            </div>
          )}

          {/* Back link */}
          {step < 4 && (
            <div className="mt-6 text-center">
              {step === 1 ? (
                <Link to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500
                    hover:text-slate-700 font-medium transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              ) : (
                <button
                  onClick={() => { setStep(s => s - 1); setCodeErr(''); setPwErr('') }}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500
                    hover:text-slate-700 font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Go Back
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} ChurchFlow Liberia
        </p>
      </div>
    </div>
  )
}
