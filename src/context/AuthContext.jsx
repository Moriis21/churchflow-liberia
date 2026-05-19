// ============================================================
// ChurchFlow Liberia — Auth Context (InsForge SDK)
// ============================================================
import { createContext, useContext, useEffect, useState } from 'react'
import { insforge } from '../lib/insforge'

// ─── Role constants ───────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  CHURCH_ADMIN: 'church_admin',
  PASTOR: 'pastor',
  TREASURER: 'treasurer',
  SECRETARY: 'secretary',
  DEPT_LEADER: 'dept_leader',
  MEMBER: 'member',
}

// ─── Demo users (used when InsForge is not yet connected) ─────
const DEMO_USERS = {
  [ROLES.SUPER_ADMIN]: {
    id: 'demo-super-001',
    email: 'superadmin@gracechurch.lr',
    name: 'Super Admin',
    user_metadata: {
      role: ROLES.SUPER_ADMIN,
      name: 'Super Admin',
      churchId: 'church-001',
    },
  },
  [ROLES.CHURCH_ADMIN]: {
    id: 'demo-admin-001',
    email: 'admin@gracechurch.lr',
    name: 'Pastor John Doe',
    user_metadata: {
      role: ROLES.CHURCH_ADMIN,
      name: 'Pastor John Doe',
      churchId: 'church-001',
    },
  },
  [ROLES.PASTOR]: {
    id: 'demo-pastor-001',
    email: 'pastor@gracechurch.lr',
    name: 'Pastor John Doe',
    user_metadata: {
      role: ROLES.PASTOR,
      name: 'Pastor John Doe',
      churchId: 'church-001',
    },
  },
  [ROLES.TREASURER]: {
    id: 'demo-treasurer-001',
    email: 'treasurer@gracechurch.lr',
    name: 'Deacon Peter Wreh',
    user_metadata: {
      role: ROLES.TREASURER,
      name: 'Deacon Peter Wreh',
      churchId: 'church-001',
    },
  },
  [ROLES.SECRETARY]: {
    id: 'demo-secretary-001',
    email: 'secretary@gracechurch.lr',
    name: 'Sister Agnes Moore',
    user_metadata: {
      role: ROLES.SECRETARY,
      name: 'Sister Agnes Moore',
      churchId: 'church-001',
    },
  },
  [ROLES.DEPT_LEADER]: {
    id: 'demo-deptleader-001',
    email: 'dept@gracechurch.lr',
    name: 'James Kollie',
    user_metadata: {
      role: ROLES.DEPT_LEADER,
      name: 'James Kollie',
      churchId: 'church-001',
    },
  },
  [ROLES.MEMBER]: {
    id: 'demo-member-001',
    email: 'member@gracechurch.lr',
    name: 'Mary Dahn',
    user_metadata: {
      role: ROLES.MEMBER,
      name: 'Mary Dahn',
      churchId: 'church-001',
    },
  },
}

// ─── Context creation ─────────────────────────────────────────
const AuthContext = createContext({
  user: null,
  loading: true,
  churchData: null,
  churchId: null,
  isSuperAdmin: false,
  pendingVerificationEmail: null,
  login: async () => {},
  register: async () => {},
  verifyEmail: async () => {},
  resendVerification: async () => {},
  logout: async () => {},
  demoLogin: () => {},
})

