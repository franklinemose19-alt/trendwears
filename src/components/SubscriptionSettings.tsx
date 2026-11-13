import { useEffect, useState } from 'react'
import { Check, Lock } from 'lucide-react'
import { fetchImageUsage } from '@/services/plans'
import { useAdmin } from '@/hooks/useAdmin'
import { usePlans } from '@/hooks/usePlans'
import { useServerNow } from '@/hooks/useServerNow'
import { getSubscriptionState } from '@/utils/subscription'
import { getTrialState, getFoundingState } from '@/utils/trial'
import { PREVIEW_TRIAL_DAYS } from '@/config'
import TrialCard from '@/components/TrialCard'
import PaymentPanel from '@/components/PaymentPanel'
import PayInstructions from '@/components/PayInstructions'
import ImageUsageBar from '@/components/ImageUsageBar'
import SubscriptionCountdown from '@/components/SubscriptionCountdown'
import type { Business, PlanFeatures } from '@/types'

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

function statusText(business: Business, now: number): string {
  if (getFoundingState(business, now).state === 'active') return 'Founding Partner'
  const trial = getTrialState(business, now).state
  if (trial === 'active') return 'Free trial'
  if (trial === 'expired') return 'Trial ended'
  if (business.status === 'pending') return 'Pending activation'
  if (business.status === 'suspended') return 'Suspended'
  const state = getSubscriptionState(business, now).state
  if (state === 'none') return 'Not subscribed'
  if (state === 'expired') return 'Expired'
  return 'Active'
}

// Plan, trial, payments and what the plan includes: everything about the subscription in one place.
export default function SubscriptionSettings() {
  const { business, features, payments, reload, setBusiness } = useAdmin()
  const { byId } = usePlans()
  const now = useServerNow()
  const [usedImages, setUsedImages] = useState<number | null>(null)

  useEffect(() => {
    if (business) fetchImageUsage(business.id).then(setUsedImages).catch(() => setUsedImages(null))
  }, [business?.id])

  if (!business) return <p className="text-white/50">Loading...</p>

  const essential = byId('basic')
  const popular = byId('popular')
  const pro = byId('pro')
  const plan = byId(business.plan)
  const trial = getTrialState(business, now).state
  const founding = getFoundingState(business, now).state
  const onFreePeriod = trial === 'active' || trial === 'expired' || founding === 'active' || founding === 'ended'

  const planTitle = trial === 'active'
    ? 'MIRA Preview trial - KSh 0 for ' + PREVIEW_TRIAL_DAYS + ' days'
    : trial === 'expired'
      ? 'MIRA Preview trial ended'
      : plan.monthly_price != null
        ? plan.name + ' - KSh ' + plan.monthly_price.toLocaleString() + '/month'
        : plan.name

  return (
    <div className="space-y-8">
      <section aria-label="Your plan" className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-white/45">Your plan</p>
          <p className="mt-1 text-lg font-medium">{planTitle}</p>
          <p className="mt-1 text-xs text-white/50">Status: {statusText(business, now)}. Hosting and website maintenance are included.</p>
        </div>
        <SubscriptionCountdown nextBillingDate={business.next_billing_date} />
      </section>
      <p className="-mt-4 text-xs text-white/40">
        If your subscription ends, your store is hidden from customers until payment is confirmed. Your products and data are kept.
      </p>

      <TrialCard
        business={business}
        essential={essential}
        signature={popular}
        onStarted={(updated) => {
          setBusiness(updated)
          reload()
        }}
      />

      <PaymentPanel business={business} payments={payments} essential={essential} signature={popular} onChanged={reload} />

      {!onFreePeriod && plan.monthly_price != null && (
        <details className="rounded-xl border border-white/10 px-4 py-3">
          <summary className="cursor-pointer text-sm text-white/70">Pay manually and confirm on WhatsApp</summary>
          <PayInstructions planName={plan.name} amount={plan.monthly_price} />
        </details>
      )}

      {usedImages !== null && (
        <ImageUsageBar
          used={usedImages}
          limit={plan.max_images}
          planName={plan.name}
          upgrade={business.plan === 'basic' ? { name: popular.name, limit: popular.max_images } : null}
        />
      )}

      {business.plan === 'basic' && popular.monthly_price != null && (
        <section aria-label="Upgrade" className="rounded-xl border border-white/15 bg-white/5 p-5">
          <p className="text-sm font-medium">Upgrade to {popular.name} - KSh {popular.monthly_price.toLocaleString()}/month</p>
          <p className="mt-1 text-xs text-white/60">
            {popular.max_images} active product images, installable store, product categories, search and filtering,
            featured products, customer inquiries, store analytics and custom branding.
          </p>
          <p className="mt-3 text-xs text-white/40">
            Your plan changes only after MIRA confirms your payment. Sending a message or tapping a button does not upgrade it.
          </p>
        </section>
      )}

      {features && (
        <section aria-label="What your plan includes">
          <h2 className="text-xs font-medium uppercase tracking-wide text-white/40">What your plan includes</h2>
          {business.plan === 'basic' && (
            <p className="mt-1 text-xs text-white/40">
              Locked features need {popular.name}. Your catalogue, WhatsApp ordering and basic customization stay available.
            </p>
          )}
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {featureLabels.map(([key, label]) => (
              <li key={key} className="flex items-center gap-2 text-sm">
                {features[key] ? <Check size={15} aria-hidden="true" className="text-green-400" /> : <Lock size={15} aria-hidden="true" className="text-white/30" />}
                <span className={features[key] ? 'text-white' : 'text-white/40'}>
                  {label}
                  {!features[key] && key !== 'cart' && key !== 'favorites' ? ' - requires ' + popular.name : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-white/40">{pro.name} is coming soon and cannot be purchased yet.</p>
    </div>
  )
}
