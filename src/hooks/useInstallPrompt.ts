import { useSyncExternalStore } from 'react'
import { subscribeInstall, canPromptInstall, isInstalled, promptInstall, isStandalone, isIos } from '@/utils/installPrompt'

export function useInstallPrompt(manifestHref: string) {
  const canInstall = useSyncExternalStore(
    subscribeInstall,
    () => canPromptInstall(manifestHref),
    () => false
  )
  const installed = useSyncExternalStore(subscribeInstall, isInstalled, () => false)

  return {
    canInstall,
    installed,
    promptInstall: () => promptInstall(manifestHref),
    standalone: isStandalone(),
    ios: isIos(),
  }
}
