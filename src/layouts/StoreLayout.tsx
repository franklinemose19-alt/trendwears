import { useEffect, useState, type CSSProperties } from 'react'
import { Outlet } from 'react-router-dom'
import { BusinessProvider, useBusiness } from '@/contexts/BusinessContext'
import { getSubscriptionState } from '@/utils/subscription'
import { isStandalone } from '@/utils/installPrompt'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DynamicManifest from '@/components/DynamicManifest'
import InstalledAppNotice from '@/components/InstalledAppNotice'

function hexToChannels(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  return ((n >> 16) & 255) + ' ' + ((n >> 8) & 255) + ' ' + (n & 255)
}

function StoreGate() {
  const { business, loading, features, featuresLoading, slug } = useBusiness()
  const ackKey = 'mira_installed_ack_' + slug
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    try {
      setAcknowledged(sessionStorage.getItem(ackKey) === '1')
    } catch {
      setAcknowledged(false)
    }
  }, [ackKey])

  function acknowledge() {
    try {
      sessionStorage.setItem(ackKey, '1')
    } catch {
      // private mode: the notice simply shows again next time
    }
    setAcknowledged(true)
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-stone">Loading...</div>
  }

  if (!business) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display text-2xl text-ink">Store not found</h1>
        <p className="mt-2 text-stone">This storefront doesn't exist or the link may be incorrect.</p>
      </div>
    )
  }

  if (business.status === 'suspended') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display text-2xl text-ink">Store temporarily unavailable</h1>
        <p className="mt-2 max-w-sm text-stone">{business.name} isn't accepting orders right now. Please check back soon.</p>
      </div>
    )
  }

  if (business.status === 'pending') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display text-2xl text-ink">Coming soon</h1>
        <p className="mt-2 max-w-sm text-stone">{business.name} is still setting up their storefront.</p>
      </div>
    )
  }

  if (getSubscriptionState(business).state !== 'active') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display text-2xl text-ink">Store temporarily unavailable</h1>
        <p className="mt-2 max-w-sm text-stone">{business.name} isn't accepting orders right now. Please check back soon.</p>
      </div>
    )
  }

  // An app installed to the home screen re-checks the CURRENT plan on every launch.
  // The plan is read fresh from the database each time; nothing about it is stored on the phone.
  if (isStandalone()) {
    if (featuresLoading) {
      return <div className="flex min-h-screen items-center justify-center text-stone">Loading...</div>
    }
    if (!features.installable_store && !acknowledged) {
      return <InstalledAppNotice businessName={business.name} onContinue={acknowledge} />
    }
  }

  const brandOk = features.custom_branding && !!business.brand_color && /^#[0-9a-fA-F]{6}$/.test(business.brand_color)
  const style = brandOk ? ({ '--brand': hexToChannels(business.brand_color as string) } as CSSProperties) : undefined

  return (
    <div style={style} className="flex min-h-screen w-full flex-col overflow-x-hidden">
      <DynamicManifest installable={features.installable_store} />
      <Navbar />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default function StoreLayout() {
  return (
    <BusinessProvider>
      <StoreGate />
    </BusinessProvider>
  )
}
