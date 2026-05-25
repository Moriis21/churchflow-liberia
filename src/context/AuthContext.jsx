// ============================================================
// ChurchFlow Liberia — Auth Context (InsForge SDK)
//
// Role resolution order (DB is source of truth):
//   1. user_profiles.role     — definitive (set by SQL grant)
//   2. data.user.profile.role — cached on JWT for fast first render
//
// There is NO email-based super_admin fallback. The role lives in
// the DB only. To grant a super admin, run:
//   UPDATE user_profiles SET role='super_admin' WHERE id='<uuid>';
// ============================================================
import { createContext, useContext, useEffect, useState } from 'react'
import { insforge } from '../lib/insforge'
import { createAuditLog, AUDIT_ACTIONS } from '../services/auditLog'
import { userHasTwoFactor, verifyTwoFactorCode } from '../services/twoFactorService'

// ─── Role constants ───────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN:  'super_admin',
  CHURCH_ADMIN: 'church_admin',
  PASTOR:       'pastor',
  TREASURER:    'treasurer',
  SECRETARY:    'secretary',
  DEPT_LEADER:  'dept_leader',
  MEMBER:       'member',
}

// ─── Demo users (landing page only — no real DB) ─────────────
const DEMO_USERS = {
  [ROLES.CHURCH_ADMIN]: {
    id: 'demo-admin-001', email: 'admin@demo.lr', name: 'Pastor John Doe',
    user_metadata: { role: ROLES.CHURCH_ADMIN, name: 'Pastor John Doe', churchId: 'church-demo' },
  },
  [ROLES.PASTOR]: {
    id: 'demo-pastor-001', email: 'pastor@demo.lr', name: 'Pastor John Doe',
    user_metadata: { role: ROLES.PASTOR, name: 'Pastor John Doe', churchId: 'church-demo' },
  },
  [ROLES.TREASURER]: {
    id: 'demo-treasurer-001', email: 'treasurer@demo.lr', name: 'Deacon Peter Wreh',
    user_metadata: { role: ROLES.TREASURER, name: 'Deacon Peter Wreh', churchId: 'church-demo' },
  },
  [ROLES.MEMBER]: {
    id: 'demo-member-001', email: 'member@demo.lr', name: 'Mary Dahn',
    user_metadata: { role: ROLES.MEMBER, name: 'Mary Dahn', churchId: 'church-demo' },
  },
}

// ─── Context ──────────────────────────────────────────────────
const AuthContext = createContext({
  user: null, loading: true, churchData: null, churchId: null,
  isSuperAdmin: false, pendingVerificationEmail: null,
  login: async () => {}, register: async () => {},
  verifyEmail: async () => {}, resendVerification: async () => {},
  logout: async () => {}, demoLogin: () => {},
})

