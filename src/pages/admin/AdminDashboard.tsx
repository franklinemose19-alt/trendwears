import { useEffect, useState } from 'react'
import { Check, Lock } from 'lucide-react'
import { fetchOverviewStats } from '@/services/admin'
import { fetchMyBusiness, fetchPlanFeatures } from '@/services/businesses'
import StatsCard from '@/components/StatsCard'
import type { OverviewStats, Plan, PlanFeatures } from '@/types'

const featureLabels: [keyof PlanFeatures, string][] = [
  ['cart', 'Cart'],
  ['favorites', 'Favourites'],
  ['customer_accounts', 'Customer accounts'],
  ['notifications', 'Push notifications'],
  ['promotions', 'Promotions & discounts'],
  ['analytics', 'Analytics'],
  ['advanced_customization', 'Advanced customization'],
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [features, setFeatures] = useState<PlanFeatures | null>(null)

  useEffect(() => {
    fetchMyBusiness().then((business) => {
      if (!business) return
      setPlan(business.plan)
      fetchOverviewStats(business.id).then(setStats)
      fetchPlanFeatures(business.plan).then(setFeatures)
    })
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Dashboard</h1>
          <p className="mt-1 text-sm text-white/50">Overview of your store activity.</p>
        </div>
        {plan && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-white/70">
            {plan} plan
          </span>
        )}
      </div>

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
