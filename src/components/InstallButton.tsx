import { useState } from 'react'
import { Download } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

interface Props {
  manifestHref: string
  label: string
  variant?: 'light' | 'dark'
}

export default function InstallButton({ manifestHref, label, variant = 'light' }: Props) {
  const { canInstall, promptInstall, standalone, ios } = useInstallPrompt(manifestHref)
  const [showHelp, setShowHelp] = useState(false)

  if (standalone) return null
  if (!canInstall && !ios) return null

  const tone =
    variant === 'dark'
      ? 'border-white/20 text-white/80 hover:border-white/40 hover:text-white'
      : 'border-ink/15 text-ink hover:border-ink/30'
  const popover = variant === 'dark' ? 'bg-white text-black' : 'bg-ink text-paper'

  return (
    <span className="relative inline-block">
      <button
        onClick={canInstall ? promptInstall : () => setShowHelp((v) => !v)}
        className={'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ' + tone}
      >
        <Download size={14} />
        {label}
      </button>
      {!canInstall && showHelp && (
        <span className={'absolute right-0 top-full z-50 mt-2 w-56 rounded-lg px-3 py-2 text-left text-xs shadow-lg ' + popover}>
          On iPhone: tap the Share icon in Safari, then choose Add to Home Screen.
        </span>
      )}
    </span>
  )
}
