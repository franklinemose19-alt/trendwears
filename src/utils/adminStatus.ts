import { getSubscriptionState } from '@/utils/subscription'
import { getTrialState, getFoundingState, trialReminder, foundingReminder } from '@/utils/trial'
import type { Business, PaymentRecord } from '@/types'

export interface Visibility {
  live: boolean
  label: string
  detail: string
}

// Is the store visible to customers right now? The database decides this for real; this only explains it to the merchant.
export function storeVisibility(b: Business, now: number = Date.now()): Visibility {
  if (b.status === 'suspended') return { live: false, label: 'Hidden', detail: 'Your store is suspended' }
  if (b.status === 'pending') return { live: false, label: 'Hidden', detail: 'Waiting for activation' }
  if (getSubscriptionState(b, now).state === 'active') return { live: true, label: 'Live', detail: 'Customers can see your store' }
  if (getFoundingState(b, now).state === 'ended') return { live: false, label: 'Hidden', detail: 'Your Founding Partner period has ended' }
  if (getTrialState(b, now).state === 'expired') return { live: false, label: 'Hidden', detail: 'Your free trial has ended' }
  return { live: false, label: 'Hidden', detail: 'No active subscription' }
}

export interface Notice {
  id: string
  tone: 'info' | 'warn' | 'alert'
  text: string
  to?: string
  cta?: string
}

const SUBSCRIPTION_TAB = '/admin/settings?tab=subscription'

// Important things for the merchant, built only from their real state. Nothing here is invented.
export function buildNotices(input: {
  business: Business
  payments: PaymentRecord[]
  now: number
  usedImages: number | null
  imageLimit: number
}): Notice[] {
  const { business: b, payments, now, usedImages, imageLimit } = input
  const out: Notice[] = []

  if (b.status === 'suspended') {
    out.push({ id: 'suspended', tone: 'alert', text: 'Your store has been suspended by MIRA. Contact MIRA support to get it back online.' })
  } else if (b.status === 'pending') {
    out.push({ id: 'pending', tone: 'warn', text: 'Your store is waiting for activation by MIRA once your payment is confirmed.' })
  } else {
    const vis = storeVisibility(b, now)
    if (!vis.live) {
      out.push({ id: 'hidden', tone: 'alert', text: vis.detail + ', so your store is hidden from customers. Your products and settings are saved.', to: SUBSCRIPTION_TAB, cta: 'Choose a plan' })
    }
  }

  const trial = getTrialState(b, now)
  if (trial.state === 'active') {
    const reminder = trialReminder(trial.msLeft, b.trial_ends_at)
    if (reminder) out.push({ id: 'trial', tone: 'warn', text: reminder, to: SUBSCRIPTION_TAB, cta: 'Upgrade' })
  }
  const founding = getFoundingState(b, now)
  if (founding.state === 'active') {
    const reminder = foundingReminder(founding.msLeft, b.founding_ends_at)
    if (reminder) out.push({ id: 'founding', tone: 'warn', text: reminder, to: SUBSCRIPTION_TAB, cta: 'Choose a plan' })
  }

  const pending = payments.filter((p) => p.status === 'pending')
  if (pending.length > 0) {
    out.push({ id: 'payment-pending', tone: 'info', text: 'A payment is waiting to be checked by MIRA. Your plan changes only after it is confirmed.', to: SUBSCRIPTION_TAB, cta: 'View' })
  } else if (payments[0]?.status === 'rejected') {
    out.push({ id: 'payment-rejected', tone: 'alert', text: 'Your last payment could not be confirmed.', to: SUBSCRIPTION_TAB, cta: 'See why' })
  }

  if (usedImages !== null && imageLimit > 0 && usedImages / imageLimit >= 0.9) {
    out.push({ id: 'images', tone: 'warn', text: 'You have used ' + usedImages + ' of ' + imageLimit + ' active product images.', to: SUBSCRIPTION_TAB, cta: 'See plans' })
  }

  const order = { alert: 0, warn: 1, info: 2 }
  return out.sort((a, c) => order[a.tone] - order[c.tone]).slice(0, 4)
}
