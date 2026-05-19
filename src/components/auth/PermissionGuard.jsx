// ============================================================
// ChurchFlow Liberia — Permission Guard
//
// Wraps any route/page. Checks whether the current user's role
// is permitted to access it. Shows "Access Denied" if not.
//
// Usage:
//   <PermissionGuard routeKey="finance">
//     <Finance />
//   </PermissionGuard>
//
// routeKey must match a key in ROLE_ROUTES in permissions.js.
// Super Admin always bypasses the check.
// ============================================================
import { ShieldX, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { canAccess } from '../../utils/permissions'

// ─── Access Denied screen ─────────────────────────────────────
function AccessDenied({ role }) {
  const roleLabel = {
    member:      'Member',
    dept_leader: 'Department Leader',
    treasurer:   'Treasurer',
    secretary:   'Secretary',
    pastor:      'Pastor',
    church_admin:'Church Admin',
    super_admin: 'Super Admin',
  }[role] || 'User'

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-6 shadow-sm">
        <ShieldX className="w-10 h-10 text-red-400" />
      </div>

      {/* Text */}
      <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Access Denied</h1>
      <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-1">
        Your account role (<span className="font-semibold text-slate-700">{roleLabel}</span>) does
        not have permission to view this page.
      </p>
      <p className="text-slate-400 text-xs mb-8">
        Contact your church administrator if you believe this is an error.
      </p>

      {/* Back button */}
      <Link
        to="/app/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors shadow-sm"
      >
        <Home className="w-4 h-4" />
        Back to My Dashboard
      </Link>
    </div>
  )
}

// ─── Permission Guard ─────────────────────────────────────────
export default function PermissionGuard({ routeKey, children }) {
  const { user, isSuperAdmin, loading } = useAuth()

  // Show nothing while auth state is being resolved
  if (loading) return null

  // Super Admin bypasses all permission checks
  if (isSuperAdmin) return children

  // Resolve role from auth context
  const role = user?.profile?.role || user?.role || user?.user_metadata?.role || 'member'

  if (!canAccess(role, routeKey)) {
    return <AccessDenied role={role} />
  }

  return children
}
