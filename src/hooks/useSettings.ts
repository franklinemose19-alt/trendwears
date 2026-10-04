import { useEffect, useState } from 'react'
import { fetchMyBusiness } from '@/services/businesses'
import type { Business } from '@/types'

export function useSettings() {
  const [settings, setSettings] = useState<Business | null>(null)

  useEffect(() => {
    fetchMyBusiness().then(setSettings).catch(() => {})
  }, [])

  return settings
}
