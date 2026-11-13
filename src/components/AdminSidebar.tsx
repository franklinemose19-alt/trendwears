import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, BarChart3, Megaphone, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { Business } from '@/types'

const links = [
  { to: '/admin', label: 'Overview', short: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'My Products', short: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', short: 'Orders', icon: ShoppingBag, end: false },
  { to: '/admin/analytics', label: 'Store Insights', short: 'Insights', icon: BarChart3, end: false },
  { to: '/admin/growth', label: 'Growth', short: 'Growth', icon: Megaphone, end: false },
  { to: '/admin/settings', label: 'Settings', short: 'Settings', icon: Settings, end: false },
]

// Slim sidebar for tablets and desktops.
export default function AdminSidebar({ business }: { business: Business | null }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const name = business?.name ?? 'My store'

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-white/10 px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        {business?.logo_url ? (
          <img src={business.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
        ) : (
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 font-display text-sm">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="truncate font-display text-base">{name}</span>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-0.5">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ' +
              (isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white')
            }
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white"
      >
        <LogOut size={16} aria-hidden="true" />
        Log out
      </button>
    </aside>
  )
}

// Bottom navigation for phones: six comfortable touch targets, no sideways scrolling.
export function AdminBottomNav() {
  return (
    <nav
      aria-label="Main (mobile)"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-white/10 bg-[#0f0f10]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {links.map(({ to, short, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            'flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[10px] ' +
            (isActive ? 'text-white' : 'text-white/50')
          }
        >
          <Icon size={19} aria-hidden="true" />
          {short}
        </NavLink>
      ))}
    </nav>
  )
}
