import { Link } from 'react-router-dom'
import { useServerNow } from '@/hooks/useServerNow'
import { usePlans } from '@/hooks/usePlans'
import { getSubscriptionState } from '@/utils/subscription'
import { getTrialState, getFoundingState, trialCountdownLabel, formatTrialDate, trialLengthDays } from '@/utils/trial'
import TrialCard from '@/components/TrialCard'
import type { Business } from '@/types'

const MANAGE = '/admin/settings?tab=subscription'

// One calm line about the subscription. The full detail (plans, payments) lives in Settings, under Subscription.
export default function SubscriptionSummary({ business, onStarted }: { business: Business; onStarted: (b: Business) => void }) {
  const now = useServerNow()
  const { byId } = usePlans()
  const trial = getTrialState(business, now)
  const founding = getFoundingState(business, now)
  const sub = getSubscriptionState(business, now)

  // A store that has never started its free trial gets the start card right here.
  if (trial.state === 'eligible') {
    return <TrialCard business={business} essential={byId('basic')} signature={byId('popular')} onStarted={onStarted} />
  }

  const plan = byId(business.plan)
  let title = ''
  let detail = ''
  let action = 'Manage subscription'

  if (founding.state === 'active' && business.founding_ends_at) {
    title = 'MIRA Founding Partner'
    detail = trialCountdownLabel(founding.msLeft) + ' - complimentary MIRA Essential ends ' + formatTrialDate(business.founding_ends_at)
  } else if (founding.state === 'ended') {
    title = 'Founding Partner period ended'
    detail = 'Choose a plan to bring your store back online.'
    action = 'Choose a plan'
  } else if (trial.state === 'active' && business.trial_ends_at) {
    title = 'MIRA Preview - free trial'
    detail = trialCountdownLabel(trial.msLeft) + ' - ends ' + formatTrialDate(business.trial_ends_at)
    action = 'Upgrade'
  } else if (trial.state === 'expired') {
    const length = trialLengthDays(business)
    title = length ? 'Your ' + length + '-day free trial has ended' : 'Your free trial has ended'
    detail = 'Choose a plan to bring your store back online. Your products are saved.'
    action = 'Choose a plan'
  } else if (sub.state === 'active') {
    title = plan.name + (plan.monthly_price != null ? ' - KSh ' + plan.monthly_price.toLocaleString() + '/month' : '')
    detail = 'Active until ' + formatTrialDate(business.next_billing_date as string)
  } else {
    title = 'No active subscription'
    detail = 'Choose a plan to bring your store online.'
    action = 'Choose a plan'
  }

  return (
    <section aria-label="Subscription" className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-white/50">{detail}</p>
      </div>
      <Link to={MANAGE} className="inline-flex min-h-[36px] items-center rounded-full border border-white/20 px-4 text-xs text-white/80 hover:border-white/50 hover:text-white">
        {action}
      </Link>
    </section>
  )
}
