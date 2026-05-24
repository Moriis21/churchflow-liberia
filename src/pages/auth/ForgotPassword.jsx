// ============================================================
// ChurchFlow Liberia — Forgot Password
// Simple 3-step flow:
//   Step 1 → enter email → sendResetPasswordEmail()
//   Step 2 → enter code + new password → resetPassword()
//   Step 3 → success → back to login
// ============================================================
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { insforge } from '../../lib/insforge'
import { Button } from '../../components/ui'

function AppLogo() {
  return (
    <div className="flex items-center gap-2.5 mb-8">
      <img src="/logo.png" alt="ChurchFlow Liberia"
        className="w-10 h-10 rounded-xl object-contain flex-shrink-0"
        onError={e => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.nextSibling.style.display = 'flex'
        }}
      />
      <div style={{ display: 'none' }}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500
          items-center justify-center shadow-lg flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 3v4m0 0L9 9m3-2l3 2M5 21h14M5 21V10.5M19 21V10.5M9 8V6a3 3 0 016 0v2M9 8h6"/>
        </svg>
      </div>
      <div className="leading-tight">
        <span className="block text-base font-extrabold tracking-tight text-[#151022]">ChurchFlow</span>
        <span className="block text-[10px] font-semibold text-amber-500 tracking-widest uppercase">Liberia</span>
      </div>
    </div>
  )
}

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep]   = useState(1)   // 1 = email, 2 = code+pw, 3 = done
  const [email, setEmail] = useState('')
  const [code, setCode]   = useState('')
  const [newPw, setNewPw] = useState('')
  const [cnfPw, setCnfPw] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [showCnf, setShowCnf] = useState(false)
  const [step1Loading, setStep1Loading] = useState(false)
  const [step2Loading, setStep2Loading] = useState(false)
  const [resending, setResending]       = useState(false)
  const [emailErr, setEmailErr] = useState('')
  const [formErr, setFormErr]   = useState('')

  // ── Step 1: Send code ──────────────────────────────────────
  async function handleSend(e) {
    e.preventDefault()
    setEmailErr('')
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) { setEmailErr('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setEmailErr('Enter a valid email.'); return }

    setStep1Loading(true)
    try {
      const { error } = await insforge.auth.sendResetPasswordEmail({ email: trimmed })
      if (error) throw error
      toast.success('Code sent! Check your email inbox now.')
      setStep(2)
    } catch (err) {
      setEmailErr(err?.message || 'Failed to send code. Try again.')
    } finally {
      setStep1Loading(false)
    }
  }

  // ── Resend code ────────────────────────────────────────────
  async function handleResend() {
    setResending(true)
    try {
      const { error } = await insforge.auth.sendResetPasswordEmail({ email: email.trim().toLowerCase() })
      if (error) throw error
      toast.success('New code sent to ' + email)
      setCode('')
      setFormErr('')
    } catch (err) {
      toast.error(err?.message || 'Could not resend. Try again.')
    } finally {
      setResending(false)
    }
  }

  // ── Step 2: Reset with code + new password ─────────────────
  async function handleReset(e) {
    e.preventDefault()
    setFormErr('')

    const trimCode = code.trim()
    if (!trimCode)      { setFormErr('Enter the code from your email.'); return }
    if (!newPw)         { setFormErr('Enter your new password.'); return }
    if (newPw.length < 8) { setFormErr('Password must be at least 8 characters.'); return }
    if (newPw !== cnfPw)  { setFormErr('Passwords do not match.'); return }

    setStep2Loading(true)
    try {
      // Pass email alongside otp — InsForge needs it to look up
      // which account this OTP belongs to, even though TypeScript
      // definition doesn't show it as required
      // Pass email alongside otp — InsForge needs it internally
      // even though the TypeScript definition doesn't show it
      const resetPayload = { otp: trimCode, newPassword: newPw, email: email.trim().toLowerCase() }
      const { error } = await insforge.auth.resetPassword(resetPayload)
      if (error) throw error
      setStep(3)
    } catch (err) {
      const msg = err?.message || ''
      if (/expired/i.test(msg)) {
        setFormErr('Code expired — click "Send New Code" to get a fresh one.')
      } else if (/invalid|incorrect|token/i.test(msg)) {
        setFormErr('Code is incorrect. Double-check your email or request a new code.')
      } else {
        setFormErr(msg || 'Reset failed. Request a new code and try again.')
      }
    } finally {
      setStep2Loading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8">
          <AppLogo />

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              <h1 className="text-xl font-extrabold text-[#151022] mb-1">Forgot Password?</h1>
              <p className="text-sm text-slate-500 mb-6">
                Enter your email and we'll send a reset code to your inbox.
              </p>
              <form onSubmit={handleSend} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setEmailErr('') }}
                      placeholder="your@email.com" autoComplete="email" autoFocus
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all
                        focus:ring-2 focus:ring-purple-100
                        ${emailErr ? 'border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
                    />
                  </div>
                  {emailErr && <p className="mt-1.5 text-xs text-red-600 font-medium">{emailErr}</p>}
                </div>
                <Button variant="primary" type="submit" loading={step1Loading} className="w-full h-11 font-semibold">
                  {step1Loading ? 'Sending…' : 'Send Reset Code'}
                </Button>
              </form>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              <h1 className="text-xl font-extrabold text-[#151022] mb-1">Reset Your Password</h1>
              <p className="text-sm text-slate-500 mb-1">
                A reset code was sent to <span className="font-semibold text-slate-700">{email}</span>.
              </p>
              <p className="text-xs text-amber-600 font-medium mb-5">
                ⚡ Open your email now, copy the code, and paste it below before it expires.
              </p>

              <form onSubmit={handleReset} className="space-y-4" noValidate>
                {/* Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Reset Code (from email)
                  </label>
                  <input type="text" value={code}
                    onChange={e => { setCode(e.target.value); setFormErr('') }}
                    placeholder="Paste your code here"
                    autoComplete="one-time-code"
                    autoFocus
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono text-center
                      tracking-widest outline-none transition-all focus:ring-2 focus:ring-purple-100
                      ${formErr ? 'border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
                  />
                </div>

                {/* New password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPw ? 'text' : 'password'} value={newPw}
                      onChange={e => { setNewPw(e.target.value); setFormErr('') }}
                      placeholder="Min. 8 characters" autoComplete="new-password"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all
                        focus:ring-2 focus:ring-purple-100
                        ${formErr ? 'border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
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
                    <input type={showCnf ? 'text' : 'password'} value={cnfPw}
                      onChange={e => { setCnfPw(e.target.value); setFormErr('') }}
                      placeholder="Re-enter new password" autoComplete="new-password"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all
                        focus:ring-2 focus:ring-purple-100
                        ${formErr ? 'border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
                    />
                    <button type="button" onClick={() => setShowCnf(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showCnf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {formErr && (
                  <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs text-red-600 font-medium">{formErr}</p>
                  </div>
                )}

                <Button variant="primary" type="submit" loading={step2Loading} className="w-full h-11 font-semibold">
                  {step2Loading ? 'Resetting…' : 'Reset Password'}
                </Button>

                {/* Resend */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-xs text-slate-400">Code expired or not received?</span>
                  <button type="button" onClick={handleResend} disabled={resending}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800
                      disabled:opacity-50 flex items-center gap-1.5 transition-colors">
                    <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Sending…' : 'Send New Code'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 3: Done ── */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100
                flex items-center justify-center mx-auto mb-5">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#151022] mb-2">Password Updated!</h1>
              <p className="text-sm text-slate-500 mb-6">
                Sign in with your new password.
              </p>
              <Button variant="primary" onClick={() => navigate('/login')} className="w-full h-11 font-semibold">
                Sign In Now
              </Button>
            </div>
          )}

          {step < 3 && (
            <div className="mt-6 text-center">
              {step === 1
                ? <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium"><ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In</Link>
                : <button onClick={() => { setStep(1); setFormErr('') }} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium"><ArrowLeft className="w-3.5 h-3.5" /> Go Back</button>
              }
            </div>
          )}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">&copy; {new Date().getFullYear()} ChurchFlow Liberia</p>
      </div>
    </div>
  )
}
