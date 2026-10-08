import type { Business } from '@/types'

export function addOneMonth(from: Date): Date {
  const d = new Date(from)
  const day = d.getDate()
  d.setMonth(d.getMonth() + 1)
  if (d.getDate() < day) d.setDate(0)
  return d
}

export type SubscriptionState = 'none' | 'active' | 'expired'

export function getSubscriptionState(
  business: Pick<Business, 'next_billing_date'>,
  now: number = Date.now()
): { state: SubscriptionState; msLeft: number } {
  if (!business.next_billing_date) return { state: 'none', msLeft: 0 }
  const msLeft = new Date(business.next_billing_date).getTime() - now
  return msLeft > 0 ? { state: 'active', msLeft } : { state: 'expired', msLeft }
}

export function formatDuration(ms: number): string {
  const abs = Math.abs(ms)
  const days = Math.floor(abs / 86400000)
  const hours = Math.floor((abs % 86400000) / 3600000)
  const minutes = Math.floor((abs % 3600000) / 60000)
  if (days > 0) return days + 'd ' + hours + 'h'
  if (hours > 0) return hours + 'h ' + minutes + 'm'
  return minutes + 'm'
}
