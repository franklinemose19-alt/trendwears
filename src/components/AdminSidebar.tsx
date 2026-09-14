import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, BarChart3, Settings, LogOut, ArrowLeftCircle, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function AdminSidebar({ open, onClose }: Props) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/admin/login')
  }

  function handleNavClick() {
    onClose()
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0f0f10] p-5 transition-transform duration-200 md:static md:z-auto md:w-56 md:translate-x-0 ' +
          (open ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display text-lg">TRENDTHRIFT WEARS</span>
          <button onClick={onClose} className="text-white/60 hover:text-white md:hidden">
            <X size={20} />
          </button>
        </div>

        <button
          onClick={() => { navigate('/shop'); onClose() }}
          className="mb-6 flex items-center gap-3 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
        >
          <ArrowLeftCircle size={17} />
          Exit to Store
        </button>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={handleNavClick}
              className={({ isActive }) =>
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ' +
                (isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white')
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} />
          Logout
        </button>
      </aside>
    </>
  )
}
