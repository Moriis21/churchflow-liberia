// ============================================================
// ChurchFlow Liberia — Role Permissions & Navigation Config
// ============================================================
//
// Single source of truth for:
//  • Which routes each role can access
//  • Which sidebar items each role sees
//  • Permission checks used by PermissionGuard
// ============================================================
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Layers,
  Wallet,
  CalendarDays,
  UserPlus,
  HandHeart,
  PlaySquare,
  Radio,
  BarChart3,
  GitBranch,
  Settings,
  ShieldCheck,
  User,
  Building2,
} from 'lucide-react'

// ─── Route keys each role may access ─────────────────────────
// Super Admin bypasses this check entirely (checked separately).
// Keys must match the `routeKey` prop on each PermissionGuard.
export const ROLE_ROUTES = {
  church_admin: [
    'dashboard','members','members/:id',
    'attendance','finance','departments',
    'events','visitors','prayer-requests',
    'sermons','live-streams','reports',
    'branches','settings','users','profile',
  ],
  pastor: [
    'dashboard','members','members/:id',
    'attendance','departments',
    'events','visitors','prayer-requests',
    'sermons','live-streams','reports',
    'users','profile',
  ],
  treasurer: [
    'dashboard','finance','members','members/:id',
    'attendance','events','reports','profile',
  ],
  secretary: [
    'dashboard','members','members/:id',
    'attendance','events','visitors',
    'prayer-requests','sermons','live-streams',
    'reports','profile',
  ],
  dept_leader: [
    'dashboard','members','members/:id',
    'attendance','departments',
    'events','prayer-requests',
    'sermons','live-streams','profile',
  ],
  member: [
    'dashboard','profile',
    'events','prayer-requests',
    'sermons','live-streams',
  ],
}

// ─── Check if role has access to a route key ─────────────────
export function canAccess(role, routeKey, isSuperAdmin = false) {
  if (isSuperAdmin) return true
  const allowed = ROLE_ROUTES[role] || ROLE_ROUTES.member
  return allowed.includes(routeKey)
}

// ─── Nav sections per role ─────────────────────────────────────
export function getNavSections(role) {
  switch (role) {
    case 'church_admin': return CHURCH_ADMIN_NAV
    case 'pastor':       return PASTOR_NAV
    case 'treasurer':    return TREASURER_NAV
    case 'secretary':    return SECRETARY_NAV
    case 'dept_leader':  return DEPT_LEADER_NAV
    case 'member':       return MEMBER_NAV
    default:             return MEMBER_NAV
  }
}

// ─── Church Admin — full management access ────────────────────
export const CHURCH_ADMIN_NAV = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'MINISTRY',
    items: [
      { to: '/app/members',     icon: Users,          label: 'Members' },
      { to: '/app/attendance',  icon: ClipboardCheck, label: 'Attendance' },
      { to: '/app/departments', icon: Layers,         label: 'Departments' },
    ],
  },
  {
    label: 'FINANCES',
    items: [
      { to: '/app/finance', icon: Wallet, label: 'Finance' },
    ],
  },
  {
    label: 'OUTREACH',
    items: [
      { to: '/app/events',          icon: CalendarDays, label: 'Events' },
      { to: '/app/visitors',        icon: UserPlus,     label: 'Visitors' },
      { to: '/app/prayer-requests', icon: HandHeart,    label: 'Prayer Requests' },
    ],
  },
  {
    label: 'MEDIA',
    items: [
      { to: '/app/sermons',      icon: PlaySquare, label: 'Sermons' },
      { to: '/app/live-streams', icon: Radio,      label: 'Live Streams' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { to: '/app/reports',  icon: BarChart3,   label: 'Reports' },
      { to: '/app/branches', icon: GitBranch,   label: 'Branches' },
      { to: '/app/settings', icon: Settings,    label: 'Settings' },
      { to: '/app/users',    icon: ShieldCheck, label: 'User Management' },
    ],
  },
]

