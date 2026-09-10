import { Link } from 'react-router-dom'
import { Trash2, MessageCircle } from 'lucide-react'
import { useSavedProducts } from '@/hooks/useSavedProducts'
import { useSettings } from '@/hooks/useSettings'
import { orderProduct, orderSavedProducts } from '@/utils/whatsapp'
import { recordWhatsAppClick } from '@/services/products'

export default function Saved() {
  const { saved, remove } = useSavedProducts()
  const settings = useSettings()
  const whatsappNumber = settings?.whatsapp_number ?? ''

  async function handleOrderOne(id: string, name: string, price: number) {
    await recordWhatsAppClick(id)
    window.open(orderProduct({ name, price }, whatsappNumber), '_blank')
  }

  async function handleOrderAll() {
    await Promise.all(saved.map((p) => recordWhatsAppClick(p.id)))
    window.open(orderSavedProducts(saved, whatsappNumber), '_blank')
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">My Saved Items</h1>
        {saved.length > 0 && whatsappNumber && (
          <button
            onClick={handleOrderAll}
            className="inline-flex items-center gap-2 rounded-full bg-moss px-5 py-2.5 text-sm font-medium text-paper"
          >
            <MessageCircle size={16} />
            Order All on WhatsApp
          </button>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-stone">No saved items yet.</p>
          <p className="mt-2 text-stone">Browse the latest thrift finds and save the pieces you like.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper"
          >
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {saved.map((p) => {
            const sold = p.status === 'sold'
            return (
              <div key={p.id} className="flex items-center gap-4 rounded-xl border border-ink/10 p-3">
                <img src={p.images[0]} className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-stone">KSh {p.price.toLocaleString()} - {p.category}</p>
                </div>
                {sold ? (
                  <span className="text-xs text-stone">Sold Out</span>
                ) : (
                  <button
                    onClick={() => handleOrderOne(p.id, p.name, p.price)}
                    className="rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink hover:border-ink/30"
                  >
                    Order on WhatsApp
                  </button>
                )}
                <button onClick={() => remove(p.id)} className="text-stone hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
