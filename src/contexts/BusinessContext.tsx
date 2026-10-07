import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { fetchBusinessBySlug, fetchPlanFeatures } from '@/services/businesses'
import type { Business, PlanFeatures } from '@/types'

const DEFAULT_FEATURES: PlanFeatures = {
  cart: false,
  favorites: false,
  customer_accounts: false,
  notifications: false,
  promotions: false,
  analytics: false,
  advanced_customization: false,
  flash_sales: false,
  in_app_payment: false,
}

interface BusinessContextValue {
  business: Business | null
  loading: boolean
  slug: string
  features: PlanFeatures
}

const BusinessContext = createContext<BusinessContextValue>({
  business: null,
  loading: true,
  slug: '',
  features: DEFAULT_FEATURES,
})

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [features, setFeatures] = useState<PlanFeatures>(DEFAULT_FEATURES)
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
      if (b) {
        fetchPlanFeatures(b.plan).then(setFeatures)
      }
    })
  }, [slug])

  return (
    <BusinessContext.Provider value={{ business, loading, slug: slug ?? '', features }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  return useContext(BusinessContext)
}
