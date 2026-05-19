// ============================================================
// ChurchFlow Liberia — Auth Callback Page
// Handles InsForge email verification / OAuth redirect.
// Detects role and redirects to the correct dashboard.
// ============================================================
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { insforge } from '../../lib/insforge'
import { createAuditLog, AUDIT_ACTIONS } from '../../services/auditLog'

// ─── Role → route mapping ─────────────────────────────────────
export function getRoleRoute(role) {
  switch (role) {
    case 'super_admin':  return '/app/super-admin'
    case 'church_admin': return '/app/dashboard'
    case 'pastor':       return '/app/dashboard'
    case 'treasurer':    return '/app/finance'
    case 'secretary':    return '/app/dashboard'
    case 'dept_leader':  return '/app/dashboard'
    case 'member':       return '/app/dashboard'
    default:             return '/app/dashboard'
  }
}

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Verifying your account…')
  const [error,  setError]  = useState(null)

  useEffect(() => {
    async function handleCallback() {
      try {
        // Small delay to let InsForge process the verification
        await new Promise(r => setTimeout(r, 1000))

        const { data, error: sessionErr } = await insforge.auth.getCurrentUser()

        if (sessionErr || !data?.user) {
          setError(
            'Verification failed or link has expired. ' +
            'Please go back to the login page and try again, or contact your church administrator.'
          )
          return
        }

        const userId = data.user.id
        const email  = data.user.email

        setStatus('Loading your profile…')

        // Fetch profile via SECURITY DEFINER RPC — bypasses RLS
        const { data: rpcResult } = await insforge.database
          .rpc('get_my_profile', { p_user_id: userId })

        const profile = rpcResult?.profile || null
        let role = profile?.role

        // Fallback: JWT profile role
        if (!role) role = data.user.profile?.role || data.user.metadata?.role

        // Hard guarantee for super admin
        if (!role && email?.toLowerCase() === 'morrisldorleyjr21@gmail.com') {
          role = 'super_admin'
        }

        if (!role && !profile) {
          // Profile doesn't exist — account exists but not linked
          setError(
            'Your account exists but your church profile is not set up yet. ' +
            'Please contact your church administrator to complete your registration.'
          )
          return
        }

        // Audit log: successful login via callback
        createAuditLog({
          action:      AUDIT_ACTIONS.LOGIN,
          actor:       { id: userId, name: email, role: role || 'unknown' },
          description: `User verified and logged in: ${email}`,
        })

        const route = getRoleRoute(role)
        setStatus(`Welcome! Taking you to your dashboard…`)
        setTimeout(() => navigate(route, { replace: true }), 500)
      } catch (err) {
        console.error('[AuthCallback]', err)
        setError('Something went wrong during verification. Please try signing in again.')
      }
    }

    void handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#1E1B4B] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <img src="/logo.png" alt="ChurchFlow" className="w-12 h-12 rounded-xl object-contain"
          onError={e => e.currentTarget.style.display = 'none'} />
        <div>
          <p className="text-white text-xl font-extrabold tracking-tight">ChurchFlow</p>
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase">Liberia</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 p-8 w-full max-w-sm text-center">
        {error ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold mb-3">Problem Signing In</h2>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">{error}</p>
            <a href="/login"
              className="block w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl
                text-sm font-semibold transition-colors">
              Back to Sign In
            </a>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <div className="w-7 h-7 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-white text-lg font-bold mb-2">Almost there!</h2>
            <p className="text-white/60 text-sm">{status}</p>
            <div className="flex justify-center gap-1.5 mt-5">
              {[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-purple-400/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </>
        )}
      </div>

      <p className="text-white/30 text-xs mt-6">
        &copy; {new Date().getFullYear()} ChurchFlow Liberia
      </p>
    </div>
  )
}
