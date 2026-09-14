import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Heart } from 'lucide-react'
import { useSavedProducts } from '@/hooks/useSavedProducts'
import type { SavedProduct } from '@/utils/savedProducts'

export default function SaveButton({ product, full }: { product: SavedProduct; full?: boolean }) {
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
    <>
      <button
        onClick={handleClick}
        className={'inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-xs text-ink transition-transform hover:border-ink/30 active:scale-95 ' + (full ? 'w-full' : '')}
      >
        <Heart size={15} className={saved ? 'fill-rust text-rust' : 'text-stone'} />
        {saved ? 'Saved' : 'Save'}
      </button>

      {showToast && createPortal(
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm text-paper shadow-lg">
          Saved to your collection
        </div>,
        document.body
      )}
    </>
  )
}
