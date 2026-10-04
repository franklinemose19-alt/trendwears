import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, Building2, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function MiraAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/mira-admin/login')
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-[#e8e8e6] md:flex-row">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0a0a0b] p-5 transition-transform duration-200 md:static md:z-auto md:w-56 md:translate-x-0 ' +
          (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display text-lg">MIRA Admin</span>
          <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white md:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <NavLink
            to="/mira-admin"
            end
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ' +
              (isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white')
            }
          >
            <Building2 size={17} />
            Businesses
          </NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} />
          Logout
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-white/10 p-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-white/70 hover:text-white">
            <Menu size={22} />
          </button>
          <span className="font-display text-base">MIRA Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
