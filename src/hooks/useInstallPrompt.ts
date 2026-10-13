import { useSyncExternalStore } from 'react'
import { subscribeInstall, canPromptInstall, promptInstall, isStandalone, isIos } from '@/utils/installPrompt'

export function useInstallPrompt(manifestHref: string) {
  const canInstall = useSyncExternalStore(
    subscribeInstall,
    () => canPromptInstall(manifestHref),
    () => false
  )

  return {
    canInstall,
    promptInstall: () => promptInstall(manifestHref),
    standalone: isStandalone(),
    ios: isIos(),
  }
}
