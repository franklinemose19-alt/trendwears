import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#0f0f10] text-[#e8e8e6] md:flex-row">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-white/10 p-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-white/70 hover:text-white">
            <Menu size={22} />
          </button>
          <span className="font-display text-base">TRENDTHRIFT WEARS</span>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
