export const MIRA_SUPPORT_WHATSAPP = '254111947810'
export const MIRA_TILL_NUMBER = '1725838'
export const PLAN_PRICES: Record<'basic' | 'popular', number> = { basic: 2999, popular: 4999 }

export function supportWhatsAppUrl(message: string): string {
  return 'https://wa.me/' + MIRA_SUPPORT_WHATSAPP + '?text=' + encodeURIComponent(message)
}
