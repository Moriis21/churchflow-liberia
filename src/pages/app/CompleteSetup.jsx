// ============================================================
// ChurchFlow Liberia — Complete Church Setup
// Shown when a user is authenticated but has no church linked.
// Uses the setup-church edge function (service role, bypasses RLS).
// ============================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Church, MapPin, Phone, Mail, User, ChevronRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui'

// Functions URL — hardcoded so it never fails even if SDK can't derive it
const FUNCTIONS_URL = 'https://nihu7zi9.functions.insforge.app'

export default function CompleteSetup() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]     = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm]     = useState({
    churchName: '',
    fullName:   user?.profile?.full_name || user?.name || '',
    location:   '',
    phone:      '',
    email:      '',
  })
  const [errors, setErrors] = useState({})

  const set = field => e => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setErrors(p => ({ ...p, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.churchName.trim()) e.churchName = 'Church name is required'
    if (!form.fullName.trim())   e.fullName   = 'Your full name is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      // Pass userId + userEmail in the body — edge function verifies via service role
      const res = await fetch(`${FUNCTIONS_URL}/setup-church`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:     user?.id,
          userEmail:  user?.email,
          churchName: form.churchName.trim(),
          fullName:   form.fullName.trim(),
          role:       'church_admin',
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Setup failed (${res.status}): ${errText}`)
      }

      const result = await res.json()
      if (!result?.success) throw new Error(result?.error || 'Setup failed')

      // Update church additional fields if provided
      if (result.church?.id && (form.location || form.phone || form.email)) {
        await insforge.database
          .from('churches')
          .update({
            location: form.location.trim() || null,
            phone:    form.phone.trim()    || null,
            email:    form.email.trim()    || null,
          })
          .eq('id', result.church.id)
      }

      // Sync name to auth profile
      await insforge.auth.setProfile({
        name: form.fullName.trim(),
        role: 'church_admin',
      })

      toast.success('Church setup complete! Welcome to ChurchFlow.')
      setStep(2)

      // Reload the page so AuthContext re-hydrates with the new church
      setTimeout(() => window.location.href = '/app/dashboard', 1500)
    } catch (err) {
      toast.error(err.message || 'Setup failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Step 2: Success ───────────────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100
            flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E1B4B] mb-2">
            {form.churchName} is ready!
          </h2>
          <p className="text-sm text-slate-500">Redirecting to your dashboard…</p>
          <div className="mt-4 flex justify-center">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  // ── Step 1: Setup form ────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <img
            src="/logo.png"
            alt="ChurchFlow Liberia"
            className="w-10 h-10 rounded-xl object-contain flex-shrink-0"
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          <div style={{ display: 'none' }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500
              items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 3v4m0 0L9 9m3-2l3 2M5 21h14M5 21V10.5M19 21V10.5M9 8V6a3 3 0 016 0v2M9 8h6" />
            </svg>
          </div>
          <div>
            <span className="block text-base font-extrabold text-[#1E1B4B]">ChurchFlow</span>
            <span className="block text-[10px] font-semibold text-amber-500 tracking-widest uppercase">Liberia</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100
              flex items-center justify-center mb-4">
              <Church className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#1E1B4B] mb-1">Complete Your Setup</h1>
            <p className="text-sm text-slate-500">
              Your account was created but your church wasn't set up yet.
              Fill in your church details to get started.
            </p>
          </div>

          {/* Notice */}
          <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700 font-medium">
              Logged in as <span className="font-bold">{user?.email}</span>.
              Not you?{' '}
              <button
                onClick={() => logout().then(() => navigate('/login'))}
                className="underline hover:no-underline"
              >
                Sign out
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Your name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={form.fullName}
                  onChange={set('fullName')}
                  placeholder="e.g. John Doe"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all
                    focus:ring-2 focus:ring-purple-100
                    ${errors.fullName ? 'border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
            </div>

            {/* Church name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Church Name *
              </label>
              <div className="relative">
                <Church className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={form.churchName}
                  onChange={set('churchName')}
                  placeholder="e.g. Grace Community Church"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all
                    focus:ring-2 focus:ring-purple-100
                    ${errors.churchName ? 'border-red-400' : 'border-slate-200 focus:border-purple-500'}`}
                />
              </div>
              {errors.churchName && <p className="mt-1 text-xs text-red-600">{errors.churchName}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Location / Address <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={form.location}
                  onChange={set('location')}
                  placeholder="e.g. Sinkor, Monrovia, Liberia"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Phone + Email in a row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Church Phone <span className="text-slate-400 font-normal">(opt.)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="+231 770 000 000"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Church Email <span className="text-slate-400 font-normal">(opt.)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="church@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              type="submit"
              loading={saving}
              className="w-full h-11 font-semibold flex items-center justify-center gap-2"
            >
              {saving ? 'Setting up…' : (
                <>Complete Setup <ChevronRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          &copy; {new Date().getFullYear()} ChurchFlow Liberia
        </p>
      </div>
    </div>
  )
}
