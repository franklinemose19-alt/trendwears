import { useEffect, useState } from 'react'
import { Check, Lock, MessageCircle } from 'lucide-react'
import { fetchOverviewStats } from '@/services/admin'
import { fetchMyBusiness, fetchPlanFeatures } from '@/services/businesses'
import { fetchImageUsage } from '@/services/plans'
import { getSubscriptionState } from '@/utils/subscription'
import { supportWhatsAppUrl } from '@/config'
import { usePlans } from '@/hooks/usePlans'
import StatsCard from '@/components/StatsCard'
import ShareStoreCard from '@/components/ShareStoreCard'
import SubscriptionCountdown from '@/components/SubscriptionCountdown'
import PayInstructions from '@/components/PayInstructions'
import ImageUsageBar from '@/components/ImageUsageBar'
import type { Business, OverviewStats, PlanFeatures } from '@/types'

const featureLabels: [keyof PlanFeatures, string][] = [
  ['categories', 'Product categories'],
  ['search_filter', 'Search and filtering'],
  ['featured_products', 'Featured products'],
  ['inquiries', 'Customer inquiry features'],
  ['analytics', 'Store analytics'],
  ['custom_branding', 'Custom branding'],
  ['installable_store', 'Installable store (Add to Home Screen)'],
  ['cart', 'Cart'],
  ['favorites', 'Saved items'],
]

function statusText(business: Business): string {
  if (business.status === 'pending') return 'Pending activation'
  if (business.status === 'suspended') return 'Suspended'
  const state = getSubscriptionState(business).state
  if (state === 'none') return 'Not subscribed'
  if (state === 'expired') return 'Expired'
  return 'Active'
}

function subscriptionMessage(business: Business): string | null {
  if (business.status === 'pending') return 'Your store is waiting for activation by MIRA once your payment is confirmed.'
  if (business.status === 'suspended') return 'Your store has been suspended by MIRA. Contact MIRA support to get it back online.'
  if (getSubscriptionState(business).state !== 'active') {
    return 'Your subscription has expired, so your store is hidden from customers. Pay below and send the confirmation on WhatsApp, and it will go back online.'
  }
  return null
}

export default function AdminDashboard() {
  const { byId } = usePlans()
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [features, setFeatures] = useState<PlanFeatures | null>(null)
  const [usedImages, setUsedImages] = useState<number | null>(null)

  useEffect(() => {
    fetchMyBusiness().then((b) => {
      if (!b) return
      setBusiness(b)
      fetchOverviewStats(b.id).then(setStats)
      fetchPlanFeatures(b.plan).then(setFeatures)
      fetchImageUsage(b.id).then(setUsedImages).catch(() => setUsedImages(null))
    })
  }, [])

  const notice = business ? subscriptionMessage(business) : null
  const plan = business ? byId(business.plan) : null
  const popular = byId('popular')
  const pro = byId('pro')

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Dashboard</h1>
          <p className="mt-1 text-sm text-white/50">Overview of your store activity.</p>
        </div>
        {plan && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
            {plan.name} plan
          </span>
        )}
      </div>

      {business && plan && (
        <div className="mt-6 rounded-2xl border border-white/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm text-white/60">Your plan</p>
              <p className="mt-1 text-lg font-medium">
                {plan.name} - KSh {plan.monthly_price.toLocaleString()}/month
              </p>
              <p className="mt-1 text-xs text-white/50">Status: {statusText(business)}. Hosting and website maintenance are included.</p>
            </div>
            <SubscriptionCountdown nextBillingDate={business.next_billing_date} />
          </div>
          {notice && <p className="mt-3 text-sm text-red-400">{notice}</p>}

          <p className="mt-3 text-xs text-white/40">
            If your subscription ends, your store is hidden from customers until payment is confirmed. Your products and data are kept.
          </p>

          <PayInstructions planName={plan.name} amount={plan.monthly_price} />

          <a
            href={supportWhatsAppUrl('Hi MIRA, I need help with my store: ' + business.name)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white"
          >
            <MessageCircle size={13} />
            Need help? Chat with MIRA support
          </a>
        </div>
      )}

      {business && plan && usedImages !== null && (
        <div className="mt-6">
          <ImageUsageBar
            used={usedImages}
            limit={plan.max_images}
            planName={plan.name}
            upgrade={business.plan === 'basic' ? { name: popular.name, limit: popular.max_images } : null}
          />
        </div>
      )}

      {business && business.plan === 'basic' && (
        <div className="mt-6 rounded-2xl border border-white/20 bg-white/5 p-5">
          <p className="text-sm font-medium">Upgrade to {popular.name} - KSh {popular.monthly_price.toLocaleString()}/month</p>
          <p className="mt-1 text-xs text-white/60">
            {popular.max_images} active product images, installable store, product categories, search and filtering,
            featured products, customer inquiries, store analytics and custom branding.
          </p>
          <PayInstructions planName={popular.name} amount={popular.monthly_price} />
          <p className="mt-3 text-xs text-white/40">
            Your plan changes only after MIRA confirms your payment. Sending the message or tapping a button does not upgrade it.
          </p>
        </div>
      )}

      <p className="mt-6 text-xs text-white/40">
        {pro.name} (KSh {pro.monthly_price.toLocaleString()}/month) is coming soon and cannot be purchased yet.
      </p>

      {business && <ShareStoreCard business={business} />}

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatsCard label="Total products" value={stats?.totalProducts ?? '-'} />
        <StatsCard label="Available" value={stats?.availableProducts ?? '-'} />
        <StatsCard label="Sold" value={stats?.soldProducts ?? '-'} />
        <StatsCard label="Total views" value={stats?.totalViews ?? '-'} />
        <StatsCard label="Total likes" value={stats?.totalLikes ?? '-'} />
        <StatsCard label="WhatsApp enquiries" value={stats?.whatsappEnquiries ?? '-'} />
      </div>

      {features && business && (
        <div className="mt-8 rounded-2xl border border-white/10 p-5">
          <p className="mb-1 text-sm text-white/60">What your plan includes</p>
          {business.plan === 'basic' && (
            <p className="mb-4 text-xs text-white/40">
              Locked features need the Popular plan. Your catalogue, WhatsApp ordering and basic customization stay available.
            </p>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {featureLabels.map(([key, label]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                {features[key] ? (
                  <Check size={15} className="text-green-400" />
                ) : (
                  <Lock size={15} className="text-white/30" />
                )}
                <span className={features[key] ? 'text-white' : 'text-white/40'}>
                  {label}
                  {!features[key] && key !== 'cart' && key !== 'favorites' ? ' - requires ' + popular.name : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
