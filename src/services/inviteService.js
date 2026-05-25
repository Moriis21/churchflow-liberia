// ============================================================
// ChurchFlow Liberia — Church Invite Service
//
// Wraps the SECURITY DEFINER RPCs so the rest of the app talks in
// plain JS objects:
//
//   createInvite({ churchId, branchId, role, maxUses, expiresAt })
//   validateInvite(token)            → { ok, invite?, church?, error? }
//   consumeInvite(token)             → { ok, error? }
//   listInvites(churchId)            → [...]
//   setInviteStatus(id, 'active'|'disabled')
//   inviteLinkFor(token)             → absolute URL
// ============================================================
import { insforge } from '../lib/insforge'

const INVITE_BASE = (typeof window !== 'undefined' && window.location?.origin) ||
  'https://churchflow-liberia.vercel.app'

export function inviteLinkFor(token) {
  return `${INVITE_BASE}/invite/${token}`
}

// Defaults: 50 uses, 30 days. Admins can override per-link.
const DEFAULT_MAX_USES   = 50
const DEFAULT_EXPIRY_DAYS = 30

function defaultExpiry() {
  const d = new Date()
  d.setDate(d.getDate() + DEFAULT_EXPIRY_DAYS)
  return d.toISOString()
}

export async function createInvite({
  churchId, branchId = null, role = 'member',
  maxUses = DEFAULT_MAX_USES, expiresAt = null, createdBy = null,
}) {
  // Apply default expiry only if caller didn't specify one explicitly
  const finalExpiry = expiresAt || defaultExpiry()
  if (!churchId) throw new Error('church_id is required to create an invite.')
  const { data, error } = await insforge.database.rpc('create_church_invite', {
    p_church_id:  churchId,
    p_branch_id:  branchId,
    p_role:       role,
    p_max_uses:   maxUses,
    p_expires_at: finalExpiry,
    p_created_by: createdBy,
  })
  if (error) throw new Error(`Failed to create invite: ${error.message}`)
  return data
}

export async function validateInvite(token) {
  if (!token) return { ok: false, error: 'missing_token' }
  const { data, error } = await insforge.database.rpc('validate_church_invite', { p_token: token })
  if (error) return { ok: false, error: error.message }
  return data || { ok: false, error: 'unknown' }
}

export async function consumeInvite(token) {
  if (!token) return { ok: false, error: 'missing_token' }
  const { data, error } = await insforge.database.rpc('consume_church_invite', { p_token: token })
  if (error) return { ok: false, error: error.message }
  return data || { ok: false, error: 'unknown' }
}

export async function listInvites(churchId) {
  if (!churchId) return []
  const { data, error } = await insforge.database.rpc('list_church_invites', { p_church_id: churchId })
  if (error) {
    console.warn('[inviteService] list failed:', error.message)
    return []
  }
  return data || []
}

export async function setInviteStatus(inviteId, status) {
  const { data, error } = await insforge.database.rpc('set_invite_status', {
    p_invite_id: inviteId,
    p_status:    status,
  })
  if (error) throw new Error(`Failed to update invite: ${error.message}`)
  return data
}

// Human-readable failure reason from validateInvite()
export function inviteErrorMessage(error) {
  switch (error) {
    case 'not_found': return 'This invite link is invalid.'
    case 'disabled':  return 'This invite link has been disabled by the church admin.'
    case 'expired':   return 'This invite link has expired.'
    case 'exhausted': return 'This invite link has reached its maximum number of uses.'
    case 'missing_token': return 'No invite token was provided.'
    default:          return 'This invite link is invalid or expired.'
  }
}
