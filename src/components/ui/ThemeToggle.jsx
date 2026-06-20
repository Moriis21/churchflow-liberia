// ============================================================
// ChurchFlow Liberia — Dark / Light theme toggle
// Persists to localStorage and toggles `.dark` on <html>.
// ============================================================
import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

export function useTheme() {
  const [dark, setDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )
  useEffect(() => {
    const root = document.documentElement
    if (dark) { root.classList.add('dark'); localStorage.setItem('cf_theme', 'dark') }
    else      { root.classList.remove('dark'); localStorage.setItem('cf_theme', 'light') }
  }, [dark])
  return [dark, () => setDark((d) => !d)]
}

export default function ThemeToggle({ className = '' }) {
  const [dark, toggle] = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border border-white/60 bg-white/60 text-slate-600 hover:bg-white transition-colors dark:bg-white/10 dark:text-amber-300 dark:border-white/10 dark:hover:bg-white/20 ${className}`}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
