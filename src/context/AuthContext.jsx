// ============================================================
// ChurchFlow Liberia — Auth Context (InsForge SDK)
// Role resolution order (JWT-first, no RLS dependency):
//   1. data.user.profile.role  — InsForge auth profile (JWT claim)
//   2. user_profiles DB row    — if RLS + JWT work correctly
//   3. Email hard-guarantee    — morrisldorleyjr21@gmail.com = super_admin
// ============================================================
import { createContext, useContext, useEffect, useState } from 'react'
import { insforge } from '../lib/insforge'

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

// ─── Platform super admin email — never changes ───────────────
const SUPER_ADMIN_EMAIL = 'morrisldorleyjr21@gmail.com'

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

  // ── Hydrate on mount ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function hydrateAuth() {
      try {
        const { data, error } = await insforge.auth.getCurrentUser()
        if (cancelled) return
        if (!error && data?.user) {
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

    // ── Layer 1: JWT profile role ──────────────────────────
    // InsForge stores profile in auth.users.profile JSON column.
    // After setProfile() is called, this is available in the JWT.
    const jwtProfile = authUser.profile || {}
    const jwtRole    = jwtProfile.role || authUser.metadata?.role

    // Email guarantee — super admin email ALWAYS gets super_admin role
    const emailIsSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
    const guaranteedRole    = emailIsSuperAdmin ? ROLES.SUPER_ADMIN : null

    // Apply the best known role immediately (before DB query)
    const earlyRole = guaranteedRole || jwtRole || null
    setUser({
      ...authUser,
      role:    earlyRole,
      churchId: null,
      profile: earlyRole ? { ...jwtProfile, role: earlyRole, full_name: jwtProfile.name || jwtProfile.full_name } : null,
    })

    // Super admin doesn't need church data — resolve early
    if (earlyRole === ROLES.SUPER_ADMIN) {
      setChurchData(null)
      // Sync role to auth profile so Layer 1 always works on next login
      await syncRoleToAuthProfile(ROLES.SUPER_ADMIN, jwtProfile.name || 'Morris L. Dorley Jr')
      return
    }

    // ── Layer 2: DB lookup ─────────────────────────────────
    await fetchUserProfile(authUser.id, email, earlyRole)
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
  // Tries 3 paths. If ALL fail (RLS/JWT issue), the earlyRole from
  // Layer 1 is still in place so the user is NOT stuck as "member".
  async function fetchUserProfile(userId, userEmail, knownRole) {
    try {
      let profileData = null

      // Path A: by primary key (works when JWT is correctly forwarded)
      const { data: byId } = await insforge.database
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      profileData = byId || null

      // Path B: by email column (fallback for OAuth ID mismatch)
      if (!profileData && userEmail) {
        const { data: byEmail } = await insforge.database
          .from('user_profiles')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle()
        if (byEmail) {
          profileData = byEmail
          // Repair ID mismatch so Path A works next time
          if (byEmail.id !== userId) {
            const { data: repaired } = await insforge.database
              .from('user_profiles')
              .update({ id: userId })
              .eq('email', userEmail)
              .select()
              .maybeSingle()
            if (repaired) profileData = repaired
          }
        }
      }

      // Path C: upsert (creates profile if genuinely missing)
      if (!profileData && userId) {
        const emailIsSuperAdmin = userEmail?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
        const { data: upserted } = await insforge.database
          .from('user_profiles')
          .upsert([{
            id:        userId,
            email:     userEmail || null,
            full_name: userEmail?.split('@')[0] || 'User',
            role:      emailIsSuperAdmin ? ROLES.SUPER_ADMIN : (knownRole || ROLES.MEMBER),
            is_active: true,
          }], { onConflict: 'id' })
          .select()
          .maybeSingle()
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

        if (profileData.church_id) {
          const { data: churchRow } = await insforge.database
            .from('churches')
            .select('*')
            .eq('id', profileData.church_id)
            .maybeSingle()
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
  async function login(email, password) {
    setLoading(true)
    try {
      const { data, error } = await insforge.auth.signInWithPassword({ email, password })
      if (error) throw error
      await resolveUser(data.user)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
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

  // ── Create church + profile after registration ────────────
  async function _createChurchAndProfile(authedUser, name, churchName, role, existingChurchId = null) {
    try {
      let churchId = existingChurchId

      if (!existingChurchId) {
        if (!churchName?.trim()) throw new Error('Church name is required.')
        const { data: newChurch, error: churchErr } = await insforge.database
          .from('churches')
          .insert([{ name: churchName.trim(), owner_id: authedUser.id, currency: 'LRD' }])
          .select()
          .single()
        if (churchErr) throw churchErr
        churchId = newChurch.id
        setChurchData(newChurch)
      }

      await insforge.database
        .from('user_profiles')
        .upsert([{
          id:        authedUser.id,
          email:     authedUser.email || null,
          church_id: churchId,
          full_name: name || authedUser.email,
          role:      role || ROLES.CHURCH_ADMIN,
          is_active: true,
        }], { onConflict: 'id' })

      // Sync role to auth profile immediately on registration
      await syncRoleToAuthProfile(role || ROLES.CHURCH_ADMIN, name || authedUser.email)
    } catch (err) {
      console.error('[AuthContext] _createChurchAndProfile error:', err.message)
      throw err
    }
  }

  // ── Logout ────────────────────────────────────────────────
  async function logout() {
    setLoading(true)
    try {
      await insforge.auth.signOut()
    } catch (err) {
      console.error('Logout error:', err.message)
    } finally {
      setUser(null)
      setChurchData(null)
      setLoading(false)
    }
  }

  // ── Demo login (landing page only — no real DB) ───────────
  function demoLogin(role = ROLES.CHURCH_ADMIN) {
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

  // isSuperAdmin checks ALL possible role storage locations
  const isSuperAdmin = !!(
    user?.role === ROLES.SUPER_ADMIN ||
    user?.profile?.role === ROLES.SUPER_ADMIN ||
    user?.metadata?.role === ROLES.SUPER_ADMIN ||
    user?.user_metadata?.role === ROLES.SUPER_ADMIN ||
    // Email hard-guarantee: even if all state is wrong, email never lies
    user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
  )

  return (
    <AuthContext.Provider value={{
      user, loading, churchData, churchId, isSuperAdmin,
      pendingVerificationEmail,
      login, register, verifyEmail, resendVerification, logout, demoLogin,
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
