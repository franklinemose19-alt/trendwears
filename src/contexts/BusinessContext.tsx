import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { fetchBusinessBySlug } from '@/services/businesses'
import type { Business } from '@/types'

interface BusinessContextValue {
  business: Business | null
  loading: boolean
  slug: string
}

const BusinessContext = createContext<BusinessContextValue>({ business: null, loading: true, slug: '' })

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchBusinessBySlug(slug).then((b) => {
      setBusiness(b)
      setLoading(false)
    })
  }, [slug])

  return (
    <BusinessContext.Provider value={{ business, loading, slug: slug ?? '' }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  return useContext(BusinessContext)
}
