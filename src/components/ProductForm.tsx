import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { Product, ProductStatus } from '@/types'

interface Props {
  initial?: Partial<Product>
  onSubmit: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  submitLabel: string
}

const categories = ['Jackets', 'Jeans', 'Shirts', 'T-Shirts', 'Pants', 'Shoes', 'Other']
const conditions = ['Excellent', 'Good', 'Fair']

export default function ProductForm({ initial, onSubmit, submitLabel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [category, setCategory] = useState(initial?.category ?? categories[0])
  const [size, setSize] = useState(initial?.size ?? '')
  const [condition, setCondition] = useState(initial?.condition ?? conditions[0])
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? 'available')
  const [images, setImages] = useState<string[]>(initial?.images ?? [])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [saving, setSaving] = useState(false)

  function handleAddImageUrl() {
    const url = imageUrlInput.trim()
    if (!url) return
    if (!url.startsWith('http')) {
      alert('Please paste a full image URL starting with http:// or https://')
      return
    }
    setImages((prev) => [...prev, url])
    setImageUrlInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        name,
        price: Number(price),
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
        <div>
          <label className="mb-1 block text-sm text-white/60">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
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

      <div>
        <label className="mb-1 block text-sm text-white/60">Description</label>
        <textarea value={description ?? ''} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/60">Images (paste direct image link, e.g. from Imgur)</label>

        <div className="flex gap-2">
          <input
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl() } }}
            placeholder="https://i.imgur.com/example.jpg"
            className={inputCls}
          />
          <button
            type="button"
            onClick={handleAddImageUrl}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/5"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={url + i} className="relative h-20 w-20">
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
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
      >
        {saving ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
