// ============================================================
// ChurchFlow Liberia — Sidebar
// ============================================================
import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
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
  BarChart3,
  GitBranch,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Check,
  X,
  Building2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import Avatar from '../ui/Avatar'

// ─── Church navigation (for pastors, admins, staff) ──────────
const CHURCH_NAV_SECTIONS = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'MINISTRY',
    items: [
      { to: '/app/members', icon: Users, label: 'Members' },
      { to: '/app/attendance', icon: ClipboardCheck, label: 'Attendance' },
      { to: '/app/departments', icon: Layers, label: 'Departments' },
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
      { to: '/app/events', icon: CalendarDays, label: 'Events' },
      { to: '/app/visitors', icon: UserPlus, label: 'Visitors' },
      { to: '/app/prayer-requests', icon: HandHeart, label: 'Prayer Requests' },
    ],
  },
  {
    label: 'MEDIA',
    items: [
      { to: '/app/sermons', icon: PlaySquare, label: 'Sermons & Live' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { to: '/app/reports', icon: BarChart3, label: 'Reports' },
      { to: '/app/branches', icon: GitBranch, label: 'Branches' },
      { to: '/app/settings', icon: Settings, label: 'Settings' },
      { to: '/app/users', icon: ShieldCheck, label: 'User Management' },
    ],
  },
]

// ─── Super admin navigation (platform owner) ─────────────────
const SUPER_ADMIN_NAV_SECTIONS = [
  {
    label: 'PLATFORM OVERVIEW',
    items: [
      { to: '/app/super-admin', icon: LayoutDashboard, label: 'Platform Dashboard' },
    ],
  },
  {
    label: 'CHURCH MANAGEMENT',
    items: [
      { to: '/app/super-admin', icon: Building2, label: 'All Churches' },
      { to: '/app/members', icon: Users, label: 'All Members' },
      { to: '/app/finance', icon: Wallet, label: 'All Finances' },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { to: '/app/sermons', icon: PlaySquare, label: 'Sermons' },
      { to: '/app/reports', icon: BarChart3, label: 'Reports' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/app/users', icon: ShieldCheck, label: 'User Management' },
      { to: '/app/super-admin-settings', icon: Settings, label: 'Platform Settings' },
    ],
  },
]

// ─── Role label formatter ─────────────────────────────────
function formatRole(role = '') {
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── Branch Selector ──────────────────────────────────────
function BranchSelector({ branches, currentBranch, onSwitch }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl
          bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/25
          text-white text-sm font-medium transition-all duration-200 group"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-sm shadow-emerald-400/50" />
          <span className="truncate">{currentBranch?.name ?? 'Select Branch'}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 text-white/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-2 bg-[#2D1F6E] border border-white/15 rounded-xl
            shadow-2xl shadow-black/40 z-50 overflow-hidden
            animate-[sidebarDropIn_0.18s_ease-out]"
        >
          {branches.map((branch) => {
            const isActive = currentBranch?.id === branch.id
            return (
              <button
                key={branch.id}
                role="option"
                aria-selected={isActive}
                onClick={() => { onSwitch(branch.id); setOpen(false) }}
                className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between gap-2
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <div className="min-w-0">
                  <div className="truncate">{branch.name}</div>
                  <div className="text-xs text-white/45 truncate">{branch.location}</div>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Nav Item ─────────────────────────────────────────────
function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
          'transition-all duration-200 ease-in-out',
          isActive
            ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-900/40'
            : 'text-white/65 hover:text-white hover:bg-white/10',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex-shrink-0 transition-all duration-200 ${
              isActive
                ? 'text-white drop-shadow-sm'
                : 'text-white/55 group-hover:text-white/90'
            }`}
          >
            <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.2 : 1.8} />
          </span>
          <span className="truncate">{label}</span>
          {isActive && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0" />
          )}
        </>
      )}
    </NavLink>
  )
}

// ─── Sidebar Component ────────────────────────────────────
export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isSuperAdmin } = useAuth()
  const { church, branches, currentBranch, switchBranch } = useChurch()
  const navigate = useNavigate()

  const userName  = user?.profile?.full_name ?? user?.name ?? user?.user_metadata?.name ?? 'User'
  const userRole  = user?.role ?? user?.profile?.role ?? user?.user_metadata?.role ?? ''
  const userEmail = user?.email ?? ''
  const avatarUrl = user?.profile?.avatar_url ?? null

  // Pick the correct nav structure
  const navSections = isSuperAdmin ? SUPER_ADMIN_NAV_SECTIONS : CHURCH_NAV_SECTIONS

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  // ── Sidebar inner content (shared between desktop + mobile) ──
  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="ChurchFlow Liberia"
            className="w-10 h-10 rounded-xl object-contain flex-shrink-0"
          />
          <div className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              ChurchFlow
            </span>
            <span className="block text-[10px] font-medium text-amber-400/90 tracking-widest uppercase">
              Liberia
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Church name + branch selector (church users only) ── */}
      {!isSuperAdmin && (
        <div className="px-4 pb-4 flex-shrink-0 border-b border-white/10">
          <div className="mb-2.5 px-1">
            <p className="text-[10px] font-semibold tracking-widest text-white/35 uppercase mb-0.5">
              Church
            </p>
            <p className="text-sm font-bold text-white truncate leading-tight">
              {church?.name ?? 'My Church'}
            </p>
            <p className="text-xs text-white/45 truncate">{church?.location ?? ''}</p>
          </div>
          <BranchSelector
            branches={branches}
            currentBranch={currentBranch}
            onSwitch={switchBranch}
          />
        </div>
      )}

      {/* ── Platform label (super admin only) ────────────── */}
      {isSuperAdmin && (
        <div className="px-4 pb-4 flex-shrink-0 border-b border-white/10">
          <div className="px-1">
            <p className="text-[10px] font-semibold tracking-widest text-white/35 uppercase mb-0.5">
              Platform
            </p>
            <p className="text-sm font-bold text-white truncate leading-tight">
              ChurchFlow Liberia
            </p>
            <p className="text-xs text-white/45">All churches &amp; data</p>
          </div>
        </div>
      )}

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-4 space-y-4
        scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest text-white/30 uppercase select-none">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={`${item.to}-${item.label}`}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User footer ──────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={userName} src={avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-white truncate leading-tight">{userName}</p>
              {isSuperAdmin && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold
                  bg-amber-400/20 text-amber-300 border border-amber-400/30 whitespace-nowrap">
                  Super Admin
                </span>
              )}
            </div>
            <p className="text-xs text-white/45 truncate">
              {userRole ? formatRole(userRole) : userEmail}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
              text-white/40 hover:text-red-400 hover:bg-red-400/15
              transition-all duration-200"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar (always visible md+) ───────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-[260px] z-30
          bg-gradient-to-b from-[#1E1B4B] via-[#231C5A] to-[#1A1745]
          border-r border-white/8 shadow-xl shadow-black/20"
        aria-label="Main navigation"
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile: backdrop ────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile: slide-in drawer ─────────────────────────── */}
      <aside
        className={[
          'fixed left-0 top-0 h-screen w-[280px] z-50 md:hidden flex flex-col',
          'bg-gradient-to-b from-[#1E1B4B] via-[#231C5A] to-[#1A1745]',
          'border-r border-white/8 shadow-2xl',
          'transform transition-transform duration-300 ease-in-out will-change-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        {sidebarContent}
      </aside>

      <style>{`
        @keyframes sidebarDropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
