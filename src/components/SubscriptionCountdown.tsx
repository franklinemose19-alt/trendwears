import { useEffect, useState } from 'react'
import { getSubscriptionState, formatDuration } from '@/utils/subscription'

export default function SubscriptionCountdown({ nextBillingDate }: { nextBillingDate: string | null }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])

  const { state, msLeft } = getSubscriptionState({ next_billing_date: nextBillingDate }, now)

  if (state === 'none') {
    return <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">Not subscribed</span>
  }

  if (state === 'expired') {
    return (
      <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-400">
        Expired {formatDuration(msLeft)} ago
      </span>
    )
  }

  const days = msLeft / 86400000
  if (days > 3650) {
    return <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">No expiry</span>
  }

  const tone = days <= 7 ? 'bg-yellow-500/15 text-yellow-400' : 'bg-green-500/15 text-green-400'
  const endDate = new Date(nextBillingDate as string).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <span className={'rounded-full px-3 py-1 text-xs ' + tone} title={'Ends ' + endDate}>
      {formatDuration(msLeft)} left - ends {endDate}
    </span>
  )
}
