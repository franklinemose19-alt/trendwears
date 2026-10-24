import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Minus, Plus, MessageCircle } from 'lucide-react'
import { useProduct } from '@/hooks/useProduct'
import { useBusiness } from '@/contexts/BusinessContext'
import { recordWhatsAppClick } from '@/services/products'
import { buildProductEnquiry, whatsappLink } from '@/utils/whatsapp'
import { AUDIENCE_LABELS, sizesOf, colorsOf, needsChoice } from '@/utils/productOptions'
import ProductGallery from '@/components/ProductGallery'
import LikeButton from '@/components/LikeButton'
import SaveButton from '@/components/SaveButton'
import CartButton from '@/components/CartButton'

const MAX_QUANTITY = 10

export default function ProductDetails() {
  const { id } = useParams()
  const { product, loading } = useProduct(id)
  const { business, slug, features } = useBusiness()
  const [pickedSize, setPickedSize] = useState<string | null>(null)
  const [pickedColour, setPickedColour] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  if (loading) return <p className="py-24 text-center text-stone">Loading...</p>
  if (!product) return <p className="py-24 text-center text-stone">Product not found.</p>

  const sold = product.status === 'sold'
  const onSale = features.flash_sales && product.sale_price != null && product.sale_price < product.price
  const unitPrice = onSale ? (product.sale_price as number) : product.price

  const sizes = sizesOf(product)
  const colours = colorsOf(product)
  // A single size or colour needs no choosing; several do.
  const size = pickedSize ?? (sizes.length === 1 ? sizes[0] : null)
  const colour = pickedColour ?? (colours.length === 1 ? colours[0] : null)
  const missing: string[] = []
  if (sizes.length > 1 && !size) missing.push('a size')
  if (colours.length > 1 && !colour) missing.push('a colour')

  const productUrl = window.location.origin + '/store/' + slug + '/product/' + product.id
  const enquiry = buildProductEnquiry({
    businessName: business?.name ?? '',
    productName: product.name,
    price: unitPrice,
    quantity,
    size: size ?? undefined,
    colour: colour ?? undefined,
    productUrl,
  })
  const orderUrl = whatsappLink(business?.whatsapp_number, enquiry)

  const questionUrl =
    features.inquiries
      ? whatsappLink(
          business?.whatsapp_number,
          'Hi ' + (business?.name ?? '') + ', I have a question about ' + product.name + '.\n\nProduct: ' + productUrl
        )
      : null

  async function handleOrder() {
    if (!orderUrl || missing.length > 0) return
    await recordWhatsAppClick(product!.id, product!.business_id)
    window.open(orderUrl, '_blank')
  }

  const details: [string, string][] = []
  if (features.categories && product.audience) details.push(['For', AUDIENCE_LABELS[product.audience]])
  if (features.categories && product.category) details.push(['Category', product.category])
  if (product.condition) details.push(['Condition', product.condition])
  details.push(['Availability', sold ? 'Sold' : 'Available'])

  const chip = (selected: boolean) =>
    'rounded-full border px-4 py-1.5 text-sm transition-colors ' +
    (selected ? 'border-ink bg-ink text-paper' : 'border-ink/20 text-ink hover:border-ink/50')

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

          {sizes.length > 1 && (
            <div className="mt-6">
              <p className="mb-2 text-sm text-stone">Size{size ? ': ' + size : ''}</p>
              <div role="group" aria-label="Size" className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button key={s} type="button" aria-pressed={size === s} onClick={() => setPickedSize(s)} className={chip(size === s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colours.length > 1 && (
            <div className="mt-5">
              <p className="mb-2 text-sm text-stone">Colour{colour ? ': ' + colour : ''}</p>
              <div role="group" aria-label="Colour" className="flex flex-wrap gap-2">
                {colours.map((c) => (
                  <button key={c} type="button" aria-pressed={colour === c} onClick={() => setPickedColour(c)} className={chip(colour === c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {sizes.length === 1 && (
              <div>
                <dt className="text-stone">Size</dt>
                <dd className="text-ink">{sizes[0]}</dd>
              </div>
            )}
            {colours.length === 1 && (
              <div>
                <dt className="text-stone">Colour</dt>
                <dd className="text-ink">{colours[0]}</dd>
              </div>
            )}
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-stone">{label}</dt>
                <dd className="text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          {product.description && <p className="mt-6 text-stone">{product.description}</p>}

          <p className="mt-6 text-xs text-stone">
            {product.view_count} views - {product.like_count} likes
          </p>

          {!sold && (
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm text-stone">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="rounded-full border border-ink/20 p-1.5 text-ink hover:border-ink/50"
                >
                  <Minus size={14} />
                </button>
                <span aria-live="polite" className="w-6 text-center text-sm text-ink">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                  className="rounded-full border border-ink/20 p-1.5 text-ink hover:border-ink/50"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

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
            {features.cart && !sold && !needsChoice(product) && (
              <CartButton businessId={product.business_id} product={product} />
            )}
            {questionUrl && (
              <a
                href={questionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-ink/15 px-4 py-2 text-xs text-ink hover:border-ink/30"
              >
                Ask a question
              </a>
            )}
          </div>

          <div className="mt-4">
            {sold ? (
              <button disabled className="w-full cursor-not-allowed rounded-full bg-ink/10 px-4 py-3 text-sm font-medium text-stone">
                Sold Out
              </button>
            ) : orderUrl ? (
              <>
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={missing.length > 0}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-moss px-4 py-3 text-sm font-medium text-paper transition-transform enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MessageCircle size={16} />
                  Order on WhatsApp
                </button>
                {missing.length > 0 && (
                  <p role="status" className="mt-2 text-center text-xs text-stone">Choose {missing.join(' and ')} to order.</p>
                )}
                <p className="mt-2 text-center text-xs text-stone/80">
                  This opens WhatsApp with your message. The store confirms availability and delivery with you.
                </p>
              </>
            ) : (
              <p className="rounded-xl bg-ink/5 px-4 py-3 text-center text-sm text-stone">
                This store has not set up WhatsApp ordering yet.{' '}
                <Link to={'/store/' + slug + '/contact'} className="underline">See how to reach them</Link>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
