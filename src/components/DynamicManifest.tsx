import { useEffect } from 'react'
import { useBusiness } from '@/contexts/BusinessContext'

export default function DynamicManifest() {
  const { business, slug } = useBusiness()

  useEffect(() => {
    if (!business) return

    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null
    if (!manifestLink) {
      manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      document.head.appendChild(manifestLink)
    }
    manifestLink.href = '/api/platform?action=manifest&slug=' + slug

    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null
    if (!appleIcon) {
      appleIcon = document.createElement('link')
      appleIcon.rel = 'apple-touch-icon'
      document.head.appendChild(appleIcon)
    }
    if (business.logo_url) {
      appleIcon.href = business.logo_url
    }

    let themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
    if (!themeColor) {
      themeColor = document.createElement('meta')
      themeColor.name = 'theme-color'
      document.head.appendChild(themeColor)
    }
    themeColor.content = '#141414'

    document.title = business.name
  }, [business, slug])

  return null
}
