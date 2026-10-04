import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useBusiness } from '@/contexts/BusinessContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { business, slug } = useBusiness()

  const links = [
    { to: '/store/' + slug, label: 'Home', end: true },
    { to: '/store/' + slug + '/shop', label: 'Shop', end: false },
    { to: '/store/' + slug + '/saved', label: 'Saved', end: false },
    { to: '/store/' + slug + '/about', label: 'About', end: false },
    { to: '/store/' + slug + '/contact', label: 'Contact', end: false },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to={'/store/' + slug} className="font-display text-xl tracking-tight text-ink" onClick={() => setOpen(false)}>
          {business?.name ?? 'MIRA'}
        </Link>

        <nav className="hidden gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                'text-sm transition-colors ' + (isActive ? 'text-ink' : 'text-stone hover:text-ink')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-ink/10 px-5 py-3 md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                'rounded-md px-2 py-2 text-sm ' + (isActive ? 'bg-ink/5 text-ink' : 'text-stone')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
