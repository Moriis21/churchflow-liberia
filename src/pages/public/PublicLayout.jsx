// ============================================================
// ChurchFlow Liberia — PublicLayout (Shared wrapper)
// ============================================================
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Cross } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features',  to: '/features'  },
  { label: 'Pricing',   to: '/pricing'   },
  { label: 'About',     to: '/about'     },
  { label: 'Contact',   to: '/contact'   },
]

// ─── Public Navigation ───────────────────────────────────────
function PublicNav() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo + Brand */}
          <Link to="/landing" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#1E1B4B] flex items-center justify-center shadow">
              <Cross className="w-4 h-4 text-[#F59E0B]" strokeWidth={2.5} />
            </div>
            <span className="text-[#1E1B4B] font-bold text-lg tracking-tight leading-tight">
              ChurchFlow <span className="text-[#7C3AED]">Liberia</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.to
                    ? 'bg-purple-50 text-[#7C3AED]'
                    : 'text-slate-600 hover:text-[#7C3AED] hover:bg-purple-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-[#1E1B4B] hover:text-[#7C3AED] transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-2 space-y-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.to
                  ? 'bg-purple-50 text-[#7C3AED]'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block text-center px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#1E1B4B]"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="block text-center px-4 py-2.5 rounded-lg bg-[#7C3AED] text-white text-sm font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

// ─── Public Footer ───────────────────────────────────────────
function PublicFooter() {
  return (
    <footer className="bg-[#1E1B4B] text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand column */}
          <div className="md:col-span-1">
            <Link to="/landing" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
                <Cross className="w-4 h-4 text-[#F59E0B]" strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold text-base">ChurchFlow Liberia</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Modern church management software built for Liberian ministries.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Features',   to: '/features'   },
                { label: 'Pricing',    to: '/pricing'    },
                { label: 'Changelog',  to: '/changelog'  },
                { label: 'Roadmap',    to: '/roadmap'    },
                { label: 'Status',     to: '/status'     },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About',      to: '/about'     },
                { label: 'Blog',       to: '/blog'      },
                { label: 'Careers',    to: '/careers'   },
                { label: 'Press',      to: '/press'     },
                { label: 'Community',  to: '/community' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Help Centre',  to: '/help'    },
                { label: 'Docs',         to: '/docs'    },
                { label: 'Contact',      to: '/contact' },
                { label: 'Privacy',      to: '/privacy' },
                { label: 'Terms',        to: '/terms'   },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-100 pt-4 mt-4">
          <p>© 2026 ChurchFlow Liberia. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built by{' '}
            <a
              href="https://wa.me/231770787020"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-purple-600 hover:text-purple-800 transition-colors"
            >
              Morris L. Dorley Jr
            </a>
            {' '}·{' '}
            <a
              href="https://wa.me/231770787020"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-purple-600 transition-colors"
            >
              +231 77 078 7020
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── PublicLayout wrapper ────────────────────────────────────
export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
