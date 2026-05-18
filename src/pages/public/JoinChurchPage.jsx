// ============================================================
// ChurchFlow Liberia — Join Church Page (/join/:churchId)
// ============================================================
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Church, MapPin, ArrowRight, AlertCircle } from 'lucide-react'
import { insforge } from '../../lib/insforge'

// ─── Component ───────────────────────────────────────────────
export default function JoinChurchPage() {
  const { churchId } = useParams()
  const navigate = useNavigate()

  const [church, setChurch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // ── Fetch church record on mount ─────────────────────────
  useEffect(() => {
    if (!churchId) {
      setNotFound(true)
      setLoading(false)
      return
    }

    async function loadChurch() {
      try {
        const { data, error } = await insforge.database
          .from('churches')
          .select('id, name, location')
          .eq('id', churchId)
          .single()

        if (error || !data) {
          setNotFound(true)
        } else {
          setChurch(data)
          // Store invite info in sessionStorage for the register page
          sessionStorage.setItem('pending_church_id', data.id)
          sessionStorage.setItem('pending_church_name', data.name)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    void loadChurch()
  }, [churchId])

  // ── Loading state ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Church className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Verifying church invitation...</p>
        </div>
      </div>
    )
  }

  // ── Not found / invalid link ─────────────────────────────
  if (notFound || !church) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1E1B4B] mb-2">Invalid Invitation Link</h2>
          <p className="text-slate-500 text-sm mb-6">
            Invalid invitation link. Please contact your church administrator.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // ── Welcome card ────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] p-4">
      {/* Decorative blobs */}
      <div className="fixed -top-32 -left-32 w-96 h-96 rounded-full bg-purple-400/10 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
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
        <div className="bg-white rounded-2xl shadow-xl shadow-purple-100/60 border border-slate-100 p-8 text-center">
          {/* Church logo circle */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/30">
            <Church className="w-9 h-9 text-white" />
          </div>

          {/* Invitation label */}
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-2">
            You're invited to join
          </p>

          {/* Church name */}
          <h1 className="text-2xl font-extrabold text-[#1E1B4B] leading-tight mb-2">
            {church.name}
          </h1>

          {/* Location */}
          {church.location && (
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-sm mb-7">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{church.location}</span>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-slate-100 mb-6" />

          <p className="text-slate-500 text-sm mb-6">
            Create your member account to connect with your church community, access announcements, and stay engaged.
          </p>

          {/* Join button */}
          <button
            onClick={() => navigate('/register?role=member')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-purple-500/25 mb-4"
          >
            Join {church.name}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Sign in link */}
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          By joining, you agree to our Terms of Service &amp; Privacy Policy
        </p>
      </div>
    </div>
  )
}
