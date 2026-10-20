import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
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

export default function AdminProducts() {
  const { byId } = usePlans()
  const [products, setProducts] = useState<ProductWithStats[]>([])
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [plan, setPlan] = useState<Plan>('basic')
  const [features, setFeatures] = useState<PlanFeatures | null>(null)
  const [usedImages, setUsedImages] = useState(0)
  const [storeLive, setStoreLive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  async function load() {
    setLoading(true)
    const business = await fetchMyBusiness()
    setBusinessId(business?.id ?? null)
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

  const planInfo = byId(plan)
  const usedElsewhere = editing && editing !== 'new' ? Math.max(0, usedImages - editing.images.length) : usedImages
  const upgrade = plan === 'basic'
    ? { name: byId('popular').name, limit: byId('popular').max_images, href: '/admin' }
    : null

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
    if (!confirm('Delete this product? This cannot be undone.')) return
    try {
      await deleteProduct(id)
      setMessage({ type: 'ok', text: 'Product deleted.' })
      load()
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Could not delete the product: ' + (err?.message ?? 'unknown error') })
    }
  }

  async function handleMarkSold(product: ProductWithStats) {
    try {
      await updateProduct(product.id, { status: product.status === 'sold' ? 'available' : 'sold' })
      load()
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Could not update the product: ' + (err?.message ?? 'unknown error') })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Products</h1>
        <button
          onClick={() => { setMessage(null); setEditing('new') }}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
        >
          <Plus size={16} /> Add product
        </button>
      </div>

      {!loading && (
        <div className="mt-4">
          <ImageUsageBar used={usedImages} limit={planInfo.max_images} planName={planInfo.name} upgrade={upgrade} />
        </div>
      )}

      {message && (
        <p className={'mt-4 rounded-lg px-4 py-3 text-sm ' + (message.type === 'ok' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')}>
          {message.text}
        </p>
      )}

      {editing && features && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm text-white/60">{editing === 'new' ? 'New product' : 'Edit product'}</h2>
            <button onClick={() => setEditing(null)} className="text-white/50 hover:text-white"><X size={18} /></button>
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
        </div>
      )}

      <div className="mt-8 space-y-2">
        {!loading && products.length === 0 && (
          <p className="text-sm text-white/40">No products yet. Click Add product to publish your first one.</p>
        )}
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-xl border border-white/10 p-3">
            <img src={p.images[0]} className="h-14 w-14 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {p.name}
                {p.featured && features?.featured_products && (
                  <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">Featured</span>
                )}
                {p.sale_price != null && p.sale_price < p.price && features?.flash_sales && (
                  <span className="ml-2 rounded-full bg-rust/20 px-2 py-0.5 text-xs text-rust">Flash Sale</span>
                )}
              </p>
              <p className="text-xs text-white/50">
                KSh {p.price.toLocaleString()} - {p.status} - {p.view_count} views - {p.like_count} likes
              </p>
            </div>
            <button onClick={() => handleMarkSold(p)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs">
              {p.status === 'sold' ? 'Mark available' : 'Mark sold'}
            </button>
            <button onClick={() => setEditing(p)} className="text-white/60 hover:text-white"><Pencil size={16} /></button>
            <button onClick={() => handleDelete(p.id)} className="text-white/60 hover:text-red-400"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
