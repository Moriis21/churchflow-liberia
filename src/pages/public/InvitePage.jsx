// ============================================================
// ChurchFlow Liberia — Invite Acceptance Page  (/invite/:token)
//
// Flow:
//   1. Validate token via validate_church_invite RPC
//   2. Show registration form pre-scoped to the invite's church/role
//   3. On submit:
//      a. Create InsForge auth account
//      b. Create member + user_profile via insert_member_with_user RPC
//         (church_id + role from invite)
//      c. Bump invite used_count
//      d. Send branded welcome email
//      e. Sign in (already done by signUp when verification disabled)
//      f. Send to /app/dashboard (role-aware)
// ============================================================
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Church, MapPin, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { Input, Button } from '../../components/ui'
import { insforge } from '../../lib/insforge'
import { validateInvite, consumeInvite, inviteErrorMessage } from '../../services/inviteService'
import { sendWelcomeEmail } from '../../services/emailService'

export default function InvitePage() {
  const { token } = useParams()
  const navigate  = useNavigate()

  const [phase, setPhase]     = useState('checking')   // checking | invalid | form | submitting | done
  const [invite, setInvite]   = useState(null)
  const [church, setChurch]   = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirm: '',
  })
  const [formErr, setFormErr] = useState({})
  const [showPw,  setShowPw]  = useState(false)

  // ── 1. Validate token ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setPhase('checking')
    validateInvite(token).then((res) => {
      if (cancelled) return
      if (!res?.ok) {
        setErrorMsg(inviteErrorMessage(res?.error))
        setPhase('invalid')
        return
      }
      setInvite(res.invite)
      setChurch(res.church)
      setPhase('form')
    })
    return () => { cancelled = true }
  }, [token])

  // ── 2. Submit ────────────────────────────────────────────────
  function validate() {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.'
    if (!form.phone.trim()) errs.phone = 'Phone number is required.'
    if ((form.password || '').length < 8) errs.password = 'Password must be at least 8 characters.'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErr(errs); return }
    setFormErr({})
    setPhase('submitting')

    const email = form.email.trim().toLowerCase()
    try {
      // a) Create InsForge auth user
      const { data: authData, error: authErr } = await insforge.auth.signUp({
        email,
        password:   form.password,
        name:       form.fullName.trim(),
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      if (authErr) {
        const msg = authErr.message || String(authErr)
        if (/already|exist/i.test(msg)) {
          throw new Error('An account with this email already exists. Please sign in instead.')
        }
        throw new Error(msg)
      }

      const userId = authData?.user?.id || authData?.id
      if (!userId) throw new Error('Account created but no user ID returned. Please try again.')

      // b) Create member + user_profile via SECURITY DEFINER RPC
      const { error: memberErr } = await insforge.database.rpc('insert_member_with_user', {
        p_church_id:         invite.church_id,
        p_branch_id:         invite.branch_id   || null,
        p_user_id:           userId,
        p_full_name:         form.fullName.trim(),
        p_gender:            'male',
        p_phone:             form.phone.trim(),
        p_email:             email,
        p_address:           null,
        p_date_of_birth:     null,
        p_membership_status: 'active',
        p_baptism_status:    false,
        p_marital_status:    'single',
        p_join_date:         new Date().toISOString().split('T')[0],
        p_notes:             `Joined via invite ${token}`,
        p_emergency_contact: null,
      })
      if (memberErr) throw new Error(`Could not finish setup: ${memberErr.message}`)

      // c) Bump used_count (best-effort, never blocks)
      consumeInvite(token).catch(() => {})

      // d) Welcome email (best-effort)
      sendWelcomeEmail({
        to:         email,
        userName:   form.fullName,
        role:       invite.role || 'member',
        churchName: church?.name || '',
      }).catch(() => {})

      // e) Done — sign-in happens automatically when verification is off
      setPhase('done')
      toast.success(`Welcome to ${church?.name || 'the church'}!`)
      setTimeout(() => navigate('/app/dashboard', { replace: true }), 1200)
    } catch (err) {
      setErrorMsg(err.message || 'Could not complete registration.')
      setPhase('form')
      toast.error(err.message || 'Registration failed.')
    }
  }

  // ── Render ───────────────────────────────────────────────────
  if (phase === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F8FA] to-[#EDE9FE]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Checking invite…</p>
        </div>
      </div>
    )
  }

  if (phase === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F8FA] to-[#EDE9FE] p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#151022] mb-2">Invite Unavailable</h2>
          <p className="text-slate-500 text-sm mb-6">{errorMsg}</p>
          <Link to="/login" className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white font-semibold text-sm hover:opacity-95 transition-opacity">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F8FA] to-[#EDE9FE] p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-[#151022] mb-2">Account ready</h2>
          <p className="text-slate-500 text-sm">Redirecting to your dashboard…</p>
        </div>
      </div>
    )
  }

  // form / submitting
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EDE9FE] py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#151022] to-[#5B00B8] p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
            <Church className="w-7 h-7 text-white" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1">You're invited</p>
          <h1 className="text-xl font-extrabold text-white">{church?.name || 'A ChurchFlow church'}</h1>
          {church?.location && (
            <p className="text-xs text-purple-200 mt-1 inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {church.location}
            </p>
          )}
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-white/80">
            Joining as: {(invite?.role || 'member').replace('_', ' ')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{errorMsg}</p>
            </div>
          )}

          <Input
            label="Full Name" required value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="e.g. James Kollie" error={formErr.fullName}
          />
          <Input
            label="Email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com" error={formErr.email}
          />
          <Input
            label="Phone" required value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+231-770-000-000" error={formErr.phone}
          />

          <div className="relative">
            <Input
              label="Password" type={showPw ? 'text' : 'password'} required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters" error={formErr.password}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Input
            label="Confirm Password" type={showPw ? 'text' : 'password'} required
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="Re-enter your password" error={formErr.confirm}
          />

          <Button
            type="submit" variant="primary" className="w-full"
            loading={phase === 'submitting'}
          >
            Create account & join
          </Button>

          <p className="text-center text-xs text-slate-400 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
