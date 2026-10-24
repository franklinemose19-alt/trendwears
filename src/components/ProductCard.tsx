import { Link } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import SaveButton from '@/components/SaveButton'
import CartButton from '@/components/CartButton'
import WhatsAppButton from '@/components/WhatsAppButton'
import { useBusiness } from '@/contexts/BusinessContext'
import { AUDIENCE_LABELS, sizesOf, colorsOf, needsChoice } from '@/utils/productOptions'
import type { ProductWithStats } from '@/types'

export default function ProductCard({ product, whatsappNumber }: { product: ProductWithStats; whatsappNumber: string }) {
  const { slug, features, business } = useBusiness()
  const sold = product.status === 'sold'
  const hasImage = product.images.length > 0
  const onSale = features.flash_sales && product.sale_price != null && product.sale_price < product.price
  const featured = features.featured_products && product.featured
  const detailsPath = '/store/' + slug + '/product/' + product.id

  const choose = needsChoice(product)
  const sizes = sizesOf(product)
  const colours = colorsOf(product)

  const labels: string[] = []
  if (features.categories) {
    if (product.audience) labels.push(AUDIENCE_LABELS[product.audience])
    if (product.category) labels.push(product.category)
  }
  const categoryText = labels.length > 0 ? ' - ' + labels.join(' - ') : ''

  return (
    <div className="group">
      <Link to={detailsPath} className="block">
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
          {!sold && onSale && (
            <span className="absolute left-3 top-3 rounded-full bg-rust px-3 py-1 text-xs text-paper">
              Flash Sale
            </span>
          )}
          {!sold && !onSale && featured && (
            <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs text-paper">
              Featured
            </span>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium text-ink">{product.name}</h3>
          {onSale ? (
            <p className="text-sm text-stone">
              <span className="text-rust">KSh {product.sale_price!.toLocaleString()}</span>{' '}
              <span className="line-through opacity-60">KSh {product.price.toLocaleString()}</span>
              {categoryText}
            </p>
          ) : (
            <p className="text-sm text-stone">
              KSh {product.price.toLocaleString()}{categoryText}
            </p>
          )}
          {(sizes.length > 1 || colours.length > 1) && (
            <p className="text-xs text-stone/80">
              {[sizes.length > 1 ? sizes.length + ' sizes' : '', colours.length > 1 ? colours.length + ' colours' : '']
                .filter(Boolean)
                .join(' - ')}
            </p>
          )}
        </div>
      </Link>

      <div className="mt-3 flex flex-col gap-2">
        {choose && !sold ? (
          <Link
            to={detailsPath}
            className="inline-flex w-full items-center justify-center rounded-full bg-moss px-4 py-2 text-xs font-medium text-paper"
          >
            Choose options
          </Link>
        ) : (
          <WhatsAppButton
            product={product}
            whatsappNumber={whatsappNumber}
            businessId={product.business_id}
            businessName={business?.name ?? ''}
            soldOut={sold}
            size={sizes.length === 1 ? sizes[0] : undefined}
            colour={colours.length === 1 ? colours[0] : undefined}
            full
          />
        )}
        {features.cart && !sold && !choose && (
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
