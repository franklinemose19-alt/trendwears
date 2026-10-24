import { MessageCircle } from 'lucide-react'
import { recordWhatsAppClick } from '@/services/products'
import { orderProduct, normalizeWhatsAppNumber } from '@/utils/whatsapp'
import type { Product } from '@/types'

interface Props {
  product: Pick<Product, 'id' | 'name' | 'price' | 'sale_price'>
  whatsappNumber: string
  businessId: string
  businessName: string
  full?: boolean
  soldOut?: boolean
  size?: string
  colour?: string
}

export default function WhatsAppButton({ product, whatsappNumber, businessId, businessName, full, soldOut, size, colour }: Props) {
  const width = full ? 'w-full' : ''

  async function handleClick() {
    await recordWhatsAppClick(product.id, businessId)
    window.open(orderProduct(businessName, product, whatsappNumber, { size, colour }), '_blank')
  }

  if (soldOut) {
    return (
      <button
        disabled
        className={'inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-full bg-ink/10 px-4 py-2 text-xs font-medium text-stone ' + width}
      >
        Sold Out
      </button>
    )
  }

  // No usable number: say so instead of showing a button that cannot work.
  if (!normalizeWhatsAppNumber(whatsappNumber)) {
    return (
      <p className={'rounded-full bg-ink/5 px-4 py-2 text-center text-xs text-stone ' + width}>
        WhatsApp ordering is not set up yet
      </p>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={'inline-flex items-center justify-center gap-1.5 rounded-full bg-moss px-4 py-2 text-xs font-medium text-paper transition-transform hover:scale-[1.02] active:scale-[0.98] ' + width}
    >
      <MessageCircle size={15} />
      Order on WhatsApp
    </button>
  )
}
