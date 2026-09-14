import ProductCard from '@/components/ProductCard'
import type { ProductWithStats } from '@/types'

export default function ProductGrid({ products, whatsappNumber }: { products: ProductWithStats[]; whatsappNumber: string }) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-stone">No products match your filters yet.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:gap-x-4 md:gap-y-8 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} whatsappNumber={whatsappNumber} />
      ))}
    </div>
  )
}