// ─── Provider ────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [churchData, setChurchData] = useState(null)
  // Holds email address while waiting for 6-digit verification code
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null)
  // Temporarily holds church/name info across the verify step
  const [pendingRegData, setPendingRegData] = useState(null)

  // ── Hydrate session on mount ─────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function hydrateAuth() {
      try {
        const { data, error } = await insforge.auth.getCurrentUser()
        if (cancelled) return

        if (!error && data?.user) {
          setUser(data.user)
          // Pass the email so fetchUserProfile can use it as fallback
          await fetchUserProfile(data.user.id, data.user.email)
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
    return () => {
      cancelled = true
    }
  }, [])

  // ── Fetch user_profiles for the authenticated user ───────────
  // Strategy:
  //   1. Try by auth user ID (normal path — works when RLS + JWT are correct)
  //   2. If not found, fall back to email lookup (covers Google OAuth / ID mismatch)
  //   3. If still not found, upsert a minimal profile so user isn't stuck as "Member"
  async function fetchUserProfile(userId, userEmail) {
    try {
      // ── Step 1: Try by user ID ────────────────────────────
      const { data: byId, error: err1 } = await insforge.database
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (err1) console.warn('[AuthContext] fetchUserProfile by-id error:', err1.message)

      let profileData = byId || null

      // ── Step 2: Fallback — try by email ───────────────────
      if (!profileData && userEmail) {
        const { data: byEmail } = await insforge.database
          .from('user_profiles')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle()

        if (byEmail) {
          profileData = byEmail
          // If found by email but ID differs, update the ID to match auth UID
          if (byEmail.id !== userId) {
            const { data: updated } = await insforge.database
              .from('user_profiles')
              .update({ id: userId })
              .eq('email', userEmail)
              .select()
              .maybeSingle()
            if (updated) profileData = updated
          }
        }
      }

      // ── Step 3: Still not found — upsert a profile ────────
      if (!profileData && userId) {
        const isSuperAdminEmail = userEmail?.toLowerCase() === 'morrisldorleyjr21@gmail.com'
        const { data: upserted } = await insforge.database
          .from('user_profiles')
          .upsert([{
            id:        userId,
            email:     userEmail || null,
            full_name: userEmail?.split('@')[0] || 'User',
            role:      isSuperAdminEmail ? 'super_admin' : 'member',
            is_active: true,
          }], { onConflict: 'id' })
          .select()
          .maybeSingle()
        if (upserted) profileData = upserted
      }

      // ── Apply profile to state ─────────────────────────────
      if (profileData) {
        setUser((prev) => ({
          ...prev,
          profile:  profileData,
          role:     profileData.role,
          churchId: profileData.church_id,
        }))

        if (profileData.role === 'super_admin') {
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
      } else {
        console.error('[AuthContext] Could not load or create profile for:', userId, userEmail)
      }
    } catch (err) {
      console.error('[AuthContext] fetchUserProfile exception:', err.message)
    }
  }

  // ── Fetch church data for the authenticated user (legacy fallback) ─
  async function fetchChurchData(authedUser) {
    try {
      const cId = authedUser?.user_metadata?.churchId
      if (!cId) return

      const { data, error } = await insforge.database
        .from('churches')
        .select('*')
        .eq('id', cId)
        .single()

      if (!error && data) {
        setChurchData(data)
      }
    } catch {
      // Non-fatal; church data will fall back to context defaults
    }
  }

  // ── Login ─────────────────────────────────────────────────
  async function login(email, password) {
    setLoading(true)
    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setUser(data.user)
      await fetchUserProfile(data.user.id, data.user.email)
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
        email,
        password,
        name,
        redirectTo: `${window.location.origin}/login`,
      })

      if (error) throw error

      if (data?.requireEmailVerification) {
        // Code-based verification: show 6-digit OTP input on the same page
        setPendingVerificationEmail(email)
        setPendingRegData({ name, churchName, role, existingChurchId })
        return { data: { ...data, requireEmailVerification: true }, error: null }
      }

      // No verification needed — user is already signed in
      if (data?.user) {
        await _createChurchAndProfile(data.user, name, churchName, role, existingChurchId)
        setUser(data.user)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // ── Verify email (6-digit OTP) ────────────────────────────
  async function verifyEmail(otp) {
    if (!pendingVerificationEmail) {
      return { data: null, error: new Error('No pending verification email') }
    }
    setLoading(true)
    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email: pendingVerificationEmail,
        otp,
      })

      if (error) throw error

      // verifyEmail auto-signs in on success
      if (data?.user) {
        const { name, churchName, role, existingChurchId } = pendingRegData || {}
        await _createChurchAndProfile(data.user, name, churchName, role, existingChurchId)
        setUser(data.user)
        await fetchUserProfile(data.user.id, data.user.email)
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

  // ── Resend verification email ─────────────────────────────
  async function resendVerification() {
    if (!pendingVerificationEmail) return
    await insforge.auth.resendVerificationEmail({
      email: pendingVerificationEmail,
      redirectTo: `${window.location.origin}/login`,
    })
  }

  // ── Internal: create church + user_profile after sign-up ─
  async function _createChurchAndProfile(authedUser, name, churchName, role, existingChurchId = null) {
    try {
      let churchId = existingChurchId

      if (!existingChurchId) {
        // Admin flow: create a new church record
        if (!churchName || !churchName.trim()) {
          throw new Error('Church name is required.')
        }
        const { data: newChurch, error: churchErr } = await insforge.database
          .from('churches')
          .insert([{
            name: churchName.trim(),
            owner_id: authedUser.id,
            currency: 'LRD',
          }])
          .select()
          .single()

        if (churchErr) throw churchErr
        churchId = newChurch.id
        setChurchData(newChurch)
      }

      // Create the user_profile record linked to the church
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

      // Update the auth profile display name
      await insforge.auth.setProfile({ name: name || authedUser.email })
    } catch (err) {
      console.error('Failed to create church/profile:', err.message)
    }
  }

  // ── Logout ────────────────────────────────────────────────
  async function logout() {
    setLoading(true)
    try {
      const { error } = await insforge.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Logout error:', error.message)
    } finally {
      setUser(null)
      setChurchData(null)
      setLoading(false)
    }
  }

  // ── Demo login (works without InsForge backend) ───────────
  /**
   * Set a mock user so the app works entirely with dummy data.
   * Default role is CHURCH_ADMIN (Pastor John Doe).
   * @param {string} role  One of the ROLES constant values
   */
  function demoLogin(role = ROLES.CHURCH_ADMIN) {
    const mockUser = DEMO_USERS[role] ?? DEMO_USERS[ROLES.CHURCH_ADMIN]
    const demoChurchId = 'church-001'
    setUser({
      ...mockUser,
      churchId: demoChurchId,
      role: mockUser.user_metadata.role,
      profile: {
        id: mockUser.id,
        full_name: mockUser.name,
        role: mockUser.user_metadata.role,
        church_id: demoChurchId,
      },
    })
    setChurchData({
      id: demoChurchId,
      name: 'Grace Community Church',
      location: 'Monrovia, Liberia',
      currency: 'LRD',
      logo: null,
    })
    setLoading(false)
  }

  // ── Derived churchId ──────────────────────────────────────
  const churchId = user?.churchId || user?.profile?.church_id || null

  // ── Derived isSuperAdmin ───────────────────────────────────
  const isSuperAdmin =
    user?.role === 'super_admin' || user?.profile?.role === 'super_admin'

  // ─────────────────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        churchData,
        churchId,
        isSuperAdmin,
        pendingVerificationEmail,
        login,
        register,
        verifyEmail,
        resendVerification,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
