import { formatDuration } from '@/utils/subscription'
import type { Business } from '@/types'

export type TrialState = 'eligible' | 'active' | 'expired' | 'none'

type TrialBusiness = Pick<Business, 'status' | 'subscription_status' | 'next_billing_date' | 'trial_started_at' | 'trial_ends_at'> & {
  founding_ambassador?: boolean
}

const DAY = 86400000

// Display only. The database decides who may start a trial and when it ends; `now` should be the SERVER time.
export function getTrialState(b: TrialBusiness, now: number = Date.now()): { state: TrialState; msLeft: number } {
  // Founding ambassadors are never on the promotional trial.
  if (b.founding_ambassador || b.subscription_status === 'founding') return { state: 'none', msLeft: 0 }
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

// The real length of THIS merchant's trial: 29 days for new trials, 7 for trials that began before the 29-day offer.
export function trialLengthDays(b: Pick<Business, 'trial_started_at' | 'trial_ends_at'>): number | null {
  if (!b.trial_started_at || !b.trial_ends_at) return null
  return Math.round((new Date(b.trial_ends_at).getTime() - new Date(b.trial_started_at).getTime()) / DAY)
}

export function daysRemaining(msLeft: number): number {
  return msLeft <= 0 ? 0 : Math.ceil(msLeft / DAY)
}

// "29 days remaining", "1 day remaining", "Trial expired"
export function trialCountdownLabel(msLeft: number): string {
  if (msLeft <= 0) return 'Trial expired'
  const d = daysRemaining(msLeft)
  return d + (d === 1 ? ' day remaining' : ' days remaining')
}

export function formatTrialDate(iso: string): string {
  return new Date(iso).toLocaleString('en-KE', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

// In-app reminders at 7, 3 and 1 day(s) remaining (there is no email or SMS system to send them through).
// Honest and calm: no countdown pressure, no threats.
export function trialReminder(msLeft: number, endsAt?: string | null): string | null {
  if (msLeft <= 0) return null
  const upgrade = 'Upgrade to MIRA Essential or Signature to continue enjoying your branded online store.'
  if (msLeft <= DAY) {
    const at = endsAt ? new Date(endsAt).toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit' }) : formatDuration(msLeft)
    return 'Last day of your MIRA free trial: it ends today at ' + at + '. ' + upgrade
  }
  if (msLeft <= 3 * DAY) {
    return 'Your MIRA free trial is almost over! ' + upgrade
  }
  if (msLeft <= 7 * DAY) {
    return 'Your MIRA free trial ends in ' + daysRemaining(msLeft) + ' days. ' + upgrade
  }
  return null
}
