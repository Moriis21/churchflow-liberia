// ============================================================
// ChurchFlow Liberia — App Layout Wrapper
// ============================================================
import React, { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'

// ─── Loading spinner ──────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#151022] z-[9999]">
      {/* Animated logo */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-900/40">
          <svg
            className="w-9 h-9 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {/* Church icon */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v4m0 0L9 9m3-2l3 2M5 21h14M5 21V10.5M19 21V10.5M5 10.5A2.5 2.5 0 017.5 8H9M19 10.5A2.5 2.5 0 0016.5 8H15M9 8V6a3 3 0 016 0v2M9 8h6"
            />
          </svg>
        </div>
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-2xl ring-4 ring-amber-400/30 animate-ping" />
      </div>

      <h1 className="text-xl font-extrabold text-white tracking-tight mb-1">ChurchFlow</h1>
      <p className="text-sm text-purple-300/70 tracking-widest uppercase mb-8">Liberia</p>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-purple-400/50 animate-bounce"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Layout Component ─────────────────────────────────────
export default function Layout() {
  const { user, loading, isSuperAdmin } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  // ── Show loading screen while auth resolves ───────────
  if (loading) {
    return <LoadingScreen />
  }

  // ── Redirect unauthenticated users to login ───────────
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  // ── Super admin: keep on /app/super-admin, redirect away from
  //    regular church pages (dashboard, members, etc.) ──────────
  const SUPER_ADMIN_ROUTES = [
    '/app/super-admin', '/app/users', '/app/settings',
    '/app/reports', '/app/sermons', '/app/finance',
    '/app/members', '/app/branches', '/app/profile',
  ]
  if (isSuperAdmin && !SUPER_ADMIN_ROUTES.some(r => location.pathname.startsWith(r))) {
    return <Navigate to="/app/super-admin" replace />
  }

  // ── Church user with no church: redirect to setup ─────────────
  // Only redirect if we have confirmed the profile loaded (role is set)
  // and there is genuinely no church_id. Avoid redirecting during
  // the brief window when auth is hydrating.
  const churchId  = user?.churchId || user?.profile?.church_id
  const userRole  = user?.role || user?.profile?.role
  const profileLoaded = !!userRole  // profile has been resolved if role exists
  const isChurchRoute = !isSuperAdmin && location.pathname !== '/complete-setup'
  if (isChurchRoute && profileLoaded && !churchId && userRole !== 'super_admin') {
    return <Navigate to="/complete-setup" replace />
  }

  // ── Authenticated layout ──────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F7FF]">
      {/* Sidebar — fixed left column */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area — offset by sidebar width on md+ */}
      <div className="md:ml-[260px] flex flex-col min-h-screen">
        {/* Sticky top header */}
        <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />

        {/* Page content — padded below header */}
        <main
          className="flex-1 pt-16"
          id="main-content"
          tabIndex={-1}
        >
          <div className="p-4 md:p-6 max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer strip */}
        <footer className="px-6 py-3 border-t border-slate-200/60 bg-white/50">
          <p className="text-xs text-slate-400 text-center">
            &copy; {new Date().getFullYear()} ChurchFlow Liberia &mdash; Built for the body of Christ
          </p>
        </footer>
      </div>
    </div>
  )
}
