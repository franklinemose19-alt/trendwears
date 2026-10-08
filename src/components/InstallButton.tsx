import { Download } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

export default function InstallButton({ businessName }: { businessName: string }) {
  const { canInstall, promptInstall } = useInstallPrompt()

  if (!canInstall) return null

  return (
    <button
      onClick={promptInstall}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink hover:border-ink/30"
      title={'Install ' + businessName}
    >
      <Download size={14} />
      Install App
    </button>
  )
}
