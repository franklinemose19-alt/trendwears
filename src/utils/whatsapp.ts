import type { Product } from '@/types'

export function orderProduct(
  businessName: string,
  product: Pick<Product, 'name' | 'price' | 'sale_price'>,
  whatsappNumber: string
): string {
  const effectivePrice = product.sale_price ?? product.price

  const message =
    'Hi ' + businessName + ',\n\n' +
    'I would like to order:\n\n' +
    product.name + '\n' +
    'Price: KSh ' + effectivePrice.toLocaleString() + '\n\n' +
    'Please let me know if it is still available.'

  const digits = whatsappNumber.replace(/[^\d]/g, '')
  return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message)
}

export function orderSavedProducts(
  businessName: string,
  products: Pick<Product, 'name' | 'price'>[],
  whatsappNumber: string
): string {
  const lines = products
    .map((p, i) => (i + 1) + '. ' + p.name + ' - KSh ' + p.price.toLocaleString())
    .join('\n')

  const message =
    'Hi ' + businessName + ',\n\n' +
    'I would like to order these items:\n\n' +
    lines + '\n\n' +
    'Please let me know which items are still available.'

  const digits = whatsappNumber.replace(/[^\d]/g, '')
  return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message)
}

export function orderCart(
  businessName: string,
  items: { name: string; price: number; quantity: number }[],
  whatsappNumber: string
): string {
  const lines = items
    .map((i) => i.quantity + 'x ' + i.name + ' - KSh ' + (i.price * i.quantity).toLocaleString())
    .join('\n')

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const message =
    'Hi ' + businessName + ',\n\n' +
    'I would like to order:\n\n' +
    lines + '\n\n' +
    'Order total: KSh ' + total.toLocaleString() + '\n\n' +
    'Please let me know if these are still available.'

  const digits = whatsappNumber.replace(/[^\d]/g, '')
  return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message)
}
