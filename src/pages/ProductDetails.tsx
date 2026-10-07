import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useProduct } from '@/hooks/useProduct'
import { useBusiness } from '@/contexts/BusinessContext'
import ProductGallery from '@/components/ProductGallery'
import LikeButton from '@/components/LikeButton'
import SaveButton from '@/components/SaveButton'
import CartButton from '@/components/CartButton'
import WhatsAppButton from '@/components/WhatsAppButton'

export default function ProductDetails() {
  const { id } = useParams()
  const { product, loading } = useProduct(id)
  const { business, slug, features } = useBusiness()

  if (loading) return <p className="py-24 text-center text-stone">Loading...</p>
  if (!product) return <p className="py-24 text-center text-stone">Product not found.</p>

  const sold = product.status === 'sold'
  const onSale = features.flash_sales && product.sale_price != null && product.sale_price < product.price

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Link to={'/store/' + slug + '/shop'} className="mb-6 inline-flex items-center gap-1 text-sm text-stone hover:text-ink">
        <ChevronLeft size={16} /> Back to shop
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          {onSale && (
            <span className="mb-2 inline-block rounded-full bg-rust px-3 py-1 text-xs text-paper">
              Flash Sale
            </span>
          )}
          <h1 className="font-display text-3xl text-ink">{product.name}</h1>
          {onSale ? (
            <p className="mt-2 text-xl text-ink">
              <span className="text-rust">KSh {product.sale_price!.toLocaleString()}</span>{' '}
              <span className="text-base line-through opacity-50">KSh {product.price.toLocaleString()}</span>
            </p>
          ) : (
            <p className="mt-2 text-xl text-ink">KSh {product.price.toLocaleString()}</p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-stone">Size</dt>
              <dd className="text-ink">{product.size}</dd>
            </div>
            <div>
              <dt className="text-stone">Category</dt>
              <dd className="text-ink">{product.category}</dd>
            </div>
            <div>
              <dt className="text-stone">Condition</dt>
              <dd className="text-ink">{product.condition}</dd>
            </div>
            <div>
              <dt className="text-stone">Availability</dt>
              <dd className="text-ink">{sold ? 'Sold' : 'Available'}</dd>
            </div>
          </dl>

          {product.description && <p className="mt-6 text-stone">{product.description}</p>}

          <p className="mt-6 text-xs text-stone">
            {product.view_count} views - {product.like_count} likes
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <LikeButton productId={product.id} businessId={product.business_id} liked={!!product.liked_by_visitor} count={product.like_count} />
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
              />
            )}
            {features.cart && !sold && (
              <CartButton businessId={product.business_id} product={product} />
            )}
            {business?.whatsapp_number && (
              <WhatsAppButton
                product={product}
                whatsappNumber={business.whatsapp_number}
                businessId={product.business_id}
                businessName={business.name}
                soldOut={sold}
                full
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
