import { formatDuration } from '@/utils/subscription'
import type { Business } from '@/types'

export type TrialState = 'eligible' | 'active' | 'expired' | 'none'
export type FoundingState = 'none' | 'active' | 'ended' | 'paid'

type TrialBusiness = Pick<Business, 'status' | 'subscription_status' | 'next_billing_date' | 'trial_started_at' | 'trial_ends_at'> & {
  founding_ambassador?: boolean
  founding_ends_at?: string | null
}

const DAY = 86400000

// Display only. The database decides who may start a trial and when it ends; `now` should be the SERVER time.
export function getTrialState(b: TrialBusiness, now: number = Date.now()): { state: TrialState; msLeft: number } {
  // Founding Partners have their own 3-month period: they are never on the promotional trial.
  if (b.founding_ambassador || b.subscription_status === 'founding' || b.subscription_status === 'founding_ended') {
    return { state: 'none', msLeft: 0 }
  }
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

// A Founding Partner's complimentary period: 3 months of MIRA Essential, after which they pay like every other store.
export function getFoundingState(b: TrialBusiness, now: number = Date.now()): { state: FoundingState; msLeft: number } {
  if (!b.founding_ambassador || !b.founding_ends_at) return { state: 'none', msLeft: 0 }
  const msLeft = new Date(b.founding_ends_at).getTime() - now
  if (b.subscription_status === 'paid') return { state: 'paid', msLeft }
  return msLeft > 0 ? { state: 'active', msLeft } : { state: 'ended', msLeft }
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

const UPGRADE = 'Upgrade to MIRA Essential or Signature to continue enjoying your branded online store.'

// In-app reminders on days 21, 26 and 28 of a 29-day trial (8, 3 and 1 day(s) remaining); day 29 is the "trial ended" screen.
// There is no email or SMS system to send them through. Calm wording: no threats, no false urgency.
export function trialReminder(msLeft: number, endsAt?: string | null): string | null {
  if (msLeft <= 0) return null
  if (msLeft <= DAY) {
    const at = endsAt ? new Date(endsAt).toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit' }) : formatDuration(msLeft)
    return 'Final reminder: your MIRA free trial ends today at ' + at + '. ' + UPGRADE
  }
  if (msLeft <= 3 * DAY) {
    return 'Your MIRA free trial is almost over! ' + UPGRADE
  }
  if (msLeft <= 8 * DAY) {
    return 'Trial reminder: your MIRA free trial ends in ' + daysRemaining(msLeft) + ' days. You can upgrade to MIRA Essential or Signature at any time to continue enjoying your branded online store.'
  }
  return null
}

// The same gentle reminder for a Founding Partner whose 3 months are nearly over.
export function foundingReminder(msLeft: number, endsAt?: string | null): string | null {
  if (msLeft <= 0 || msLeft > 8 * DAY) return null
  const choose = 'Choose a plan to continue enjoying your branded online store.'
  if (msLeft <= DAY) {
    const at = endsAt ? new Date(endsAt).toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit' }) : formatDuration(msLeft)
    return 'Your complimentary Founding Partner period ends today at ' + at + '. ' + choose
  }
  return 'Your complimentary Founding Partner period ends in ' + daysRemaining(msLeft) + ' days. ' + choose
}
