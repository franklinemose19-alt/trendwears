import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import SaveButton from '@/components/SaveButton'
import WhatsAppButton from '@/components/WhatsAppButton'
import type { ProductWithStats } from '@/types'

export default function ProductCard({ product, whatsappNumber }: { product: ProductWithStats; whatsappNumber: string }) {
  const sold = product.status === 'sold'
  const hasImage = product.images.length > 0

  useEffect(() => {
    console.log('PRODUCT:', {
      id: product.id,
      name: product.name,
      image: (product as any).image,
      image_url: (product as any).image_url,
      imageUrl: (product as any).imageUrl,
      images: product.images,
    })
  }, [product.id])

  return (
    <div className="group">
      <Link to={'/product/' + product.id} className="block">
        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-ink/5">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className={'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ' + (sold ? 'grayscale' : '')}
              loading="lazy"
              onLoad={() => console.log('Image loaded OK:', product.name, product.images[0])}
              onError={() => console.error('IMAGE FAILED TO LOAD', { id: product.id, name: product.name, url: product.images[0] })}
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

      <div className="mt-3 flex items-center gap-2">
        <SaveButton
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            images: product.images,
            status: product.status,
          }}
        />
        <WhatsAppButton product={product} whatsappNumber={whatsappNumber} soldOut={sold} />
      </div>
    </div>
  )
}
