// ============================================================
// ChurchFlow Liberia — Mobile bottom navigation
// Shows on phones only (hidden md+). Quick access to the most-used
// areas, plus a Menu button that opens the full sidebar.
// ============================================================
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PlaySquare, BookOpen, User, Menu } from 'lucide-react'

const ITEMS = [
  { to: '/app/dashboard',      icon: LayoutDashboard, label: 'Home' },
  { to: '/app/sermons',        icon: PlaySquare,      label: 'Sermons' },
  { to: '/app/bible-learning', icon: BookOpen,        label: 'Bible' },
  { to: '/app/profile',        icon: User,            label: 'Profile' },
]

export default function MobileBottomNav({ onMenu }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 glass-nav border-t border-white/60 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around">
        {ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-[#5B00B8] dark:text-amber-300' : 'text-slate-500'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
        <button
          onClick={onMenu}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] font-semibold text-slate-500"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
          Menu
        </button>
      </div>
    </nav>
  )
}
