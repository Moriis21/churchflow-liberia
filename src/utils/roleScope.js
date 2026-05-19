// ============================================================
// ChurchFlow Liberia — Role Scope Utilities
//
// Scope definitions:
//   'platform' — Super Admin operating across all churches
//   'church'   — Church-level role with a specific church_id
//   null       — Church role but church not configured yet
// ============================================================

export const SCOPE = {
  PLATFORM: 'platform',
  CHURCH:   'church',
}

const PLATFORM_ROLES = ['super_admin']
const CHURCH_ROLES   = ['church_admin', 'pastor', 'treasurer', 'secretary', 'dept_leader', 'member']

// ─── Role type checks ─────────────────────────────────────────
export function isPlatformUser(role) {
  return PLATFORM_ROLES.includes(role)
}

export function isChurchUser(role) {
  return CHURCH_ROLES.includes(role)
}

// ─── Current scope based on auth + church context ────────────
export function getCurrentScope(isSuperAdmin, church) {
  if (isSuperAdmin) return SCOPE.PLATFORM
  if (church?.id)   return SCOPE.CHURCH
  return null   // church role but church not configured
}

// ─── React hook ───────────────────────────────────────────────
// Usage: const { scope, isPlatform, isChurch, requiresChurch } = useRoleScope()
import { useAuth }   from '../context/AuthContext'
import { useChurch } from '../context/ChurchContext'

export function useRoleScope() {
  const { isSuperAdmin } = useAuth()
  const { church }       = useChurch()

  const scope       = getCurrentScope(isSuperAdmin, church)
  const isPlatform  = scope === SCOPE.PLATFORM
  const isChurch    = scope === SCOPE.CHURCH
  // true when role is church-level but church_id is missing
  const requiresChurch = !isSuperAdmin && !church?.id

  return { scope, isPlatform, isChurch, requiresChurch, isSuperAdmin, church }
}
