import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Search, Minus, Plus, ArrowLeft, MessageCircle } from 'lucide-react'
import { DEMO_PRODUCTS, DEMO_STORE, categoriesFor } from '@/demo/miraStudio'
import type { DemoProduct } from '@/demo/miraStudio'
import DemoImage from '@/demo/DemoImage'
import { buildProductEnquiry } from '@/utils/whatsapp'
import type { PlanInfo } from '@/types'

type ShopBy = 'all' | 'men' | 'women' | 'unisex' | 'accessories'
type Collection = 'all' | 'new' | 'featured'

const SHOP_BY: { id: ShopBy; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'unisex', label: 'Unisex' },
  { id: 'accessories', label: 'Accessories' },
]

const COLLECTIONS: { id: Collection; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'new', label: 'New arrivals' },
  { id: 'featured', label: 'Featured' },
]

const AUDIENCE_LABEL = { men: 'Men', women: 'Women', unisex: 'Unisex' } as const
const MAX_QUANTITY = 10
const money = (n: number) => 'KSh ' + n.toLocaleString('en-KE')

function matchesShopBy(p: DemoProduct, shopBy: ShopBy): boolean {
  if (shopBy === 'all') return true
  if (shopBy === 'accessories') return p.category === 'Accessories'
  return p.audience === shopBy
}