// ─── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [churchData, setChurchData] = useState(null)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null)
  const [pendingRegData, setPendingRegData] = useState(null)
  // ── 2FA gating: when set, the user has passed password but
  // hasn't yet entered their TOTP / backup code. UI must show the
  // code-entry form and call completeTwoFactor() before app loads.
  const [pendingTwoFactor, setPendingTwoFactor] = useState(null)

  // ── Hydrate on mount ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function hydrateAuth() {
      try {
        const { data, error } = await insforge.auth.getCurrentUser()
        if (cancelled) return
        if (!error && data?.user) {
          // 2FA gate: if the user has 2FA on AND this tab hasn't
          // verified yet, force re-verification.
          const verified = sessionStorage.getItem('cf_2fa_verified')
          const hasTwoFA = await userHasTwoFactor(data.user.id)
          if (hasTwoFA && verified !== data.user.id) {
            setPendingTwoFactor({ userId: data.user.id, email: data.user.email })
            return
          }
          await resolveUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void hydrateAuth()
    return () => { cancelled = true }
  }, [])

  // ── Core: resolve a logged-in auth user ──────────────────
  // Layer 1: read role from InsForge auth JWT profile (instant, no DB)
  // Layer 2: try DB lookup (works if RLS + JWT are functioning)
  // Layer 3: email hard-guarantee for super admin
  // Layer 4: sync role back to InsForge auth profile (self-healing)
  async function resolveUser(authUser) {
    const email = authUser.email || ''

    // ── Fast path: JWT profile claim (avoids DB round-trip on first render)
    const jwtProfile = authUser.profile || {}
    const jwtRole    = jwtProfile.role || authUser.metadata?.role || null

    setUser({
      ...authUser,
      role:    jwtRole,
      churchId: null,
      profile: jwtRole ? { ...jwtProfile, role: jwtRole, full_name: jwtProfile.name || jwtProfile.full_name } : null,
    })

    // Definitive DB lookup — overrides any JWT claim if they differ
    await fetchUserProfile(authUser.id, email, jwtRole)
  }

  // ── Sync role into InsForge auth profile (JWT claim) ─────
  // This stores role in auth.users.profile so it's returned by
  // getCurrentUser() on every future login — no DB query needed.
  async function syncRoleToAuthProfile(role, name) {
    try {
      await insforge.auth.setProfile({ role, name: name || undefined })
    } catch (e) {
      // Non-fatal — will retry on next login
      console.warn('[AuthContext] syncRoleToAuthProfile failed:', e?.message)
    }
  }

  // ── DB profile lookup (Layer 2) ───────────────────────────
  // Uses SECURITY DEFINER RPC as primary path — bypasses RLS,
  // works even when InsForge SDK doesn't forward JWT to PostgREST.
  async function fetchUserProfile(userId, userEmail, knownRole) {
    try {
      let profileData = null
      let churchData_  = null

      // Path A: get_my_profile RPC (SECURITY DEFINER — always works)
      const { data: rpcResult } = await insforge.database
        .rpc('get_my_profile', { p_user_id: userId })

      if (rpcResult?.profile) {
        profileData = rpcResult.profile
        churchData_  = rpcResult.church || null
      }

      // Path B: direct query fallback (if RPC is unavailable)
      if (!profileData) {
        const { data: byId } = await insforge.database
          .from('user_profiles').select('*').eq('id', userId).maybeSingle()
        profileData = byId || null
      }

      // Path C: email lookup fallback
      if (!profileData && userEmail) {
        const { data: byEmail } = await insforge.database
          .from('user_profiles').select('*').eq('email', userEmail).maybeSingle()
        if (byEmail) profileData = byEmail
      }

      // Path D: create profile via RPC if still nothing
      // (Regular users only — never auto-create with super_admin role.)
      if (!profileData && userId) {
        const { data: upserted } = await insforge.database
          .from('user_profiles')
          .upsert([{
            id:        userId,
            email:     userEmail || null,
            full_name: userEmail?.split('@')[0] || 'User',
            role:      knownRole === ROLES.SUPER_ADMIN ? ROLES.MEMBER : (knownRole || ROLES.MEMBER),
            is_active: true,
          }], { onConflict: 'id' })
          .select().maybeSingle()
        if (upserted) profileData = upserted
      }

      // ── Apply DB profile ───────────────────────────────────
      if (profileData) {
        // DB role takes precedence over JWT role (DB is the source of truth)
        const resolvedRole = profileData.role || knownRole

        setUser(prev => ({
          ...prev,
          profile:  profileData,
          role:     resolvedRole,
          churchId: profileData.church_id || null,
        }))

        // Sync role back to auth profile so future logins don't need DB
        await syncRoleToAuthProfile(resolvedRole, profileData.full_name)

        if (resolvedRole === ROLES.SUPER_ADMIN) {
          setChurchData(null)
          return
        }

        // Use church from RPC result if available, otherwise fetch
        if (churchData_) {
          setChurchData(churchData_)
        } else if (profileData.church_id) {
          const { data: churchRow } = await insforge.database
            .from('churches').select('*').eq('id', profileData.church_id).maybeSingle()
          if (churchRow) setChurchData(churchRow)
        }
      }
      // If profileData is null: earlyRole from resolveUser() is still active
    } catch (err) {
      console.error('[AuthContext] fetchUserProfile exception:', err.message)
      // earlyRole from resolveUser() still protects the user
    }
  }

  // ── Login ─────────────────────────────────────────────────
  // 1. InsForge auth via email + password
  // 2. Resolve profile (DB row) — single source of truth for role
  // 3. Block account if is_active = false or access_revoked = true
  // 4. Audit log success/failure
  async function login(email, password) {
    setLoading(true)
    try {
      const { data, error } = await insforge.auth.signInWithPassword({ email, password })
      if (error) {
        // Surface a clean message regardless of InsForge wording
        const msg = (error.message || '').toLowerCase()
        const friendly = /invalid|password|credential|not.*found|user|email/i.test(msg)
          ? new Error('Invalid email or password.')
          : error
        throw friendly
      }

      // ── 2FA gate ────────────────────────────────────────────
      // Before resolving the full app session, ask whether this
      // user has 2FA on. If yes, hold off — UI shows code entry.
      const hasTwoFA = await userHasTwoFactor(data.user.id)
      if (hasTwoFA) {
        setPendingTwoFactor({ userId: data.user.id, email })
        // Don't resolveUser yet — user state stays null until verified.
        return { data, error: null, requires2fa: true }
      }

      await resolveUser(data.user)

      // ── Suspended / access-revoked check ────────────────────
      // resolveUser() populates user.profile asynchronously, so check
      // the DB row directly here too — single round-trip, definitive.
      const { data: profile } = await insforge.database
        .from('user_profiles')
        .select('id, is_active, access_revoked, status, role')
        .eq('id', data.user.id)
        .maybeSingle()

      const inactive = profile && (
        profile.is_active === false ||
        profile.access_revoked === true ||
        ['suspended', 'deleted', 'disabled'].includes((profile.status || '').toLowerCase())
      )

      if (inactive) {
        createAuditLog({
          action:      AUDIT_ACTIONS.ACCESS_DENIED || 'access_denied',
          actor:       { id: data.user.id, name: email, role: profile?.role || 'unknown' },
          description: `Suspended/revoked account tried to log in: ${email}`,
        })
        // Sign them right back out and clear local state
        try { await insforge.auth.signOut() } catch {}
        setUser(null)
        setChurchData(null)
        return { data: null, error: new Error('Your account access has been disabled. Please contact your church administrator.') }
      }

      createAuditLog({
        action:      AUDIT_ACTIONS.LOGIN,
        actor:       { id: data.user.id, name: email, role: data.user.profile?.role || profile?.role || 'unknown' },
        description: `Signed in: ${email}`,
      })
      return { data, error: null }
    } catch (error) {
      createAuditLog({
        action:      AUDIT_ACTIONS.FAILED_LOGIN,
        actor:       { id: null, name: email, role: 'unknown' },
        description: `Failed login: ${email} — ${error?.message || ''}`,
      })
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // ── Complete the 2FA step started by login() ──────────────
  // Returns { ok, error }. On success, the full session loads.
  async function completeTwoFactor(code) {
    if (!pendingTwoFactor) {
      return { ok: false, error: 'No pending 2FA login.' }
    }
    setLoading(true)
    try {
      const ok = await verifyTwoFactorCode(code)
      if (!ok) {
        createAuditLog({
          action:      AUDIT_ACTIONS.FAILED_LOGIN,
          actor:       { id: pendingTwoFactor.userId, name: pendingTwoFactor.email, role: 'unknown' },
          description: `Failed 2FA code: ${pendingTwoFactor.email}`,
        })
        return { ok: false, error: 'Invalid code. Try again or use a backup code.' }
      }
      // Re-hydrate from the active session
      const { data } = await insforge.auth.getCurrentUser()
      if (data?.user) {
        sessionStorage.setItem('cf_2fa_verified', data.user.id)
        await resolveUser(data.user)
      }
      setPendingTwoFactor(null)
      createAuditLog({
        action:      AUDIT_ACTIONS.LOGIN,
        actor:       { id: pendingTwoFactor.userId, name: pendingTwoFactor.email, role: 'unknown' },
        description: `2FA-verified login: ${pendingTwoFactor.email}`,
      })
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err?.message || 'Verification failed.' }
    } finally {
      setLoading(false)
    }
  }

  // ── Cancel pending 2FA (used by Login form's "back" button) ──
  async function cancelTwoFactor() {
    setPendingTwoFactor(null)
    try { await insforge.auth.signOut() } catch {}
    setUser(null)
    setChurchData(null)
  }

  // ── Register ──────────────────────────────────────────────
  async function register(email, password, name, churchName, role = ROLES.CHURCH_ADMIN, existingChurchId = null) {
    setLoading(true)
    try {
      const { data, error } = await insforge.auth.signUp({
        email, password, name,
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) throw error

      if (data?.requireEmailVerification) {
        setPendingVerificationEmail(email)
        setPendingRegData({ name, churchName, role, existingChurchId })
        return { data: { ...data, requireEmailVerification: true }, error: null }
      }

      if (data?.user) {
        await _createChurchAndProfile(data.user, name, churchName, role, existingChurchId)
        await resolveUser(data.user)
      }
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // ── Verify email OTP ──────────────────────────────────────
  async function verifyEmail(otp) {
    if (!pendingVerificationEmail) {
      return { data: null, error: new Error('No pending verification email') }
    }
    setLoading(true)
    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email: pendingVerificationEmail, otp,
      })
      if (error) throw error
      if (data?.user) {
        const { name, churchName, role, existingChurchId } = pendingRegData || {}
        await _createChurchAndProfile(data.user, name, churchName, role, existingChurchId)
        await resolveUser(data.user)
        setPendingVerificationEmail(null)
        setPendingRegData(null)
      }
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // ── Resend verification ───────────────────────────────────
  async function resendVerification() {
    if (!pendingVerificationEmail) return
    await insforge.auth.resendVerificationEmail({
      email: pendingVerificationEmail,
      redirectTo: `${window.location.origin}/login`,
    })
  }

  // ── Create church + profile via SECURITY DEFINER SQL function ──
  // Direct DB inserts fail (RLS blocks them — auth.uid() = null from browser).
  // The create_church_setup() function is SECURITY DEFINER so it runs as
  // postgres user and bypasses RLS. Called via insforge.database.rpc()
  // which works from the browser with no CORS issues.
  async function _createChurchAndProfile(authedUser, name, churchName, role, existingChurchId = null) {
    try {
      if (!existingChurchId && !churchName?.trim()) {
        throw new Error('Church name is required.')
      }

      const { data: result, error: rpcErr } = await insforge.database
        .rpc('create_church_setup', {
          p_user_id:    authedUser.id,
          p_user_email: authedUser.email || null,
          p_church_name: churchName?.trim() || null,
          p_full_name:   name || authedUser.email,
          p_role:        role || ROLES.CHURCH_ADMIN,
        })

      if (rpcErr) throw rpcErr
      if (!result?.success) throw new Error(result?.error || 'Setup failed')

      if (result.church) setChurchData(result.church)

      // Sync role to auth profile so future logins work without DB
      await syncRoleToAuthProfile(role || ROLES.CHURCH_ADMIN, name || authedUser.email)
    } catch (err) {
      console.error('[AuthContext] _createChurchAndProfile error:', err.message)
      throw err
    }
  }

  // ── Logout ────────────────────────────────────────────────
  async function logout() {
    setLoading(true)
    // Log before clearing state
    if (user) {
      createAuditLog({
        action:      AUDIT_ACTIONS.LOGOUT,
        actor:       { id: user.id, name: user.email, role: user.role || user.profile?.role },
        description: `Signed out: ${user.email}`,
      })
    }
    try {
      await insforge.auth.signOut()
    } catch (err) {
      console.error('Logout error:', err.message)
    } finally {
      // ── Clear ALL cached session state ─────────────────────
      // Role / churchId / profile must never survive a logout.
      setUser(null)
      setChurchData(null)
      try {
        if (typeof window !== 'undefined') {
          // App-owned keys (be explicit; don't blow away unrelated data)
          ;[
            'pending_church_id', 'pending_church_name',
            'cf_role', 'cf_church_id', 'cf_profile',
            'church_id', 'current_branch_id',
            'cf_2fa_verified',
          ].forEach((k) => {
            try { window.localStorage.removeItem(k) } catch {}
            try { window.sessionStorage.removeItem(k) } catch {}
          })
        }
      } catch {}
      setLoading(false)
    }
  }

  // ── Demo login — DEV BUILDS ONLY ───────────────────────────
  // Production builds get a no-op so the UI buttons (if they leak)
  // can't bypass real auth. We're explicit so the build can statically
  // tree-shake DEMO_USERS in prod.
  function demoLogin(role = ROLES.CHURCH_ADMIN) {
    if (!import.meta.env.DEV) {
      console.warn('[AuthContext] demoLogin disabled in production')
      return
    }
    const mockUser    = DEMO_USERS[role] ?? DEMO_USERS[ROLES.CHURCH_ADMIN]
    const demoChurchId = 'church-demo'
    setUser({
      ...mockUser,
      churchId: demoChurchId,
      role:     mockUser.user_metadata.role,
      profile: {
        id:        mockUser.id,
        full_name: mockUser.name,
        role:      mockUser.user_metadata.role,
        church_id: demoChurchId,
      },
    })
    setChurchData({
      id: demoChurchId, name: 'Grace Community Church',
      location: 'Monrovia, Liberia', currency: 'LRD', logo: null,
    })
    setLoading(false)
  }

  // ── Derived values ────────────────────────────────────────
  const churchId = user?.churchId || user?.profile?.church_id || null

  // isSuperAdmin reads ONLY from the resolved role (DB-backed).
  // No email-based fallback — role lives in user_profiles.role only.
  const isSuperAdmin = !!(
    user?.role === ROLES.SUPER_ADMIN ||
    user?.profile?.role === ROLES.SUPER_ADMIN
  )

  return (
    <AuthContext.Provider value={{
      user, loading, churchData, churchId, isSuperAdmin,
      pendingVerificationEmail,
      pendingTwoFactor,
      login, completeTwoFactor, cancelTwoFactor,
      register, verifyEmail, resendVerification, logout, demoLogin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export default AuthContext
