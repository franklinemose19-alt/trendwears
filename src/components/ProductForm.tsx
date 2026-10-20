import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { uploadProductImage } from '@/services/admin'
import { validateImageFile, compressImage } from '@/utils/images'
import type { Product, ProductStatus } from '@/types'

type ProductDraft = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'business_id'>

interface Props {
  initial?: Partial<Product>
  onSubmit: (data: ProductDraft) => Promise<void>
  submitLabel: string
  allowFlashSale: boolean
  allowCategories: boolean
  allowFeatured: boolean
  businessId: string | null
  planName: string
  imageLimit: number
  imagesUsedElsewhere: number
}

const categories = ['Jackets', 'Jeans', 'Shirts', 'T-Shirts', 'Pants', 'Shoes', 'Other']
const conditions = ['Excellent', 'Good', 'Fair']

export default function ProductForm({
  initial,
  onSubmit,
  submitLabel,
  allowFlashSale,
  allowCategories,
  allowFeatured,
  businessId,
  planName,
  imageLimit,
  imagesUsedElsewhere,
}: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [salePrice, setSalePrice] = useState(initial?.sale_price?.toString() ?? '')
  const [category, setCategory] = useState(initial?.category ?? (allowCategories ? categories[0] : 'Other'))
  const [size, setSize] = useState(initial?.size ?? '')
  const [condition, setCondition] = useState(initial?.condition ?? conditions[0])
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? 'available')
  const [featured, setFeatured] = useState(initial?.featured ?? false)
  const [images, setImages] = useState<string[]>(initial?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [saving, setSaving] = useState(false)

  const usedNow = imagesUsedElsewhere + images.length
  const remaining = Math.max(0, imageLimit - usedNow)

  async function handleFiles(files: File[]) {
    if (files.length === 0) return
    setUploadError('')

    if (!businessId) {
      setUploadError('Your store is still loading. Please try again in a moment.')
      return
    }
    if (remaining <= 0) {
      setUploadError('You have reached your ' + planName + ' allowance of ' + imageLimit + ' active images. Remove an image or upgrade to add more.')
      return
    }
    if (files.length > remaining) {
      setUploadError('You can add ' + remaining + ' more image' + (remaining === 1 ? '' : 's') + ', but you selected ' + files.length + '.')
      return
    }
    for (const f of files) {
      const problem = validateImageFile(f)
      if (problem) {
        setUploadError(problem)
        return
      }
    }

    setUploading(true)
    try {
      const prepared = await Promise.all(files.map(compressImage))
      const urls = await Promise.all(prepared.map((f) => uploadProductImage(f, businessId)))
      setImages((prev) => [...prev, ...urls])
    } catch (err: any) {
      setUploadError('Image upload failed: ' + (err?.message ?? 'unknown error'))
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        name,
        price: Number(price),
        sale_price: allowFlashSale && salePrice ? Number(salePrice) : null,
        featured: allowFeatured ? featured : (initial?.featured ?? false),
        category,
        size,
        condition,
        description: description || null,
        images,
        status,
      })
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40'

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-white/60">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/60">Price (KSh)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputCls} />
        </div>

        {allowFlashSale && (
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-white/60">Flash sale price (KSh, optional)</label>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="Leave blank for no active sale"
              className={inputCls}
            />
          </div>
        )}

        {allowCategories && (
          <div>
            <label className="mb-1 block text-sm text-white/60">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm text-white/60">Size</label>
          <input value={size} onChange={(e) => setSize(e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/60">Condition</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputCls}>
            {conditions.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/60">Availability</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className={inputCls}>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {allowFeatured && (
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Feature this product on the store home page
        </label>
      )}

      <div>
        <label className="mb-1 block text-sm text-white/60">Description</label>
        <textarea value={description ?? ''} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} />
      </div>

      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm text-white/60">Images</label>
          <span className="text-xs text-white/40">
            {usedNow} / {imageLimit} images used - {remaining} remaining
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={url} className="relative h-20 w-20">
              <img src={url} className="h-full w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -right-2 -top-2 rounded-full bg-black p-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <label
            className={
              'flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-white/25 text-white/50 ' +
              (remaining > 0 ? 'cursor-pointer hover:border-white/50' : 'cursor-not-allowed opacity-40')
            }
          >
            {uploading ? '...' : <Upload size={18} />}
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading || remaining <= 0}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                e.target.value = ''
                handleFiles(files)
              }}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-white/40">JPG, PNG or WebP. Large photos are resized and compressed automatically.</p>
        {uploadError && <p className="mt-2 text-sm text-red-400">{uploadError}</p>}
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
      >
        {saving ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
