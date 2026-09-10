import type { Product } from '@/types'

export function orderProduct(product: Pick<Product, 'name' | 'price'>, whatsappNumber: string): string {
  const message =
    'Hi TRENDTHRIFT WEARs,\n\n' +
    'I would like to order:\n\n' +
    product.name + '\n' +
    'Price: KSh ' + product.price.toLocaleString() + '\n\n' +
    'Please let me know if it is still available.'

  const digits = whatsappNumber.replace(/[^\d]/g, '')
  return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message)
}

export function orderSavedProducts(products: Pick<Product, 'name' | 'price'>[], whatsappNumber: string): string {
  const lines = products
    .map((p, i) => (i + 1) + '. ' + p.name + ' - KSh ' + p.price.toLocaleString())
    .join('\n')

  const message =
    'Hi TRENDTHRIFT WEARs,\n\n' +
    'I would like to order these items:\n\n' +
    lines + '\n\n' +
    'Please let me know which items are still available.'

  const digits = whatsappNumber.replace(/[^\d]/g, '')
  return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message)
}
