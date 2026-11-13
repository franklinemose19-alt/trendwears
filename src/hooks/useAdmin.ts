import { useOutletContext } from 'react-router-dom'
import type { Business, PaymentRecord, PlanFeatures } from '@/types'

// What the merchant workspace (AdminLayout) shares with every page inside it, so pages do not each reload the store.
export interface AdminContextValue {
  business: Business | null
  features: PlanFeatures | null
  payments: PaymentRecord[]
  loading: boolean
  reload: () => Promise<void>
  setBusiness: (business: Business) => void
}

export function useAdmin(): AdminContextValue {
  return useOutletContext<AdminContextValue>()
}
