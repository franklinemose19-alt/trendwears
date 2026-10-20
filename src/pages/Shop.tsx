import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useBusiness } from '@/contexts/BusinessContext'
import ProductGrid from '@/components/ProductGrid'
import { sortProducts } from '@/services/products'
import type { SortOption } from '@/types'

const categories = ['All', 'Jackets', 'Jeans', 'Shirts', 'T-Shirts', 'Pants', 'Shoes']

export default function Shop() {
  const { business, features } = useBusiness()
  const { products, loading } = useProducts(business?.id)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [sort, setSort] = useState<SortOption>('newest')

  useEffect(() => {
    const c = searchParams.get('category')
    if (c) setCategory(c)
  }, [searchParams])

  // Search, sorting and category filters are Popular features. Without them the shop simply lists everything, newest first.
  const activeSearch = features.search_filter ? search : ''
  const activeSort: SortOption = features.search_filter ? sort : 'newest'
  const activeCategory = features.categories ? category : 'All'

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.status !== 'draft')
    if (activeCategory !== 'All') list = list.filter((p) => p.category === activeCategory)
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q))
    }
    return sortProducts(list, activeSort)
  }, [products, activeCategory, activeSearch, activeSort])

  function handleCategory(c: string) {
    setCategory(c)
    setSearchParams(c === 'All' ? {} : { category: c })
  }

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
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
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

      {features.categories && (
        <div className="mt-3 flex gap-2 overflow-x-auto text-sm md:mt-4 md:gap-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => handleCategory(c)}
              className={'whitespace-nowrap rounded-full border px-3.5 py-1.5 ' + (category === c ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-stone')}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 md:mt-8">
        {loading ? <p className="py-16 text-center text-stone">Loading...</p> : <ProductGrid products={filtered} whatsappNumber={business?.whatsapp_number ?? ''} />}
      </div>
    </div>
  )
}
