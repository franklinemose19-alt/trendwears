import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus, MessageCircle } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useBusiness } from '@/contexts/BusinessContext'
import { orderCart } from '@/utils/whatsapp'
import { cartSubtotal } from '@/utils/cart'

export default function Cart() {
  const { business, slug, features, loading } = useBusiness()
  const { items, setQuantity, remove, clear } = useCart(business?.id)
  const subtotal = cartSubtotal(items)

  function handleCheckout() {
    if (!business?.whatsapp_number) return
    window.open(orderCart(business.name, items, business.whatsapp_number), '_blank')
  }

  if (loading) return <p className="py-24 text-center text-stone">Loading...</p>

  if (!features.cart) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-2xl text-ink">Cart isn't available here</h1>
        <p className="mt-2 text-stone">This store's current plan doesn't include cart checkout. Order items directly via WhatsApp instead.</p>
        <Link to={'/store/' + slug + '/shop'} className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper">
          Browse Collection
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="font-display text-3xl text-ink">Your Cart</h1>

      {items.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-stone">Your cart is empty.</p>
          <Link
            to={'/store/' + slug + '/shop'}
            className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper"
          >
            Browse Collection
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border border-ink/10 p-3">
                <img src={item.images[0]} className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-stone">KSh {item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(item.id, item.quantity - 1)}
                    className="rounded-full border border-ink/15 p-1.5 text-ink hover:border-ink/30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => setQuantity(item.id, item.quantity + 1)}
                    className="rounded-full border border-ink/15 p-1.5 text-ink hover:border-ink/30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button onClick={() => remove(item.id)} className="text-stone hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-6">
            <span className="text-stone">Subtotal</span>
            <span className="text-lg font-medium text-ink">KSh {subtotal.toLocaleString()}</span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleCheckout}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-moss px-6 py-3 text-sm font-medium text-paper"
            >
              <MessageCircle size={16} />
              Continue to WhatsApp Checkout
            </button>
            <button
              onClick={clear}
              className="rounded-full border border-ink/15 px-6 py-3 text-sm text-stone hover:border-ink/30"
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  )
}
