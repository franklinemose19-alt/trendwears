import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useBusiness } from '@/contexts/BusinessContext'
import ProductGrid from '@/components/ProductGrid'
import { sortProducts } from '@/services/products'
import { AUDIENCE_LABELS, audiencesIn, categoriesIn, colorsOf } from '@/utils/productOptions'
import type { ProductAudience, SortOption } from '@/types'

export default function Shop() {
  const { business, features } = useBusiness()
  const { products, loading } = useProducts(business?.id)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [audience, setAudience] = useState<'all' | ProductAudience>(
    (['men', 'women', 'unisex'].includes(searchParams.get('audience') ?? '') ? searchParams.get('audience') : 'all') as 'all' | ProductAudience
  )
  const [sort, setSort] = useState<SortOption>('newest')

  useEffect(() => {
    const c = searchParams.get('category')
    if (c) setCategory(c)
  }, [searchParams])

  const visible = useMemo(() => products.filter((p) => p.status !== 'draft'), [products])

  // Filters are built from what this store actually sells, so a menswear shop never shows an empty "Dresses" chip.
  const audiences = useMemo(() => audiencesIn(visible), [visible])
  const categories = useMemo(() => categoriesIn(visible), [visible])

  // Search, sorting, categories and Men/Women/Unisex are MIRA Signature features.
  // Without them the shop simply lists everything, newest first.
  const activeSearch = features.search_filter ? search : ''
  const activeSort: SortOption = features.search_filter ? sort : 'newest'
  const activeCategory = features.categories ? category : 'All'
  const activeAudience = features.categories ? audience : 'all'

  const filtered = useMemo(() => {
    let list = visible
    if (activeAudience !== 'all') list = list.filter((p) => p.audience === activeAudience)
    if (activeCategory !== 'All') list = list.filter((p) => p.category === activeCategory)
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category ?? '').toLowerCase().includes(q) ||
          (p.audience ? AUDIENCE_LABELS[p.audience].toLowerCase().includes(q) : false) ||
          colorsOf(p).some((c) => c.toLowerCase().includes(q))
      )
    }
    return sortProducts(list, activeSort)
  }, [visible, activeAudience, activeCategory, activeSearch, activeSort])

  function updateParams(nextAudience: 'all' | ProductAudience, nextCategory: string) {
    const params: Record<string, string> = {}
    if (nextAudience !== 'all') params.audience = nextAudience
    if (nextCategory !== 'All') params.category = nextCategory
    setSearchParams(params)
  }

  function handleCategory(c: string) {
    setCategory(c)
    updateParams(audience, c)
  }

  function handleAudience(a: 'all' | ProductAudience) {
    setAudience(a)
    updateParams(a, category)
  }

  const chip = (selected: boolean) =>
    'whitespace-nowrap rounded-full border px-3.5 py-1.5 ' + (selected ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-stone')

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-5 md:py-10">
      <h1 className="font-display text-2xl text-ink md:text-3xl">Shop the collection</h1>

      {features.search_filter && (
        <div className="mt-4 flex flex-col gap-3 md:mt-6 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 md:w-72">
            <Search size={16} className="text-stone" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            aria-label="Sort products"
            className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink"
          >
            <option value="newest">Newest</option>
            <option value="most_viewed">Most viewed</option>
            <option value="most_liked">Most liked</option>
            <option value="price_low">Price: low to high</option>
            <option value="price_high">Price: high to low</option>
          </select>
        </div>
      )}

      {features.categories && audiences.length > 0 && (
        <div role="group" aria-label="Shop by" className="mt-3 flex gap-2 overflow-x-auto text-sm md:mt-4 md:gap-3">
          <button type="button" aria-pressed={audience === 'all'} onClick={() => handleAudience('all')} className={chip(audience === 'all')}>
            All
          </button>
          {audiences.map((a) => (
            <button key={a} type="button" aria-pressed={audience === a} onClick={() => handleAudience(a)} className={chip(audience === a)}>
              {AUDIENCE_LABELS[a]}
            </button>
          ))}
        </div>
      )}

      {features.categories && categories.length > 0 && (
        <div role="group" aria-label="Categories" className="mt-3 flex gap-2 overflow-x-auto text-sm md:mt-4 md:gap-3">
          {['All', ...categories].map((c) => (
            <button key={c} type="button" aria-pressed={category === c} onClick={() => handleCategory(c)} className={chip(category === c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 md:mt-8">
        {loading ? (
          <p className="py-16 text-center text-stone">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-stone">No products match your filters.</p>
        ) : (
          <ProductGrid products={filtered} whatsappNumber={business?.whatsapp_number ?? ''} />
        )}
      </div>
    </div>
  )
}
