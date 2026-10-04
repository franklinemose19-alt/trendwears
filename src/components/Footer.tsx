import { Link } from 'react-router-dom'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useBusiness } from '@/contexts/BusinessContext'

export default function Footer() {
  const { isAdmin } = useIsAdmin()
  const { business, slug } = useBusiness()

  return (
    <footer className="border-t border-ink/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 text-center">
        <span className="font-display text-lg text-ink">{business?.name ?? 'MIRA'}</span>
        <p className="max-w-sm text-sm text-stone">
          {business?.description || (business?.location ? 'Find us at ' + business.location + '.' : '')}
        </p>
        <div className="mt-2 flex gap-6 text-sm text-stone">
          <Link to={'/store/' + slug + '/shop'} className="hover:text-ink">Shop</Link>
          <Link to={'/store/' + slug + '/saved'} className="hover:text-ink">Saved</Link>
          <Link to={'/store/' + slug + '/about'} className="hover:text-ink">About</Link>
          <Link to={'/store/' + slug + '/contact'} className="hover:text-ink">Contact</Link>
        </div>
        {isAdmin && (
          <Link to="/admin" className="mt-4 text-xs text-stone/50 hover:text-stone">
            Admin
          </Link>
        )}
        <p className="mt-6 border-t border-ink/5 pt-4 text-xs text-stone/60">
          Powered by MIRA · Built by FRANK DAVINCI TECHNOLOGIES
        </p>
      </div>
    </footer>
  )
}
