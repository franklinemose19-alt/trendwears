import { useSearchParams } from 'react-router-dom'
import { Smartphone, X } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

interface Props {
  businessName: string
  manifestHref: string
  enabled: boolean
}

// Shown only when a store page is opened with ?install=1 (for example from the owner's dashboard).
export default function InstallNudge({ businessName, manifestHref, enabled }: Props) {
  const [params, setParams] = useSearchParams()
  const { canInstall, promptInstall, standalone, ios } = useInstallPrompt(manifestHref)

  if (!enabled || standalone || params.get('install') !== '1') return null

  function dismiss() {
    const next = new URLSearchParams(params)
    next.delete('install')
    setParams(next, { replace: true })
  }

  async function handleInstall() {
    const outcome = await promptInstall()
    if (outcome === 'accepted') dismiss()
  }

  const hint = canInstall
    ? 'Tap Install to add it to your home screen like an app.'
    : ios
      ? 'Tap the Share icon in Safari, then choose Add to Home Screen.'
      : 'Open your browser menu and choose Install app or Add to Home screen.'

  return (
    <div role="region" aria-label="Install this store" className="border-b border-ink/10 bg-ink px-4 py-3 text-paper">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <Smartphone size={18} className="shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-medium">Add {businessName} to your home screen</p>
          <p className="text-xs text-paper/70">{hint}</p>
        </div>
        {canInstall && (
          <button onClick={handleInstall} className="rounded-full bg-paper px-4 py-1.5 text-xs font-medium text-ink">
            Install
          </button>
        )}
        <button onClick={dismiss} aria-label="Dismiss" className="text-paper/60 hover:text-paper">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
