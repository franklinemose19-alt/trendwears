import type { PlanInfo } from '@/types'

export const MIRA_SUPPORT_WHATSAPP = '254111947810'
export const MIRA_TILL_NUMBER = '1725838'

// Fallback only. The live values (price, image allowance, availability) come from the `plans` table.
export const DEFAULT_PLANS: PlanInfo[] = [
  { id: 'basic', name: 'Basic', monthly_price: 999, max_images: 100, purchasable: true },
  { id: 'popular', name: 'Popular', monthly_price: 2999, max_images: 250, purchasable: true },
  { id: 'pro', name: 'Pro', monthly_price: 5999, max_images: 0, purchasable: false },
]

export function supportWhatsAppUrl(message: string): string {
  return 'https://wa.me/' + MIRA_SUPPORT_WHATSAPP + '?text=' + encodeURIComponent(message)
}
