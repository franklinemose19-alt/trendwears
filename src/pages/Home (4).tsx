import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { MessageCircle } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useSettings } from '@/hooks/useSettings'
import ProductGrid from '@/components/ProductGrid'
import { sortProducts } from '@/services/products'

const categories = ['Jackets', 'Jeans', 'Shirts', 'T-Shirts', 'Pants', 'Shoes']

export default function Home() {
  const { products, loading } = useProducts()
  const settings = useSettings()

  const available = useMemo(() => products.filter((p) => p.status === 'available'), [products])
  const latest = available.slice(0, 4)
  const popular = useMemo(() => sortProducts(available, 'most_liked').slice(0, 4), [available])

  const whatsappNumber = settings?.whatsapp_number ?? ''
  const waLink = whatsappNumber ? 'https://wa.me/' + whatsappNumber.replace(/[^\d]/g, '') : ''

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-8 md:px-5 md:pb-12 md:pt-20">
        <div className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
          <div>
            <h1 className="font-display text-3xl leading-tight text-ink md:text-5xl">
              Thrifted pieces, chosen one at a time.
            </h1>
            <p className="mt-3 max-w-sm text-sm text-stone md:mt-4 md:text-base">
              Every item in our showroom is a single find - no restocks, no duplicates. Browse the
              collection, then message us to make it yours.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 md:mt-8 md:gap-3">
              <Link
                to="/shop"
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-transform hover:scale-[1.02] md:px-6 md:py-3"
              >
                Browse the collection
              </Link>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink hover:border-ink/30 md:px-6 md:py-3"
                >
                  <MessageCircle size={18} />
                  Chat with us
                </a>
              )}
            </div>
          </div>
          {latest[0] && (
            <div className="aspect-[4/5] overflow-hidden bg-ink/5">
              <img src={latest[0].images[0]} alt={latest[0].name} className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-ink/10 py-4 md:py-6">
        <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-4 text-sm md:gap-6 md:px-5">
          {categories.map((c) => (
            <Link key={c} to={'/shop?category=' + encodeURIComponent(c)} className="whitespace-nowrap text-stone hover:text-ink">
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-5 md:py-14">
        <div className="mb-4 flex items-end justify-between md:mb-6">
          <h2 className="font-display text-xl text-ink md:text-2xl">Latest drops</h2>
          <Link to="/shop" className="text-sm text-stone hover:text-ink">View all</Link>
        </div>
        {!loading && <ProductGrid products={latest} whatsappNumber={whatsappNumber} />}
      </section>

      {popular.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-10 md:px-5 md:pb-16">
          <h2 className="mb-4 font-display text-xl text-ink md:mb-6 md:text-2xl">Popular right now</h2>
          <ProductGrid products={popular} whatsappNumber={whatsappNumber} />
        </section>
      )}
    </div>
  )
}
