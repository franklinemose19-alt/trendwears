import { useEffect } from 'react'
import { useBusiness } from '@/contexts/BusinessContext'
import { activateManifest, storeManifestHref } from '@/utils/installPrompt'

// Always sets the browser tab title to the store name.
// Only stores whose plan includes "Installable Store" get a manifest (so only they can be added to a home screen).
export default function DynamicManifest({ installable }: { installable: boolean }) {
  const { business, slug } = useBusiness()
  const name = business?.name

  useEffect(() => {
    if (!name) return
    document.title = name
    return () => {
      document.title = 'MIRA'
    }
  }, [name])

  useEffect(() => {
    if (!installable) return

    const removeManifest = activateManifest(storeManifestHref(slug))

    // Every store uses the same MIRA "M" app icon.
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null
    if (!appleIcon) {
      appleIcon = document.createElement('link')
      appleIcon.rel = 'apple-touch-icon'
      document.head.appendChild(appleIcon)
    }
    appleIcon.href = '/icon-192.png'

    let themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
    if (!themeColor) {
      themeColor = document.createElement('meta')
      themeColor.name = 'theme-color'
      document.head.appendChild(themeColor)
    }
    themeColor.content = '#141414'

    return removeManifest
  }, [installable, slug])

  return null
}
