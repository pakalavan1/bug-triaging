import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-indigo-500/20 text-indigo-200'
      : 'text-slate-300 hover:text-white hover:bg-white/10'
  }`

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-700/80 bg-slate-900/95 backdrop-blur shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 group">
            <span className="text-2xl" aria-hidden>
              🎯
            </span>
            <div>
              <p className="font-bold text-white tracking-tight leading-tight">Bug Triaging</p>
              <p className="text-[10px] uppercase tracking-widest text-indigo-300/90">Automated routing</p>
            </div>
          </NavLink>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Main">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/submit" className={linkClass}>
              Submit Bug
            </NavLink>
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        Automated Software Bug Triaging System · Demo project
      </footer>
    </div>
  )
}
