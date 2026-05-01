import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/cases/new',  label: 'New Draft'  },
  { to: '/cases',      label: 'My Cases'   },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy text-slate-900 dark:text-cream transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-border bg-white/90 dark:bg-navy/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="p-1.5 rounded bg-primary/10 dark:bg-secondary/10 border border-primary/20 dark:border-secondary/20 group-hover:bg-primary/20 dark:group-hover:bg-secondary/20 transition-colors">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" className="text-primary dark:text-secondary">
                <path d="M14 5L6 10v3h16v-3L14 5z" fill="currentColor"/>
                <rect x="7" y="14" width="2" height="7" fill="currentColor" opacity="0.7"/>
                <rect x="13" y="14" width="2" height="7" fill="currentColor" opacity="0.7"/>
                <rect x="19" y="14" width="2" height="7" fill="currentColor" opacity="0.7"/>
                <rect x="5" y="21" width="18" height="2" rx="1" fill="currentColor"/>
              </svg>
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight text-navy dark:text-cream">
              Legal<span className="text-primary dark:text-secondary">Draft</span>AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ to, label }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    active 
                      ? "text-primary dark:text-secondary bg-primary/10 dark:bg-secondary/10 border border-primary/20 dark:border-secondary/20" 
                      : "text-slate-500 dark:text-cream-dim hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-secondary/5 border border-transparent"
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-accent text-slate-500 dark:text-gold transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="text-right hidden sm:block border-l border-slate-200 dark:border-border pl-4 ml-2">
              <div className="text-sm font-medium text-slate-900 dark:text-cream">{user?.full_name || user?.username}</div>
              <div className="text-[10px] uppercase tracking-widest text-primary dark:text-secondary font-mono">{user?.role}</div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="px-3 py-1.5 rounded border border-slate-200 dark:border-border text-xs font-medium text-slate-500 dark:text-cream-dim hover:text-red-600 dark:hover:text-gold hover:border-red-600 dark:hover:border-gold transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-up">
        {children}
      </main>

      <footer className="border-t border-slate-200 dark:border-border py-6 text-center text-[10px] text-slate-400 dark:text-cream-dim/30 uppercase tracking-[0.2em]">
        LegalDraftAI — Academic Use Only — Not Legal Advice
      </footer>
    </div>
  )
}
