// ============================================================
// ChurchFlow Liberia — New Church Onboarding Wizard
//
// 4-step flow shown when an authenticated user has no church yet:
//   1. Church details         → creates church + assigns user
//   2. First branch           → optional, can skip
//   3. Invite team members    → optional, can skip
//   4. All done               → redirects to dashboard
// ============================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Church, MapPin, Phone, Mail, User, ChevronRight, ChevronLeft,
  CheckCircle, Building2, UserPlus, Sparkles, X, Plus, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import { Button } from '../../components/ui'
import { sendWelcomeEmail, sendTeamInvite } from '../../services/emailService'

const STEPS = [
  { id: 1, label: 'Church',  icon: Church       },
  { id: 2, label: 'Branch',  icon: Building2    },
  { id: 3, label: 'Invite',  icon: UserPlus     },
  { id: 4, label: 'Done',    icon: Sparkles     },
]

// ─── Step indicator (top bar) ─────────────────────────────────
function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
      {STEPS.map((s, i) => {
        const Icon = s.icon
        const active = s.id === current
        const done   = s.id < current
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                done
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : active
                  ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110'
                  : 'bg-white border-slate-200 text-slate-300'
              }`}>
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] font-bold mt-1.5 uppercase tracking-wide ${
                active ? 'text-purple-700' : done ? 'text-emerald-600' : 'text-slate-300'
              }`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 sm:w-14 h-0.5 mx-1 mt-[-18px] ${
                done ? 'bg-emerald-500' : 'bg-slate-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
export default function CompleteSetup() {
  const { user, logout } = useAuth()
  const { updateChurch } = useChurch()
  const navigate = useNavigate()

  const [step, setStep]     = useState(1)
  const [saving, setSaving] = useState(false)
  const [churchId, setChurchId] = useState(null)

  // ── Form state ──
  const [church, setChurch] = useState({
    name:     '',
    fullName: user?.profile?.full_name || user?.name || '',
    location: '',
    phone:    '',
    email:    '',
  })
  const [branch, setBranch] = useState({ name: '', location: '', pastor: '' })
  const [invites, setInvites] = useState([{ email: '', role: 'pastor' }])
  const [errors, setErrors] = useState({})

  // ── Setters ──
  const setC = f => e => { setChurch(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })) }
  const setB = f => e =>   setBranch(p => ({ ...p, [f]: e.target.value }))
  const setI = (i, f) => e => setInvites(p => p.map((x, idx) => idx === i ? { ...x, [f]: e.target.value } : x))
  const addInviteRow = () => invites.length < 8 && setInvites(p => [...p, { email: '', role: 'pastor' }])
  const removeInviteRow = (i) => setInvites(p => p.filter((_, idx) => idx !== i))

  // ─── STEP 1 — create church ───────────────────────────────
  async function submitStep1(e) {
    e?.preventDefault()
    const errs = {}
    if (!church.name.trim())     errs.name     = 'Church name is required'
    if (!church.fullName.trim()) errs.fullName = 'Your name is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const { data: result, error } = await insforge.database
        .rpc('create_church_setup', {
          p_user_id:     user?.id,
          p_user_email:  user?.email || null,
          p_church_name: church.name.trim(),
          p_full_name:   church.fullName.trim(),
          p_role:        'church_admin',
        })

      if (error) throw error
      if (!result?.success) throw new Error(result?.error || 'Setup failed')

      const newChurchId = result.church?.id
      setChurchId(newChurchId)

      // Update extra fields
      if (newChurchId && (church.location || church.phone || church.email)) {
        await insforge.database.from('churches').update({
          location: church.location.trim() || null,
          phone:    church.phone.trim()    || null,
          email:    church.email.trim()    || null,
        }).eq('id', newChurchId)
      }

      // Persist role + church_id in auth profile
      await insforge.auth.setProfile({
        name:      church.fullName.trim(),
        role:      'church_admin',
        church_id: newChurchId || null,
      })

      if (result.church) updateChurch(result.church)
      toast.success(`${church.name} created!`)

      // Send welcome email (best-effort, never blocks)
      if (user?.email) {
        sendWelcomeEmail({
          to: user.email,
          churchName: church.name.trim(),
          userName: church.fullName.trim().split(' ')[0],
        })
      }

      setStep(2)
    } catch (err) {
      toast.error(err.message || 'Setup failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ─── STEP 2 — first branch (optional) ─────────────────────
  async function submitStep2(skip = false) {
    if (skip || !branch.name.trim()) { setStep(3); return }
    setSaving(true)
    try {
      const { error } = await insforge.database.from('branches').insert({
        church_id:   churchId,
        name:        branch.name.trim(),
        location:    branch.location.trim() || null,
        pastor:      branch.pastor.trim()   || null,
        is_main:     true,
        established: new Date().toISOString().slice(0, 10),
      })
      if (error) throw error
      toast.success('Branch added')
    } catch (err) {
      toast.error(err.message || 'Could not save branch')
    } finally {
      setSaving(false)
      setStep(3)
    }
  }

  // ─── STEP 3 — save invites (optional) ─────────────────────
  async function submitStep3(skip = false) {
    const valid = invites.filter(i => i.email.trim() && /^\S+@\S+\.\S+$/.test(i.email))
    if (skip || valid.length === 0) { setStep(4); return }
    setSaving(true)
    try {
      // Best-effort: save to team_invites table if it exists
      const rows = valid.map(i => ({
        church_id: churchId,
        email:     i.email.trim().toLowerCase(),
        role:      i.role,
        status:    'pending',
        invited_by: user?.id || null,
      }))
      const { error } = await insforge.database.from('team_invites').insert(rows)
      if (error) {
        // Table may not exist yet — fail silently, don't block the user
        console.warn('[Onboarding] team_invites insert skipped:', error.message)
      }

      // Best-effort invite emails — fire and forget, do not block UX
      const joinUrl = `${window.location.origin}/join/${churchId}`
      const inviterName = church.fullName.trim() || 'Your team'
      await Promise.allSettled(
        valid.map(i => sendTeamInvite({
          to:          i.email.trim(),
          churchName:  church.name.trim(),
          inviterName,
          role:        i.role,
          joinUrl,
        }))
      )

      toast.success(`${valid.length} invitation${valid.length>1?'s':''} sent`)
    } catch (err) {
      console.warn('[Onboarding] invite save failed:', err)
    } finally {
      setSaving(false)
      setStep(4)
    }
  }

  // ─── STEP 4 — finish ──────────────────────────────────────
  function finish() {
    window.location.replace('/app/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <img src="/logo.png" alt="ChurchFlow Liberia"
            className="w-9 h-9 rounded-xl object-contain"
            onError={e => { e.target.style.display = 'none' }} />
          <div>
            <span className="block text-base font-extrabold text-[#151022]">ChurchFlow</span>
            <span className="block text-[10px] font-semibold text-amber-500 tracking-widest uppercase">Liberia</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-7 sm:p-9">
          <StepBar current={step} />

          {/* ── STEP 1 — church details ── */}
          {step === 1 && (
            <form onSubmit={submitStep1} className="space-y-4" noValidate>
              <div className="text-center mb-5">
                <h1 className="text-2xl font-extrabold text-[#151022] mb-1">Welcome to ChurchFlow</h1>
                <p className="text-sm text-slate-500">Let's set up your church in a few quick steps.</p>
              </div>

              {/* logged-in notice */}
              <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                Logged in as <span className="font-bold">{user?.email}</span>.
                Not you?{' '}
                <button type="button"
                  onClick={() => logout().then(() => navigate('/login'))}
                  className="underline hover:no-underline">Sign out</button>
              </div>

              <Field label="Your Full Name *" error={errors.fullName} icon={User}>
                <input value={church.fullName} onChange={setC('fullName')}
                  placeholder="e.g. Pastor John Doe"
                  className={inputCls(errors.fullName)} />
              </Field>

              <Field label="Church Name *" error={errors.name} icon={Church}>
                <input value={church.name} onChange={setC('name')}
                  placeholder="e.g. Grace Community Church"
                  className={inputCls(errors.name)} />
              </Field>

              <Field label="Location" hint="(optional)" icon={MapPin}>
                <input value={church.location} onChange={setC('location')}
                  placeholder="e.g. Sinkor, Monrovia"
                  className={inputCls()} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone" hint="(opt.)" icon={Phone} compact>
                  <input value={church.phone} onChange={setC('phone')}
                    placeholder="+231 770 000 000"
                    className={inputCls(null, true)} />
                </Field>
                <Field label="Email" hint="(opt.)" icon={Mail} compact>
                  <input type="email" value={church.email} onChange={setC('email')}
                    placeholder="church@example.com"
                    className={inputCls(null, true)} />
                </Field>
              </div>

              <Button variant="primary" type="submit" loading={saving}
                className="w-full h-11 font-semibold flex items-center justify-center gap-2">
                {saving ? 'Creating church…' : <>Continue <ChevronRight className="w-4 h-4" /></>}
              </Button>
            </form>
          )}

          {/* ── STEP 2 — first branch ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-5">
                <h1 className="text-2xl font-extrabold text-[#151022] mb-1">Add your main branch</h1>
                <p className="text-sm text-slate-500">If your church meets at one location, that's your main branch. You can add more later.</p>
              </div>

              <Field label="Branch Name" icon={Building2}>
                <input value={branch.name} onChange={setB('name')}
                  placeholder={`e.g. ${church.name || 'Main Branch'} — Sinkor`}
                  className={inputCls()} />
              </Field>

              <Field label="Location" icon={MapPin}>
                <input value={branch.location} onChange={setB('location')}
                  placeholder="e.g. Sinkor, Monrovia"
                  className={inputCls()} />
              </Field>

              <Field label="Branch Pastor" icon={User}>
                <input value={branch.pastor} onChange={setB('pastor')}
                  placeholder="e.g. Pastor John Doe"
                  className={inputCls()} />
              </Field>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => submitStep2(true)}
                  className="flex-1 h-11 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  Skip for now
                </button>
                <Button variant="primary" onClick={() => submitStep2(false)} loading={saving}
                  className="flex-1 h-11 font-semibold flex items-center justify-center gap-2">
                  {saving ? 'Saving…' : <>Continue <ChevronRight className="w-4 h-4" /></>}
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3 — invite team ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-5">
                <h1 className="text-2xl font-extrabold text-[#151022] mb-1">Invite your team</h1>
                <p className="text-sm text-slate-500">Add the people who'll help run your church on ChurchFlow.</p>
              </div>

              <div className="space-y-2.5">
                {invites.map((inv, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" value={inv.email} onChange={setI(i, 'email')}
                        placeholder="person@example.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-100 focus:border-purple-500" />
                    </div>
                    <select value={inv.role} onChange={setI(i, 'role')}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500">
                      <option value="pastor">Pastor</option>
                      <option value="treasurer">Treasurer</option>
                      <option value="secretary">Secretary</option>
                      <option value="dept_leader">Dept Leader</option>
                    </select>
                    {invites.length > 1 && (
                      <button type="button" onClick={() => removeInviteRow(i)}
                        className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {invites.length < 8 && (
                <button type="button" onClick={addInviteRow}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add another
                </button>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => submitStep3(true)}
                  className="flex-1 h-11 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  Skip for now
                </button>
                <Button variant="primary" onClick={() => submitStep3(false)} loading={saving}
                  className="flex-1 h-11 font-semibold flex items-center justify-center gap-2">
                  {saving ? 'Saving…' : <>Continue <ChevronRight className="w-4 h-4" /></>}
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 4 — done ── */}
          {step === 4 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#151022] mb-2">
                {church.name} is ready!
              </h2>
              <p className="text-sm text-slate-500 mb-7 max-w-sm mx-auto">
                Your church is set up. Next, add members, record your first Sunday's attendance, or explore the dashboard.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <NextCard icon={UserPlus} label="Add members"   to="/app/members/new" />
                <NextCard icon={CheckCircle} label="Mark attendance" to="/app/attendance" />
                <NextCard icon={Sparkles}  label="Explore dashboard" to="/app/dashboard" />
              </div>

              <Button variant="primary" onClick={finish}
                className="w-full h-11 font-semibold flex items-center justify-center gap-2">
                Go to dashboard <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

        </div>

        {/* Back link for steps 2 & 3 */}
        {(step === 2 || step === 3) && (
          <div className="text-center mt-4">
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-5">
          &copy; {new Date().getFullYear()} ChurchFlow Liberia
        </p>
      </div>
    </div>
  )
}

// ─── Reusable field wrapper ───────────────────────────────────
function Field({ label, hint, error, icon: Icon, compact, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label} {hint && <span className="text-slate-400 font-normal">{hint}</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className={`absolute ${compact ? 'left-3' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />}
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function inputCls(error, compact) {
  return `w-full ${compact ? 'pl-9 pr-3' : 'pl-10 pr-4'} py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-purple-100 ${
    error ? 'border-red-400' : 'border-slate-200 focus:border-purple-500'
  }`
}

// ─── "What's next" mini card (step 4) ─────────────────────────
function NextCard({ icon: Icon, label, to }) {
  return (
    <a href={to}
      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-100 hover:border-purple-200 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 group-hover:border-purple-200 group-hover:bg-purple-100 flex items-center justify-center transition-all">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <span className="text-xs font-bold text-slate-700 group-hover:text-purple-700 leading-tight text-center transition-colors">{label}</span>
    </a>
  )
}