// ─── Pastor — ministry focus, no finance/settings/branches ────
export const PASTOR_NAV = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'MINISTRY',
    items: [
      { to: '/app/members',     icon: Users,          label: 'Members' },
      { to: '/app/attendance',  icon: ClipboardCheck, label: 'Attendance' },
      { to: '/app/departments', icon: Layers,         label: 'Departments' },
    ],
  },
  {
    label: 'OUTREACH',
    items: [
      { to: '/app/events',          icon: CalendarDays, label: 'Events' },
      { to: '/app/visitors',        icon: UserPlus,     label: 'Visitors' },
      { to: '/app/prayer-requests', icon: HandHeart,    label: 'Prayer Requests' },
    ],
  },
  {
    label: 'MEDIA',
    items: [
      { to: '/app/sermons',      icon: PlaySquare, label: 'Sermons' },
      { to: '/app/live-streams', icon: Radio,      label: 'Live Streams' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { to: '/app/reports', icon: BarChart3,   label: 'Reports' },
      { to: '/app/users',   icon: ShieldCheck, label: 'User Management' },
    ],
  },
]

// ─── Treasurer — finance-focused ──────────────────────────────
export const TREASURER_NAV = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'FINANCES',
    items: [
      { to: '/app/finance', icon: Wallet, label: 'Finance' },
    ],
  },
  {
    label: 'MINISTRY',
    items: [
      { to: '/app/members',    icon: Users,          label: 'Members' },
      { to: '/app/attendance', icon: ClipboardCheck, label: 'Attendance' },
    ],
  },
  {
    label: 'OUTREACH',
    items: [
      { to: '/app/events', icon: CalendarDays, label: 'Events' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { to: '/app/reports', icon: BarChart3, label: 'Reports' },
    ],
  },
]

// ─── Secretary — admin-adjacent, no finance ───────────────────
export const SECRETARY_NAV = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'MINISTRY',
    items: [
      { to: '/app/members',    icon: Users,          label: 'Members' },
      { to: '/app/attendance', icon: ClipboardCheck, label: 'Attendance' },
    ],
  },
  {
    label: 'OUTREACH',
    items: [
      { to: '/app/events',          icon: CalendarDays, label: 'Events' },
      { to: '/app/visitors',        icon: UserPlus,     label: 'Visitors' },
      { to: '/app/prayer-requests', icon: HandHeart,    label: 'Prayer Requests' },
    ],
  },
  {
    label: 'MEDIA',
    items: [
      { to: '/app/sermons',      icon: PlaySquare, label: 'Sermons' },
      { to: '/app/live-streams', icon: Radio,      label: 'Live Streams' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { to: '/app/reports', icon: BarChart3, label: 'Reports' },
    ],
  },
]

// ─── Department Leader — dept-focused ────────────────────────
export const DEPT_LEADER_NAV = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'MINISTRY',
    items: [
      { to: '/app/members',     icon: Users,          label: 'Members' },
      { to: '/app/attendance',  icon: ClipboardCheck, label: 'Attendance' },
      { to: '/app/departments', icon: Layers,         label: 'Departments' },
    ],
  },
  {
    label: 'OUTREACH',
    items: [
      { to: '/app/events',          icon: CalendarDays, label: 'Events' },
      { to: '/app/prayer-requests', icon: HandHeart,    label: 'Prayer Requests' },
    ],
  },
  {
    label: 'MEDIA',
    items: [
      { to: '/app/sermons',      icon: PlaySquare, label: 'Sermons' },
      { to: '/app/live-streams', icon: Radio,      label: 'Live Streams' },
    ],
  },
]

// ─── Member — personal pages only ────────────────────────────
// Members see NO church management pages.
export const MEMBER_NAV = [
  {
    label: 'MY CHURCH',
    items: [
      { to: '/app/dashboard',       icon: LayoutDashboard, label: 'My Dashboard' },
      { to: '/app/profile',         icon: User,            label: 'My Profile' },
      { to: '/app/events',          icon: CalendarDays,    label: 'Events' },
      { to: '/app/prayer-requests', icon: HandHeart,       label: 'Prayer Requests' },
    ],
  },
  {
    label: 'MEDIA',
    items: [
      { to: '/app/sermons',      icon: PlaySquare, label: 'Sermons' },
      { to: '/app/live-streams', icon: Radio,      label: 'Live Streams' },
    ],
  },
]
