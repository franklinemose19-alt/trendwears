import { MessageCircle } from 'lucide-react'
import { recordWhatsAppClick } from '@/services/products'
import { orderProduct } from '@/utils/whatsapp'
import type { Product } from '@/types'

interface Props {
  product: Pick<Product, 'id' | 'name' | 'price'>
  whatsappNumber: string
  full?: boolean
  soldOut?: boolean
}

export default function WhatsAppButton({ product, whatsappNumber, full, soldOut }: Props) {
  async function handleClick() {
    await recordWhatsAppClick(product.id)
    window.open(orderProduct(product, whatsappNumber), '_blank')
  }

  if (soldOut) {
    return (
      <button
        disabled
        className={'inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-ink/10 px-6 py-3 text-sm font-medium text-stone ' + (full ? 'w-full' : '')}
      >
        Sold Out
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={'inline-flex items-center justify-center gap-2 rounded-full bg-moss px-6 py-3 text-sm font-medium text-paper transition-transform hover:scale-[1.02] active:scale-[0.98] ' + (full ? 'w-full' : '')}
    >
      <MessageCircle size={18} />
      Order on WhatsApp
    </button>
  )
}
