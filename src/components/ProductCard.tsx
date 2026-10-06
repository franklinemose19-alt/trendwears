import { Link } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import SaveButton from '@/components/SaveButton'
import CartButton from '@/components/CartButton'
import WhatsAppButton from '@/components/WhatsAppButton'
import { useBusiness } from '@/contexts/BusinessContext'
import type { ProductWithStats } from '@/types'

export default function ProductCard({ product, whatsappNumber }: { product: ProductWithStats; whatsappNumber: string }) {
  const { slug, features } = useBusiness()
  const sold = product.status === 'sold'
  const hasImage = product.images.length > 0

  return (
    <div className="group">
      <Link to={'/store/' + slug + '/product/' + product.id} className="block">
        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-ink/5">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className={'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ' + (sold ? 'grayscale' : '')}
              loading="lazy"
            />
          ) : (
            <ImageOff size={28} className="text-stone/40" />
          )}
          {sold && (
            <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs text-paper">
              Sold
            </span>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium text-ink">{product.name}</h3>
          <p className="text-sm text-stone">
            KSh {product.price.toLocaleString()} - {product.category}
          </p>
        </div>
      </Link>

      <div className="mt-3 flex flex-col gap-2">
        <WhatsAppButton product={product} whatsappNumber={whatsappNumber} businessId={product.business_id} soldOut={sold} full />
        {features.cart && !sold && (
          <CartButton businessId={product.business_id} product={product} full />
        )}
        {features.favorites && (
          <SaveButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              category: product.category,
              images: product.images,
              status: product.status,
            }}
            full
          />
        )}
      </div>
    </div>
  )
}
