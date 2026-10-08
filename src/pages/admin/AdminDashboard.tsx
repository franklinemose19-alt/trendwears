import { useEffect, useState } from 'react'
import { Check, Lock } from 'lucide-react'
import { fetchOverviewStats } from '@/services/admin'
import { fetchMyBusiness, fetchPlanFeatures } from '@/services/businesses'
import { getSubscriptionState } from '@/utils/subscription'
import StatsCard from '@/components/StatsCard'
import ShareStoreCard from '@/components/ShareStoreCard'
import SubscriptionCountdown from '@/components/SubscriptionCountdown'
import type { Business, OverviewStats, PlanFeatures } from '@/types'

const featureLabels: [keyof PlanFeatures, string][] = [
  ['cart', 'Cart'],
  ['favorites', 'Favourites'],
  ['customer_accounts', 'Customer accounts'],
  ['notifications', 'Push notifications'],
  ['promotions', 'Promotions & discounts'],
  ['analytics', 'Analytics'],
  ['advanced_customization', 'Advanced customization'],
]

function subscriptionMessage(business: Business): string | null {
  if (business.status === 'pending') return 'Your store is waiting for activation by MIRA.'
  if (business.status === 'suspended') return 'Your store has been suspended by MIRA. Contact MIRA to get it back online.'
  if (getSubscriptionState(business).state !== 'active') {
    return 'Your subscription has expired, so your store is hidden from customers. Contact MIRA to renew and it will go back online.'
  }
  return null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [features, setFeatures] = useState<PlanFeatures | null>(null)

  useEffect(() => {
    fetchMyBusiness().then((b) => {
      if (!b) return
      setBusiness(b)
      fetchOverviewStats(b.id).then(setStats)
      fetchPlanFeatures(b.plan).then(setFeatures)
    })
  }, [])

  const notice = business ? subscriptionMessage(business) : null

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Dashboard</h1>
          <p className="mt-1 text-sm text-white/50">Overview of your store activity.</p>
        </div>
        {business && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-white/70">
            {business.plan} plan
          </span>
        )}
      </div>

      {business && (
        <div className="mt-6 rounded-2xl border border-white/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-white/60">Subscription</p>
            <SubscriptionCountdown nextBillingDate={business.next_billing_date} />
          </div>
          {notice && <p className="mt-3 text-sm text-red-400">{notice}</p>}
        </div>
      )}

      {business && <ShareStoreCard business={business} />}

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatsCard label="Total products" value={stats?.totalProducts ?? '-'} />
        <StatsCard label="Available" value={stats?.availableProducts ?? '-'} />
        <StatsCard label="Sold" value={stats?.soldProducts ?? '-'} />
        <StatsCard label="Total views" value={stats?.totalViews ?? '-'} />
        <StatsCard label="Total likes" value={stats?.totalLikes ?? '-'} />
        <StatsCard label="WhatsApp enquiries" value={stats?.whatsappEnquiries ?? '-'} />
      </div>

      {features && (
        <div className="mt-8 rounded-2xl border border-white/10 p-5">
          <p className="mb-4 text-sm text-white/60">Your plan features</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {featureLabels.map(([key, label]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                {features[key] ? (
                  <Check size={15} className="text-green-400" />
                ) : (
                  <Lock size={15} className="text-white/30" />
                )}
                <span className={features[key] ? 'text-white' : 'text-white/40'}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
