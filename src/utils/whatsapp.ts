import type { Product } from '@/types'

// Turns the way a Kenyan merchant might type a number into the international form WhatsApp links need.
// 0712 345 678, +254 712 345 678, 254712345678 and 712345678 all become 254712345678.
// Returns null when the number cannot be a real WhatsApp number.
export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null
  let digits = String(raw).replace(/[^\d]/g, '')
  if (!digits) return null
  if (digits.startsWith('00')) digits = digits.slice(2)

  if (digits.startsWith('2540') && digits.length === 13) digits = '254' + digits.slice(4) // +254 (0)712...
  if (digits.startsWith('254')) return digits.length === 12 ? digits : null
  if (digits.startsWith('0')) return digits.length === 10 ? '254' + digits.slice(1) : null
  if (digits.length === 9 && /^[71]/.test(digits)) return '254' + digits
  if (digits.length >= 10 && digits.length <= 15) return digits // another country, already with its country code
  return null
}

export function whatsappLink(number: string | null | undefined, message: string): string | null {
  const normalized = normalizeWhatsAppNumber(number)
  return normalized ? 'https://wa.me/' + normalized + '?text=' + encodeURIComponent(message) : null
}

// Used only when a store has no usable number: opens WhatsApp's own chooser instead of a broken link.
function fallbackLink(message: string): string {
  return 'https://wa.me/?text=' + encodeURIComponent(message)
}

const money = (n: number) => 'KSh ' + n.toLocaleString('en-KE')

export interface EnquiryInput {
  businessName: string
  productName: string
  price: number
  quantity?: number
  size?: string
  colour?: string
  productUrl?: string
}

// Only the details that exist are included. Opening WhatsApp is an enquiry, not a confirmed order.
export function buildProductEnquiry(i: EnquiryInput): string {
  const parts = [
    'Hello ' + i.businessName + ", I'm interested in " + i.productName + '.',
    'The listed price is ' + money(i.price) + '.',
  ]
  if (i.quantity && i.quantity > 0) parts.push('Quantity: ' + i.quantity + '.')
  if (i.size) parts.push('Size: ' + i.size + '.')
  if (i.colour) parts.push('Colour: ' + i.colour + '.')
  parts.push('Is it available, and can you confirm delivery options?')

  let message = parts.join(' ')
  if (i.productUrl) message += '\n\nProduct: ' + i.productUrl
  return message
}

export function orderProduct(
  businessName: string,
  product: Pick<Product, 'name' | 'price' | 'sale_price'>,
  whatsappNumber: string,
  options: { size?: string; colour?: string; quantity?: number; productUrl?: string } = {}
): string {
  const message = buildProductEnquiry({
    businessName,
    productName: product.name,
    price: product.sale_price ?? product.price,
    ...options,
  })
  return whatsappLink(whatsappNumber, message) ?? fallbackLink(message)
}

export function orderSavedProducts(
  businessName: string,
  products: Pick<Product, 'name' | 'price'>[],
  whatsappNumber: string
): string {
  const lines = products
    .map((p, i) => (i + 1) + '. ' + p.name + ' - ' + money(p.price))
    .join('\n')

  const message =
    'Hi ' + businessName + ',\n\n' +
    'I would like to order these items:\n\n' +
    lines + '\n\n' +
    'Please let me know which items are still available.'

  return whatsappLink(whatsappNumber, message) ?? fallbackLink(message)
}

export function orderCart(
  businessName: string,
  items: { name: string; price: number; quantity: number }[],
  whatsappNumber: string
): string {
  const lines = items
    .map((i) => i.quantity + 'x ' + i.name + ' - ' + money(i.price * i.quantity))
    .join('\n')

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const message =
    'Hi ' + businessName + ',\n\n' +
    'I would like to order:\n\n' +
    lines + '\n\n' +
    'Order total: ' + money(total) + '\n\n' +
    'Please let me know if these are still available.'

  return whatsappLink(whatsappNumber, message) ?? fallbackLink(message)
}