const chip = (selected: boolean) =>
  'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors ' +
  (selected ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-stone hover:border-ink/40')

interface Plans {
  essential: PlanInfo
  signature: PlanInfo
  atelier: PlanInfo
}

interface Props {
  onClose: () => void
  onSeePricing: () => void
  initialProductId?: string
  plans: Plans
}

function ProductView({ product, onBack }: { product: DemoProduct; onBack: () => void }) {
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null)
  const [colour, setColour] = useState<string | null>(product.colours.length === 1 ? product.colours[0].name : null)
  const [quantity, setQuantity] = useState(1)
  const [showPreview, setShowPreview] = useState(false)

  const shownHex = product.colours.find((c) => c.name === colour)?.hex ?? product.colours[0].hex
  const missing: string[] = []
  if (product.sizes.length > 1 && !size) missing.push('a size')
  if (product.colours.length > 1 && !colour) missing.push('a colour')

  const message = buildProductEnquiry({
    businessName: DEMO_STORE.name,
    productName: product.name,
    price: product.price,
    quantity,
    size: size ?? undefined,
    colour: colour ?? undefined,
    productUrl: 'Demo reference ' + product.id.toUpperCase(),
  })

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-1 text-sm text-stone hover:text-ink">
        <ArrowLeft size={16} aria-hidden="true" /> Back to the demo shop
      </button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-[#f1eee7]">
          <DemoImage product={product} colourHex={shownHex} className="h-auto w-full" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-stone">
            {AUDIENCE_LABEL[product.audience]} - {product.category}
          </p>
          <h2 className="mt-1 font-display text-3xl text-ink">{product.name}</h2>
          <p className="mt-2 text-xl text-ink">{money(product.price)}</p>
          <p className="mt-4 text-stone">{product.description}</p>

          {product.sizes.length > 1 && (
            <div className="mt-6">
              <p className="mb-2 text-sm text-stone">Size{size ? ': ' + size : ''}</p>
              <div role="group" aria-label="Size" className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)} className={chip(size === s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.sizes.length === 1 && <p className="mt-6 text-sm text-stone">Size: {product.sizes[0]}</p>}
          {product.sizes.length === 0 && <p className="mt-6 text-sm text-stone">One size</p>}

          {product.colours.length > 1 && (
            <div className="mt-5">
              <p className="mb-2 text-sm text-stone">Colour{colour ? ': ' + colour : ''}</p>
              <div role="group" aria-label="Colour" className="flex flex-wrap gap-2">
                {product.colours.map((c) => (
                  <button key={c.name} type="button" aria-pressed={colour === c.name} onClick={() => setColour(c.name)} className={chip(colour === c.name) + ' inline-flex items-center gap-2'}>
                    <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm text-stone">Quantity</span>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="rounded-full border border-ink/20 p-1.5 text-ink hover:border-ink/50">
                <Minus size={14} aria-hidden="true" />
              </button>
              <span aria-live="polite" className="w-6 text-center text-sm text-ink">{quantity}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))} className="rounded-full border border-ink/20 p-1.5 text-ink hover:border-ink/50">
                <Plus size={14} aria-hidden="true" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={missing.length > 0}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-moss px-4 py-3 text-sm font-medium text-paper disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageCircle size={16} aria-hidden="true" />
            Preview WhatsApp message
          </button>
          {missing.length > 0 && (
            <p role="status" className="mt-2 text-center text-xs text-stone">Choose {missing.join(' and ')} to preview your message.</p>
          )}

          {showPreview && missing.length === 0 && (
            <div role="region" aria-label="WhatsApp message preview" className="mt-5 rounded-2xl border border-ink/10 bg-paper p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone">WhatsApp message preview (demo)</p>
              <div className="whitespace-pre-line rounded-2xl rounded-tr-sm bg-[#dcf8c6] px-4 py-3 text-sm text-black">{message}</div>
              <p className="mt-3 text-xs text-stone">
                This is only a preview. Nothing is sent, no order is created and no payment is taken. In a real MIRA
                store, this opens WhatsApp with this message ready to send to the boutique, and the store then confirms
                availability and delivery with you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DemoStore({ onClose, onSeePricing, initialProductId, plans }: Props) {
  const [productId, setProductId] = useState<string | null>(initialProductId ?? null)
  const [shopBy, setShopBy] = useState<ShopBy>('all')
  const [category, setCategory] = useState('All')
  const [collection, setCollection] = useState<Collection>('all')
  const [search, setSearch] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Dialog behaviour: focus the close button, stop the page behind from scrolling, Esc closes, Tab stays inside.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, select, [tabindex]:not([tabindex="-1"])')
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  useEffect(() => {
    dialogRef.current?.scrollTo?.({ top: 0 })
  }, [productId])

  const inShopBy = useMemo(() => DEMO_PRODUCTS.filter((p) => matchesShopBy(p, shopBy)), [shopBy])
  const categories = useMemo(() => categoriesFor(inShopBy), [inShopBy])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return inShopBy.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (collection === 'all' || p.tags.includes(collection)) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.audience === q ||
          p.colours.some((c) => c.name.toLowerCase().includes(q)))
    )
  }, [inShopBy, category, collection, search])

  const product = productId ? DEMO_PRODUCTS.find((p) => p.id === productId) ?? null : null

  function chooseShopBy(next: ShopBy) {
    setShopBy(next)
    setCategory('All')
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={DEMO_STORE.name + ' demo store'}
      className="fixed inset-0 z-50 overflow-y-auto bg-paper text-ink"
    >
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-5">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-medium tracking-wide text-paper">DEMO</span>
            <span className="font-display text-lg">{DEMO_STORE.name}</span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close demo store and go back to MIRA"
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-4 py-2 text-sm text-ink hover:border-ink/50"
          >
            <X size={16} aria-hidden="true" /> Back to MIRA
          </button>
        </div>
        <p className="bg-ink px-4 py-2 text-center text-xs text-paper">
          This is a demonstration store with sample products. Nothing here is real: no orders are placed and no payments are taken.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-5 md:py-10">
        {product ? (
          <ProductView key={product.id} product={product} onBack={() => setProductId(null)} />
        ) : (
          <>
            <div>
              <h2 className="font-display text-3xl text-ink md:text-4xl">{DEMO_STORE.name}</h2>
              <p className="mt-1 text-stone">{DEMO_STORE.tagline}</p>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 md:w-80">
              <Search size={16} aria-hidden="true" className="text-stone" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the demo store"
                aria-label="Search the demo store"
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone"
              />
            </div>

            <div role="group" aria-label="Shop by" className="mt-4 flex gap-2 overflow-x-auto">
              {SHOP_BY.map((s) => (
                <button key={s.id} type="button" aria-pressed={shopBy === s.id} onClick={() => chooseShopBy(s.id)} className={chip(shopBy === s.id)}>
                  {s.label}
                </button>
              ))}
            </div>

            <div role="group" aria-label="Categories" className="mt-3 flex gap-2 overflow-x-auto">
              {['All', ...categories].map((c) => (
                <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)} className={chip(category === c)}>
                  {c}
                </button>
              ))}
            </div>

            <div role="group" aria-label="Collections" className="mt-3 flex gap-2 overflow-x-auto">
              {COLLECTIONS.map((c) => (
                <button key={c.id} type="button" aria-pressed={collection === c.id} onClick={() => setCollection(c.id)} className={chip(collection === c.id)}>
                  {c.label}
                </button>
              ))}
            </div>

            <p role="status" className="mt-4 text-xs text-stone">
              Showing {filtered.length} of {DEMO_PRODUCTS.length} sample products
            </p>

            {filtered.length === 0 ? (
              <p className="py-16 text-center text-stone">No sample products match your filters.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProductId(p.id)}
                    className="group rounded-xl text-left"
                  >
                    <div className="relative overflow-hidden rounded-xl border border-ink/10 bg-[#f1eee7]">
                      <DemoImage product={p} colourHex={p.colours[0].hex} className="h-auto w-full transition-transform duration-500 group-hover:scale-105" />
                      {p.tags.length > 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-ink px-2.5 py-0.5 text-[10px] text-paper">
                          {p.tags.includes('new') ? 'New' : 'Featured'}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium text-ink">{p.name}</p>
                    <p className="text-sm text-stone">{money(p.price)} - {AUDIENCE_LABEL[p.audience]}</p>
                    {(p.sizes.length > 1 || p.colours.length > 1) && (
                      <p className="text-xs text-stone/80">
                        {[p.sizes.length > 1 ? p.sizes.length + ' sizes' : '', p.colours.length > 1 ? p.colours.length + ' colours' : '']
                          .filter(Boolean)
                          .join(' - ')}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <section aria-labelledby="demo-packages" className="mt-14 rounded-2xl border border-ink/10 p-5 md:p-6">
          <h3 id="demo-packages" className="font-display text-xl">Run a boutique like this on MIRA</h3>
          <p className="mt-1 text-sm text-stone">Pick the package that fits. MIRA Preview is a temporary 7-day trial, not a permanent free plan.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-dashed border-ink/25 p-4">
              <p className="text-sm font-medium">MIRA Preview</p>
              <p className="mt-1 text-lg">KSh 0 <span className="text-xs text-stone">for 7 days</span></p>
            </div>
            <div className="rounded-xl border border-ink/15 p-4">
              <p className="text-sm font-medium">{plans.essential.name}</p>
              <p className="mt-1 text-lg">{money(plans.essential.monthly_price ?? 0)}<span className="text-xs text-stone">/month</span></p>
            </div>
            <div className="rounded-xl border-2 border-ink p-4">
              <p className="text-sm font-medium">
                {plans.signature.name}
                <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[10px] text-paper">Recommended</span>
              </p>
              <p className="mt-1 text-lg">{money(plans.signature.monthly_price ?? 0)}<span className="text-xs text-stone">/month</span></p>
            </div>
            <div className="rounded-xl border border-ink/10 bg-ink/[0.03] p-4">
              <p className="text-sm font-medium">{plans.atelier.name}</p>
              <p className="mt-1 text-lg text-stone">Coming Soon</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link to="/register" className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper">
              Create Your Store
            </Link>
            <button type="button" onClick={onSeePricing} className="rounded-full border border-ink/20 px-6 py-3 text-sm text-ink hover:border-ink/50">
              See full pricing
            </button>
            <button type="button" onClick={onClose} className="px-2 py-3 text-sm text-stone underline hover:text-ink">
              Back to MIRA
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
