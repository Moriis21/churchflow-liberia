// ============================================================
// ChurchFlow Liberia — Header
// Real notifications, working profile link, currency toggle
// ============================================================
import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Menu, Bell, ChevronDown, User, Settings, LogOut, MapPin, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import { insforge } from '../../lib/insforge'
import Avatar from '../ui/Avatar'
import SearchBar from '../ui/SearchBar'

// ─── Route → Page title map ───────────────────────────────
const PAGE_TITLES = {
  '/app/dashboard':           'Dashboard',
  '/app/super-admin':         'Platform Overview',
  '/app/super-admin-settings':'Platform Settings',
  '/app/profile':             'My Profile',
  '/app/members':             'Members',
  '/app/attendance':          'Attendance',
  '/app/departments':         'Departments',
  '/app/finance':             'Finance',
  '/app/events':              'Events',
  '/app/visitors':            'Visitors',
  '/app/prayer-requests':     'Prayer Requests',
  '/app/sermons':             'Sermons & Live',
  '/app/reports':             'Reports',
  '/app/branches':            'Branches',
  '/app/settings':            'Settings',
  '/app/users':               'User Management',
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

// ─── Notification Dropdown ────────────────────────────────
function NotificationDropdown({ userId }) {
  const [open, setOpen]         = useState(false)
  const [notifs, setNotifs]     = useState([])
  const [unread, setUnread]     = useState(0)
  const [loading, setLoading]   = useState(false)
  const ref = useRef(null)

  // Fetch on mount
  useEffect(() => {
    if (!userId) return
    async function load() {
      setLoading(true)
      const { data } = await insforge.database
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) {
        setNotifs(data)
        setUnread(data.filter(n => !n.is_read).length)
      }
      setLoading(false)
    }
    load()
  }, [userId])

  // Click-outside close
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  async function markAllRead() {
    if (!unread) return
    await insforge.database
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnread(0)
  }

  const typeColor = {
    info: 'bg-blue-500', success: 'bg-green-500', warning: 'bg-amber-500',
    alert: 'bg-red-500', birthday: 'bg-pink-500', event: 'bg-purple-500', prayer: 'bg-indigo-500',
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center
          text-slate-500 hover:text-purple-700 hover:bg-purple-50
          border border-slate-200 hover:border-purple-200 transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5" strokeWidth={1.8} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
            bg-red-500 text-white text-[10px] font-bold rounded-full
            flex items-center justify-center ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-100
          shadow-2xl shadow-slate-200/80 z-50 overflow-hidden
          animate-[headerDropIn_0.18s_ease-out]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-800">
              Notifications {unread > 0 && <span className="text-purple-600">({unread})</span>}
            </span>
            {unread > 0 && (
              <button onClick={markAllRead}
                className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">Loading…</div>
            ) : notifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : notifs.map(n => (
              <div key={n.id}
                className={`px-4 py-3 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-purple-50/40' : ''}`}>
                <div className="flex items-start gap-3">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? (typeColor[n.type] || 'bg-purple-500') : 'bg-slate-200'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-2 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-400">
              {notifs.length > 0 ? `${notifs.length} notification${notifs.length !== 1 ? 's' : ''}` : 'All caught up'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Currency Toggle ──────────────────────────────────────
function CurrencyToggle() {
  const { displayCurrency, setDisplayCurrency, church } = useChurch()
  const { isSuperAdmin } = useAuth()
  if (isSuperAdmin || !church) return null

  return (
    <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-0.5">
      {['LRD', 'USD'].map(cur => (
        <button
          key={cur}
          onClick={() => setDisplayCurrency(cur)}
          className={`text-xs font-bold px-2.5 py-1 rounded-md transition-all duration-150 ${
            displayCurrency === cur
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {cur}
        </button>
      ))}
    </div>
  )
}

// ─── User Dropdown ────────────────────────────────────────
function UserDropdown({ user, onLogout, isSuperAdmin }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  const userName = user?.profile?.full_name ?? user?.name ?? user?.user_metadata?.name ?? 'User'

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

  const settingsPath = isSuperAdmin ? '/app/super-admin-settings' : '/app/settings'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl
          hover:bg-slate-50 border border-transparent hover:border-slate-200
          transition-all duration-200"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={userName} size="sm" />
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">{userName}</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100
            shadow-xl shadow-slate-200/80 z-50 overflow-hidden py-1.5
            animate-[headerDropIn_0.18s_ease-out]"
        >
          {/* User info */}
          <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
            <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email ?? ''}</p>
            {isSuperAdmin && (
              <span className="inline-block mt-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Super Admin
              </span>
            )}
          </div>

          {/* View Profile — goes to /app/profile */}
          <button
            role="menuitem"
            onClick={() => { setOpen(false); navigate('/app/profile') }}
            className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600
              hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <User className="w-4 h-4 text-slate-400" />
            View Profile
          </button>

          {/* Settings */}
          <button
            role="menuitem"
            onClick={() => { setOpen(false); navigate(settingsPath) }}
            className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600
              hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            {isSuperAdmin ? 'Platform Settings' : 'Church Settings'}
          </button>

          <div className="h-px bg-slate-100 mx-3 my-1" />

          <button
            role="menuitem"
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-500
              hover:bg-red-50 hover:text-red-600 transition-colors"
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
  const { user, logout, isSuperAdmin } = useAuth()
  const { currentBranch } = useChurch()
  const [searchValue, setSearchValue] = useState('')

  const pageTitle =
    PAGE_TITLES[location.pathname] ??
    Object.entries(PAGE_TITLES).find(([path]) =>
      location.pathname.startsWith(path + '/')
    )?.[1] ??
    'ChurchFlow'

  return (
    <header className="fixed top-0 left-0 right-0 md:left-[260px] z-20 h-16
      bg-white border-b border-slate-200/80 shadow-sm shadow-slate-100/60">
      <div className="flex items-center h-full px-4 md:px-6 gap-3">

        {/* ── Left: hamburger + title ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center
              text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg font-bold text-[#1E1B4B] leading-tight tracking-tight">
              {pageTitle}
            </h1>
            <p className="hidden md:block text-xs text-slate-400 leading-none mt-0.5">
              {formatDate()}
            </p>
          </div>
        </div>

        {/* ── Center: Search ── */}
        <div className="hidden md:flex flex-1 max-w-sm mx-auto">
          <SearchBar
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Search members, events…"
            className="w-full"
          />
        </div>

        {/* ── Right cluster ── */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">

          {/* Branch badge */}
          {currentBranch && !isSuperAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full
              bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold select-none">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[100px]">{currentBranch.name}</span>
            </div>
          )}

          {/* Currency toggle (church users only) */}
          <CurrencyToggle />

          {/* Notifications (real data) */}
          <NotificationDropdown userId={user?.id} />

          {/* User dropdown */}
          <UserDropdown user={user} onLogout={logout} isSuperAdmin={isSuperAdmin} />
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
