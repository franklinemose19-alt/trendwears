import { Link } from 'react-router-dom'
import { Smartphone } from 'lucide-react'

export default function InstalledAppNotice({ businessName, onContinue }: { businessName: string; onContinue: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <Smartphone size={28} className="text-stone" />
      <h1 className="mt-4 font-display text-2xl text-ink">Installed app not available</h1>
      <p className="mt-2 max-w-sm text-stone">
        The installable-store experience requires an active MIRA Signature subscription, and {businessName} is not on
        one right now. The store catalogue is still available.
      </p>
      <button
        onClick={onContinue}
        className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper"
      >
        Continue to the catalogue
      </button>
      <Link to="/admin" className="mt-4 text-sm text-stone underline hover:text-ink">
        Store owner? Manage your subscription
      </Link>
    </div>
  )
}
