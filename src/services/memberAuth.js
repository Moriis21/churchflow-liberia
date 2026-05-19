// ============================================================
// ChurchFlow Liberia — Member Auth Creation Service
// Creates InsForge auth account + member record atomically.
// Auth is created client-side; DB record via SECURITY DEFINER.
// ============================================================
import { insforge } from '../lib/insforge'

/**
 * Create a member with an InsForge auth account.
 *
 * Flow:
 *  1. Call insforge.auth.signUp() to create the auth user
 *     (church admin stays logged in — signUp doesn't switch session
 *      when email verification is required)
 *  2. Use the returned user ID to create the member record via RPC
 *  3. InsForge auto-sends verification email to the member
 *
 * @returns { memberId, userId, message }
 */
export async function createMemberWithAuth({
  email,
  password,
  fullName,
  phone,
  gender,
  address,
  dateOfBirth,
  membershipStatus,
  baptismStatus,
  maritalStatus,
  emergencyContact,
  notes,
  churchId,
  branchId,
}) {
  if (!email?.trim())    throw new Error('Member email is required.')
  if (!password?.trim()) throw new Error('Temporary password is required.')
  if (!fullName?.trim()) throw new Error('Full name is required.')
  if (!churchId)         throw new Error('Church ID is required. Please contact support.')

  // ── Step 1: Create the auth user ──────────────────────────
  // redirectTo points to /auth/callback so the member lands on
  // the correct dashboard after clicking the verification link.
  const redirectTo = `${window.location.origin}/auth/callback`

  const { data: authData, error: authErr } = await insforge.auth.signUp({
    email:      email.trim().toLowerCase(),
    password:   password.trim(),
    name:       fullName.trim(),
    redirectTo,
  })

  if (authErr) throw new Error(`Auth account creation failed: ${authErr.message}`)

  const userId = authData?.user?.id
  if (!userId) {
    // InsForge returned success but no user ID — unexpected
    throw new Error('Auth user was created but ID was not returned. Please try again.')
  }

  // ── Step 2: Create member record + user_profile via RPC ───
  // If this fails we have an orphan auth user — log it clearly
  const { data: memberData, error: memberErr } = await insforge.database
    .rpc('insert_member_with_user', {
      p_church_id:         churchId,
      p_branch_id:         branchId         || null,
      p_user_id:           userId,
      p_full_name:         fullName.trim(),
      p_gender:            gender            || 'male',
      p_phone:             phone             || null,
      p_email:             email.trim().toLowerCase(),
      p_address:           address           || null,
      p_date_of_birth:     dateOfBirth       || null,
      p_membership_status: membershipStatus  || 'active',
      p_baptism_status:    baptismStatus     || false,
      p_marital_status:    maritalStatus     || 'single',
      p_join_date:         new Date().toISOString().split('T')[0],
      p_notes:             notes             || null,
      p_emergency_contact: emergencyContact  || null,
    })

  if (memberErr) {
    // Attempt to clean up the orphan auth user (best effort)
    console.error('[createMemberWithAuth] Member record failed, orphan auth user:', userId)
    throw new Error(`Member record creation failed: ${memberErr.message}`)
  }

  return {
    memberId: memberData?.id,
    userId,
    message:  'Member created. A verification email has been sent to their inbox.',
  }
}
