import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

interface Props {
  businessId: string
  product: { id: string; name: string; price: number; images: string[] }
  full?: boolean
}

export default function CartButton({ businessId, product, full }: Props) {
  const { add } = useCart(businessId)
  const [showToast, setShowToast] = useState(false)

  function handleClick() {
    add(product)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 1500)
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={'inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-xs text-ink transition-transform hover:border-ink/30 active:scale-95 ' + (full ? 'w-full' : '')}
      >
        <ShoppingBag size={15} />
        Add to Cart
      </button>

      {showToast && createPortal(
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm text-paper shadow-lg">
          Added to cart
        </div>,
        document.body
      )}
    </div>
  )
}
