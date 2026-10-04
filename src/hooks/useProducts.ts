import { useEffect, useState } from 'react'
import { fetchProductsWithStats } from '@/services/products'
import type { ProductWithStats } from '@/types'

export function useProducts(businessId: string | undefined) {
  const [products, setProducts] = useState<ProductWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!businessId) return
    let cancelled = false
    setLoading(true)
    fetchProductsWithStats(businessId)
      .then((data) => { if (!cancelled) setProducts(data) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [businessId])

  return { products, loading, error }
}
