import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Pencil, MoreHorizontal, X, Search, ImageOff } from 'lucide-react'
import { fetchProductsWithStats } from '@/services/products'
import { createProduct, updateProduct, deleteProduct } from '@/services/admin'
import { fetchMyBusiness, fetchPlanFeatures } from '@/services/businesses'
import { fetchImageUsage } from '@/services/plans'
import { getSubscriptionState } from '@/utils/subscription'
import { usePlans } from '@/hooks/usePlans'
import ProductForm from '@/components/ProductForm'
import ImageUsageBar from '@/components/ImageUsageBar'
import type { Plan, PlanFeatures, Product, ProductWithStats } from '@/types'

type Draft = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'business_id'>
type Filter = 'all' | 'available' | 'sold' | 'draft'

const STATUS_LABEL = { available: 'Available', sold: 'Sold', draft: 'Draft' } as const

export default function AdminProducts() {
  const { byId } = usePlans()
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState<ProductWithStats[]>([])
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [slug, setSlug] = useState('')
  const [plan, setPlan] = useState<Plan>('basic')
  const [features, setFeatures] = useState<PlanFeatures | null>(null)
  const [usedImages, setUsedImages] = useState(0)
  const [storeLive, setStoreLive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const business = await fetchMyBusiness()
    setBusinessId(business?.id ?? null)
    setSlug(business?.slug ?? '')
    if (business) {
      const [data, planFeatures, used] = await Promise.all([
        fetchProductsWithStats(business.id),
        fetchPlanFeatures(business.plan),
        fetchImageUsage(business.id),
      ])
      setProducts(data)
      setPlan(business.plan)
      setFeatures(planFeatures)
      setUsedImages(used)
      setStoreLive(business.status === 'active' && getSubscriptionState(business).state === 'active')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // "Add Product" on the Overview links here with ?add=1, which opens the form straight away.
  useEffect(() => {
    if (params.get('add') === '1' && features && !loading) {
      setMessage(null)
      setEditing('new')
      const next = new URLSearchParams(params)
      next.delete('add')
      setParams(next, { replace: true })
    }
  }, [params, features, loading])

  // The "more actions" menu closes when you tap elsewhere or press Escape.
  useEffect(() => {
    if (!menuFor) return
    function onClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('[data-row-menu]')) setMenuFor(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuFor(null)
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuFor])

  const planInfo = byId(plan)
  const usedElsewhere = editing && editing !== 'new' ? Math.max(0, usedImages - editing.images.length) : usedImages
  const upgrade = plan === 'basic'
    ? { name: byId('popular').name, limit: byId('popular').max_images, href: '/admin/settings?tab=subscription' }
    : null

  const counts = useMemo(() => ({
    all: products.length,
    available: products.filter((p) => p.status === 'available').length,
    sold: products.filter((p) => p.status === 'sold').length,
    draft: products.filter((p) => p.status === 'draft').length,
  }), [products])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => (filter === 'all' || p.status === filter) && (!q || p.name.toLowerCase().includes(q) || (p.category ?? '').toLowerCase().includes(q)))
  }, [products, filter, search])

  function savedText(action: string) {
    return storeLive
      ? 'Product ' + action + '.'
      : 'Product ' + action + '. Customers will see it once MIRA activates your store.'
  }

  async function handleCreate(data: Draft) {
    if (!businessId) {
      setMessage({ type: 'error', text: 'No store found for your account yet. Contact MIRA support.' })
      return
    }
    try {
      await createProduct({ ...data, business_id: businessId })
      setEditing(null)
      setMessage({ type: 'ok', text: savedText('published') })
      load()
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Could not publish the product: ' + (err?.message ?? 'unknown error') })
    }
  }

  async function handleUpdate(id: string, data: Draft) {
    try {
      await updateProduct(id, data)
      setEditing(null)
      setMessage({ type: 'ok', text: savedText('updated') })
      load()
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Could not save changes: ' + (err?.message ?? 'unknown error') })
    }
  }

  async function handleDelete(id: string) {
    setConfirming(null)
    try {
      await deleteProduct(id)
      setMessage({ type: 'ok', text: 'Product deleted.' })
      load()
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Could not delete the product: ' + (err?.message ?? 'unknown error') })
    }
  }

  async function handleMarkSold(product: ProductWithStats) {
    setMenuFor(null)
    try {
      await updateProduct(product.id, { status: product.status === 'sold' ? 'available' : 'sold' })
      load()
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Could not update the product: ' + (err?.message ?? 'unknown error') })
    }
  }

  const chip = (selected: boolean) =>
    'min-h-[36px] whitespace-nowrap rounded-full border px-3.5 text-sm ' +
    (selected ? 'border-white bg-white text-black' : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white')

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">My Products</h1>
          {!loading && <p className="mt-1 text-sm text-white/50">{counts.all} {counts.all === 1 ? 'product' : 'products'}</p>}
        </div>
        <button
          type="button"
          onClick={() => { setMessage(null); setEditing('new') }}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black"
        >
          <Plus size={16} aria-hidden="true" /> Add product
        </button>
      </div>

      {!loading && (
        <div className="mt-4">
          <ImageUsageBar used={usedImages} limit={planInfo.max_images} planName={planInfo.name} upgrade={upgrade} />
        </div>
      )}

      {message && (
        <p role={message.type === 'error' ? 'alert' : 'status'} className={'mt-4 rounded-lg px-4 py-3 text-sm ' + (message.type === 'ok' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')}>
          {message.text}
        </p>
      )}

      {editing && features && (
        <section aria-label={editing === 'new' ? 'New product' : 'Edit product'} className="mt-6 rounded-2xl border border-white/10 p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium">{editing === 'new' ? 'New product' : 'Edit product'}</h2>
            <button type="button" aria-label="Close the product form" onClick={() => setEditing(null)} className="flex h-10 w-10 items-center justify-center text-white/50 hover:text-white">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <ProductForm
            initial={editing === 'new' ? undefined : editing}
            submitLabel={editing === 'new' ? 'Publish' : 'Save changes'}
            allowFlashSale={features.flash_sales}
            allowCategories={features.categories}
            allowFeatured={features.featured_products}
            businessId={businessId}
            planName={planInfo.name}
            imageLimit={planInfo.max_images}
            imagesUsedElsewhere={usedElsewhere}
            onSubmit={(data) => (editing === 'new' ? handleCreate(data) : handleUpdate((editing as Product).id, data))}
          />
        </section>
      )}

      {!loading && products.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Filter by availability" className="flex gap-2 overflow-x-auto">
            <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')} className={chip(filter === 'all')}>All {counts.all}</button>
            <button type="button" aria-pressed={filter === 'available'} onClick={() => setFilter('available')} className={chip(filter === 'available')}>Available {counts.available}</button>
            <button type="button" aria-pressed={filter === 'sold'} onClick={() => setFilter('sold')} className={chip(filter === 'sold')}>Sold {counts.sold}</button>
            {counts.draft > 0 && (
              <button type="button" aria-pressed={filter === 'draft'} onClick={() => setFilter('draft')} className={chip(filter === 'draft')}>Draft {counts.draft}</button>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 md:w-64">
            <Search size={15} aria-hidden="true" className="text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your products"
              aria-label="Search your products"
              className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
            />
          </div>
        </div>
      )}

      <div className="mt-4">
        {!loading && products.length === 0 && (
          <p className="py-8 text-sm text-white/40">No products yet. Tap Add product to publish your first one.</p>
        )}
        {!loading && products.length > 0 && visible.length === 0 && (
          <p className="py-8 text-sm text-white/40">No products match your search.</p>
        )}

        {visible.length > 0 && (
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {visible.map((p) => (
              <li key={p.id} className="py-3">
                <div className="flex items-start gap-3 md:items-center md:gap-4">
                  {p.images[0] ? (
                    <img src={p.images[0]} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/30" aria-hidden="true">
                      <ImageOff size={18} />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {p.name}
                      {p.featured && features?.featured_products && (
                        <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">Featured</span>
                      )}
                      {p.sale_price != null && p.sale_price < p.price && features?.flash_sales && (
                        <span className="ml-2 rounded-full bg-rust/20 px-2 py-0.5 text-xs text-rust">Flash Sale</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-white/60">
                      KSh {p.price.toLocaleString()} <span className="text-white/30">-</span> {STATUS_LABEL[p.status]}
                    </p>
                    <p className="mt-0.5 text-xs text-white/35">
                      {p.view_count} views - {p.like_count} likes - {p.whatsapp_click_count} enquiries
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label={'Edit ' + p.name}
                      onClick={() => { setMessage(null); setEditing(p) }}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white/60 hover:bg-white/5 hover:text-white"
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <div data-row-menu className="relative">
                      <button
                        type="button"
                        aria-label={'More actions for ' + p.name}
                        aria-haspopup="menu"
                        aria-expanded={menuFor === p.id}
                        onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white/60 hover:bg-white/5 hover:text-white"
                      >
                        <MoreHorizontal size={16} aria-hidden="true" />
                      </button>
                      {menuFor === p.id && (
                        <div role="menu" aria-label={'Actions for ' + p.name} className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-white/10 bg-[#161617] p-1 shadow-lg">
                          <button type="button" role="menuitem" onClick={() => handleMarkSold(p)} className="flex min-h-[40px] w-full items-center rounded-lg px-3 text-left text-sm text-white/80 hover:bg-white/5">
                            {p.status === 'sold' ? 'Mark as available' : 'Mark as sold'}
                          </button>
                          {slug && (
                            <Link role="menuitem" to={'/store/' + slug + '/product/' + p.id} className="flex min-h-[40px] w-full items-center rounded-lg px-3 text-sm text-white/80 hover:bg-white/5">
                              View in store
                            </Link>
                          )}
                          <button type="button" role="menuitem" onClick={() => { setMenuFor(null); setConfirming(p.id) }} className="flex min-h-[40px] w-full items-center rounded-lg px-3 text-left text-sm text-red-400 hover:bg-white/5">
                            Delete product
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {confirming === p.id && (
                  <div role="alertdialog" aria-label={'Confirm deleting ' + p.name} className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm">Delete {p.name}? Its images are removed from your store and this cannot be undone.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setConfirming(null)} className="min-h-[40px] rounded-full border border-white/25 px-5 text-sm text-white/80">
                        Cancel
                      </button>
                      <button type="button" onClick={() => handleDelete(p.id)} className="min-h-[40px] rounded-full bg-red-500 px-5 text-sm font-medium text-white">
                        Yes, delete it
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
