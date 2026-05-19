// ============================================================
// ChurchFlow Liberia — Password Reset Service
// Role-based password reset using InsForge Auth.
// ============================================================
import { insforge } from '../lib/insforge'
import { createAuditLog, buildActor, AUDIT_ACTIONS } from './auditLog'

/**
 * Send a password reset email.
 * Caller must pass the actor (who is requesting) and the target email.
 *
 * Permission rules (enforced in UI — not enforced here at service level
 * since InsForge Auth doesn't distinguish who sends reset):
 *   super_admin  → anyone
 *   church_admin → users in own church only
 *   pastor       → members in own church only
 *   member       → only themselves
 */
export async function sendPasswordResetEmail({ targetEmail, actor, church }) {
  if (!targetEmail?.trim()) throw new Error('Target email is required.')

  const redirectTo = `${window.location.origin}/auth/callback`

  const { data, error } = await insforge.auth.sendResetPasswordEmail({
    email: targetEmail.trim().toLowerCase(),
  })

  if (error) throw new Error(error.message || 'Password reset failed.')

  // Audit log
  await createAuditLog({
    action:      AUDIT_ACTIONS.PASSWORD_RESET,
    actor:       buildActor(actor, church),
    entityType:  'user',
    entityId:    targetEmail,
    description: `Password reset email sent to ${targetEmail}`,
  })

  return { success: true, message: 'Password reset link sent successfully.' }
}

/**
 * Check if the acting user can reset the target user's password.
 */
export function canResetPassword(actorRole, targetRole, actorChurchId, targetChurchId) {
  if (actorRole === 'super_admin') return true

  // Must be same church
  if (actorChurchId !== targetChurchId) return false

  if (actorRole === 'church_admin') {
    // Church admin can reset anyone except super_admin
    return targetRole !== 'super_admin'
  }

  if (actorRole === 'pastor') {
    // Pastor can only reset members and dept_leaders
    return ['member', 'dept_leader'].includes(targetRole)
  }

  // Members can only reset themselves — handled separately
  return false
}
