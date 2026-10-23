import { formatDuration } from '@/utils/subscription'
import type { Business } from '@/types'

export type TrialState = 'eligible' | 'active' | 'expired' | 'none'

type TrialBusiness = Pick<Business, 'status' | 'subscription_status' | 'next_billing_date' | 'trial_started_at' | 'trial_ends_at'>

// Display only. The database decides who may start a trial and when it ends.
export function getTrialState(b: TrialBusiness, now: number = Date.now()): { state: TrialState; msLeft: number } {
  if (b.subscription_status === 'paid') return { state: 'none', msLeft: 0 }

  if (b.trial_ends_at) {
    const msLeft = new Date(b.trial_ends_at).getTime() - now
    return msLeft > 0 ? { state: 'active', msLeft } : { state: 'expired', msLeft }
  }

  if (!b.trial_started_at && !b.next_billing_date && b.status !== 'suspended') {
    return { state: 'eligible', msLeft: 0 }
  }
  return { state: 'none', msLeft: 0 }
}

// In-app reminders for the last days of the trial (there is no email or SMS system to send them through).
export function trialReminder(msLeft: number): string | null {
  if (msLeft <= 0) return null
  const day = 86400000
  if (msLeft <= day) {
    return 'Last day: your MIRA Preview trial ends in ' + formatDuration(msLeft) + '. Choose a plan to keep your store online.'
  }
  if (msLeft <= 3 * day) {
    return 'Your MIRA Preview trial ends in ' + Math.ceil(msLeft / day) + ' days. Choose a plan to keep your store online.'
  }
  return null
}
