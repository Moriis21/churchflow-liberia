// ============================================================
// ChurchFlow Liberia — Audit Log Service
// Logs all significant user actions platform-wide.
// Uses SECURITY DEFINER RPC to bypass RLS.
// ============================================================
import { insforge } from '../lib/insforge'

// ─── Action constants ─────────────────────────────────────────
export const AUDIT_ACTIONS = {
  LOGIN:                    'login',
  LOGOUT:                   'logout',
  FAILED_LOGIN:             'failed_login',
  PROFILE_UPDATE:           'profile_update',
  PROFILE_PHOTO_UPLOAD:     'profile_photo_upload',
  MEMBER_CREATED:           'member_created',
  MEMBER_UPDATED:           'member_updated',
  MEMBER_DELETED:           'member_deleted',
  CHURCH_CREATED:           'church_created',
  CHURCH_UPDATED:           'church_updated',
  DEPARTMENT_CREATED:       'department_created',
  DEPARTMENT_UPDATED:       'department_updated',
  FINANCE_RECORD_CREATED:   'finance_record_created',
  ATTENDANCE_SUBMITTED:     'attendance_submitted',
  EVENT_CREATED:            'event_created',
  SETTINGS_CHANGED:         'settings_changed',
  ROLE_CHANGED:             'role_changed',
  PASSWORD_RESET:           'password_reset',
  EMAIL_VERIFIED:           'email_verified',
  CHURCH_SETUP_COMPLETED:   'church_setup_completed',
  INVITE_CREATED:           'invite_created',
  INVITE_USED:              'invite_used',
  INVITE_DISABLED:          'invite_disabled',
  ACCESS_DENIED:            'access_denied',
  ACCOUNT_SUSPENDED:        'account_suspended',
  ADMIN_PASSWORD_RESET:     'admin_password_reset',
}

// ─── Get browser/device info ──────────────────────────────────
function getBrowserInfo() {
  const ua  = navigator.userAgent || ''
  let browser = 'Unknown'
  if (ua.includes('Chrome'))  browser = 'Chrome'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari'))  browser = 'Safari'
  else if (ua.includes('Edge'))    browser = 'Edge'
  return browser
}

// ─── Main log function ────────────────────────────────────────
/**
 * Write an audit log entry.
 * Non-blocking — never throws, always resolves.
 *
 * @param {object} params
 * @param {string} params.action   - One of AUDIT_ACTIONS values
 * @param {object} params.actor    - { id, name, role, churchId, churchName }
 * @param {string} [params.entityType] - 'member' | 'church' | 'department' | etc.
 * @param {string} [params.entityId]
 * @param {string} [params.description]
 */
export async function createAuditLog({
  action,
  actor = {},
  entityType = null,
  entityId   = null,
  description = null,
}) {
  try {
    await insforge.database.rpc('insert_audit_log', {
      p_actor_user_id: actor.id   || null,
      p_actor_name:    actor.name || null,
      p_actor_role:    actor.role || null,
      p_church_id:     actor.churchId   || null,
      p_church_name:   actor.churchName || null,
      p_action:        action,
      p_entity_type:   entityType,
      p_entity_id:     entityId   ? String(entityId) : null,
      p_description:   description,
      p_browser:       getBrowserInfo(),
    })
  } catch (err) {
    // Audit log errors must never break the main flow
    console.warn('[AuditLog] Failed to log action:', action, err?.message)
  }
}

// ─── Helper: build actor from AuthContext user ────────────────
export function buildActor(user, church) {
  return {
    id:         user?.id              || null,
    name:       user?.profile?.full_name || user?.name || user?.email || 'Unknown',
    role:       user?.role            || user?.profile?.role || 'member',
    churchId:   user?.profile?.church_id || church?.id || null,
    churchName: church?.name           || null,
  }
}
