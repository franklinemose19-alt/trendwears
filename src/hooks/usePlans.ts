import { useEffect, useState } from 'react'
import { DEFAULT_PLANS } from '@/config'
import { fetchPlans } from '@/services/plans'
import type { Plan, PlanInfo } from '@/types'

export function usePlans() {
  const [plans, setPlans] = useState<PlanInfo[]>(DEFAULT_PLANS)

  useEffect(() => {
    fetchPlans().then(setPlans)
  }, [])

  function byId(id: Plan): PlanInfo {
    return plans.find((p) => p.id === id) ?? (DEFAULT_PLANS.find((p) => p.id === id) as PlanInfo)
  }

  return { plans, byId }
}
