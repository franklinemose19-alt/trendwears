import { Outlet } from 'react-router-dom'
import { BusinessProvider, useBusiness } from '@/contexts/BusinessContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function StoreGate() {
  const { business, loading } = useBusiness()

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

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
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
