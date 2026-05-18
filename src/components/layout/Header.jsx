// ============================================================
// ChurchFlow Liberia — Header
// ============================================================
import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, User, Settings, LogOut, MapPin } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import Avatar from '../ui/Avatar'
import SearchBar from '../ui/SearchBar'

// ─── Route → Page title map ───────────────────────────────
const PAGE_TITLES = {
  '/app/dashboard':       'Dashboard',
  '/app/members':         'Members',
  '/app/attendance':      'Attendance',
  '/app/departments':     'Departments',
  '/app/finance':         'Finance',
  '/app/events':          'Events',
  '/app/visitors':        'Visitors',
  '/app/prayer-requests': 'Prayer Requests',
  '/app/sermons':         'Sermons & Live',
  '/app/reports':         'Reports',
  '/app/branches':        'Branches',
  '/app/settings':        'Settings',
  '/app/users':           'User Management',
}

// ─── Formatted date ───────────────────────────────────────
function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Notification badge ───────────────────────────────────
function NotificationButton({ count = 0 }) {
  return (
    <button
      type="button"
      className="relative w-10 h-10 rounded-xl flex items-center justify-center
        text-slate-500 hover:text-purple-700 hover:bg-purple-50
        border border-slate-200 hover:border-purple-200
        transition-all duration-200"
      aria-label={`Notifications${count ? ` (${count} new)` : ''}`}
    >
      <Bell className="w-4.5 h-4.5" strokeWidth={1.8} />
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
            bg-red-500 text-white text-[10px] font-bold rounded-full
            flex items-center justify-center leading-none
            ring-2 ring-white shadow-sm"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}

// ─── User dropdown ────────────────────────────────────────
function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  const userName = user?.name ?? user?.user_metadata?.name ?? 'User'

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleLogout = async () => {
    setOpen(false)
    await onLogout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl
          hover:bg-slate-50 border border-transparent hover:border-slate-200
          transition-all duration-200 group"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={userName} size="sm" />
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">{userName}</p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-100
            shadow-xl shadow-slate-200/80 z-50 overflow-hidden py-1.5
            animate-[headerDropIn_0.18s_ease-out]"
        >
          {/* User info row */}
          <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
            <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email ?? ''}</p>
          </div>

          <button
            role="menuitem"
            onClick={() => { setOpen(false); navigate('/app/settings') }}
            className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600
              hover:bg-slate-50 hover:text-slate-900 transition-colors duration-100"
          >
            <User className="w-4 h-4 text-slate-400" />
            View Profile
          </button>

          <button
            role="menuitem"
            onClick={() => { setOpen(false); navigate('/app/settings') }}
            className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600
              hover:bg-slate-50 hover:text-slate-900 transition-colors duration-100"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            Settings
          </button>

          <div className="h-px bg-slate-100 mx-3 my-1" />

          <button
            role="menuitem"
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-500
              hover:bg-red-50 hover:text-red-600 transition-colors duration-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Header Component ─────────────────────────────────────
export default function Header({ onMenuToggle }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { currentBranch } = useChurch()
  const [searchValue, setSearchValue] = useState('')

  // Resolve page title from exact match or prefix match
  const pageTitle =
    PAGE_TITLES[location.pathname] ??
    Object.entries(PAGE_TITLES).find(([path]) =>
      location.pathname.startsWith(path + '/')
    )?.[1] ??
    'ChurchFlow'

  // Demo: 3 notifications
  const notificationCount = 3

  return (
    <header
      className="fixed top-0 left-0 right-0 md:left-[260px] z-20 h-16
        bg-white border-b border-slate-200/80 shadow-sm shadow-slate-100/60"
    >
      <div className="flex items-center h-full px-4 md:px-6 gap-3">

        {/* ── Left: hamburger + title ─────────────────────── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Hamburger (mobile only) */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center
              text-slate-500 hover:text-slate-700 hover:bg-slate-100
              transition-colors duration-200"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title */}
          <div>
            <h1 className="text-lg font-bold text-[#1E1B4B] leading-tight tracking-tight">
              {pageTitle}
            </h1>
            {/* Date — visible on md+ */}
            <p className="hidden md:block text-xs text-slate-400 leading-none mt-0.5">
              {formatDate()}
            </p>
          </div>
        </div>

        {/* ── Center: Search (desktop only) ───────────────── */}
        <div className="hidden md:flex flex-1 max-w-sm mx-auto">
          <SearchBar
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search members, events..."
            className="w-full"
          />
        </div>

        {/* ── Right cluster ───────────────────────────────── */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">

          {/* Branch badge */}
          {currentBranch && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold
                select-none"
            >
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[100px]">{currentBranch.name}</span>
            </div>
          )}

          {/* Notifications */}
          <NotificationButton count={notificationCount} />

          {/* User dropdown */}
          <UserDropdown user={user} onLogout={logout} />
        </div>
      </div>

      <style>{`
        @keyframes headerDropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  )
}
