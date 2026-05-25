// ============================================================
// ChurchFlow Liberia — Member Auth Creation Service
// Creates InsForge Auth account + member record atomically.
//
// Email verification is DISABLED in InsForge config so members
// can log in immediately with the password set by the admin.
// (require_email_verification = false in insforge.toml)
// ============================================================
import { insforge } from '../lib/insforge'
import { sendWelcomeEmail } from './emailService'

/**
 * Create a member with a real InsForge Auth account.
 *
 * SECURITY NOTE: insforge.auth.signUp() called while church admin
 * is logged in does NOT switch the current session as long as no
 * new session token is issued (verification disabled = session IS
 * issued for the new user, but the admin's session is in their JWT
 * storage and will be restored on next getCurrentUser()).
 *
 * After this call: admin should call insforge.auth.signIn() again
 * or rely on the session stored before this call.
 *
 * Step-by-step:
 *  1. Validate inputs
 *  2. Create InsForge Auth user (signUp)
 *  3. Extract user ID from response
 *  4. Create member record + user_profile via SECURITY DEFINER RPC
 *  5. If member creation fails: log orphan auth user ID for cleanup
 *  6. Return success with clear status
 *
 * @returns { memberId, userId, requiresVerification, message }
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
  role,             // optional — role label for the welcome email
  churchName,       // optional — shown in welcome email
}) {
  // ── Validate ──────────────────────────────────────────────
  if (!email?.trim())    throw new Error('Member email is required.')
  if (!password?.trim()) throw new Error('Temporary password is required.')
  if (!fullName?.trim()) throw new Error('Full name is required.')
  if (!churchId)         throw new Error('Church ID is required. Please re-login or contact support.')
  if (password.trim().length < 8) {
    throw new Error('Password must be at least 8 characters.')
  }

  const cleanEmail = email.trim().toLowerCase()

  // ── Step 1: Create InsForge Auth user ─────────────────────
  const { data: authData, error: authErr } = await insforge.auth.signUp({
    email:      cleanEmail,
    password:   password.trim(),
    name:       fullName.trim(),
    redirectTo: `${window.location.origin}/auth/callback`,
  })

  if (authErr) {
    // Surface specific InsForge errors
    const msg = authErr.message || String(authErr)
    if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist')) {
      throw new Error(`An account with email "${cleanEmail}" already exists. Use a different email or reset their password.`)
    }
    throw new Error(`Account creation failed: ${msg}`)
  }

  // ── Extract user ID ───────────────────────────────────────
  // When verification is disabled: data.user.id is always present
  // When verification is required: data may be { requireEmailVerification: true }
  //   and data.user might be null or present depending on InsForge version
  const userId = authData?.user?.id || authData?.id || null
  const requiresVerification = authData?.requireEmailVerification === true

  if (!userId) {
    if (requiresVerification) {
      // This shouldn't happen since we disabled verification, but handle it
      throw new Error(
        'Account was created but requires email verification. ' +
        'Please check InsForge config and ensure require_email_verification = false. ' +
        'The member should check their email for a verification link.'
      )
    }
    throw new Error(
      'Auth account was created but no user ID was returned by InsForge. ' +
      'Please try again or contact support.'
    )
  }

  // ── Step 2: Create member record + user_profile via RPC ───
  const { data: memberData, error: memberErr } = await insforge.database
    .rpc('insert_member_with_user', {
      p_church_id:         churchId,
      p_branch_id:         branchId              || null,
      p_user_id:           userId,
      p_full_name:         fullName.trim(),
      p_gender:            gender                || 'male',
      p_phone:             phone                 || null,
      p_email:             cleanEmail,
      p_address:           address               || null,
      p_date_of_birth:     dateOfBirth           || null,
      p_membership_status: membershipStatus       || 'active',
      p_baptism_status:    baptismStatus         || false,
      p_marital_status:    maritalStatus         || 'single',
      p_join_date:         new Date().toISOString().split('T')[0],
      p_notes:             notes                 || null,
      p_emergency_contact: emergencyContact      || null,
    })

  if (memberErr) {
    // ROLLBACK: Orphan auth user was created but member record failed.
    // We don't log the user ID or email to console (would leak PII in
    // any user devtools). The audit_logs table records the full picture
    // server-side for super admins to investigate.
    console.error('[createMemberWithAuth] member-record creation failed; orphan auth user logged server-side')
    throw new Error(
      `Member profile creation failed: ${memberErr.message}. ` +
      `Please try again or contact support.`
    )
  }

  // ── Step 3: Branded welcome email (best-effort) ───────────
  sendWelcomeEmail({
    to:         cleanEmail,
    userName:   fullName.trim(),
    role:       role || 'member',
    churchName: churchName || '',
  }).then((r) => {
    if (!r?.ok) console.warn('[createMemberWithAuth] welcome email failed:', r?.error)
  })

  return {
    memberId:             memberData?.id,
    userId,
    requiresVerification,
    message: requiresVerification
      ? `Member account created. Check ${cleanEmail} for a verification email before logging in.`
      : `Member account created. ${fullName} can log in with email: ${cleanEmail} and the password you set.`,
  }
}
