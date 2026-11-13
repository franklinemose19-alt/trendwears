import ShareStoreCard from '@/components/ShareStoreCard'
import ReferEarnBanner from '@/components/ReferEarnBanner'
import InstallableStoreCard from '@/components/InstallableStoreCard'
import { useAdmin } from '@/hooks/useAdmin'
import { usePlans } from '@/hooks/usePlans'

// The tools for getting more customers and more boutiques onto MIRA, in one place.
export default function AdminGrowth() {
  const { business, features, loading } = useAdmin()
  const { byId } = usePlans()

  if (loading) return <p className="text-white/50">Loading...</p>
  if (!business) return <p className="text-white/50">We could not load your store. Please refresh the page.</p>

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl md:text-3xl">Growth</h1>
        <p className="mt-2 text-sm text-white/55">Share your store, refer other boutiques and let customers add your store to their phone.</p>
      </div>

      <section aria-labelledby="growth-share">
        <h2 id="growth-share" className="text-xs font-medium uppercase tracking-wide text-white/40">Share your store</h2>
        <ShareStoreCard business={business} />
      </section>

      <section aria-labelledby="growth-refer">
        <h2 id="growth-refer" className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">Refer and earn</h2>
        <ReferEarnBanner variant="dashboard" />
      </section>

      {features && (
        <section aria-labelledby="growth-install">
          <h2 id="growth-install" className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">Install your store</h2>
          <InstallableStoreCard business={business} enabled={features.installable_store} popularName={byId('popular').name} />
        </section>
      )}
    </div>
  )
}
