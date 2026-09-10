import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useSavedProducts } from '@/hooks/useSavedProducts'
import type { SavedProduct } from '@/utils/savedProducts'

export default function SaveButton({ product }: { product: SavedProduct }) {
  const { toggle, isSaved } = useSavedProducts()
  const [saved, setSaved] = useState(isSaved(product.id))
  const [showToast, setShowToast] = useState(false)

  function handleClick() {
    toggle(product)
    const next = !saved
    setSaved(next)
    if (next) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 1500)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm text-ink transition-transform hover:border-ink/30 active:scale-95"
      >
        <Heart size={16} className={saved ? 'fill-rust text-rust' : 'text-stone'} />
        {saved ? 'Saved' : 'Save'}
      </button>

      {showToast && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-xs text-paper transition-opacity">
          Saved to your collection
        </span>
      )}
    </div>
  )
}
