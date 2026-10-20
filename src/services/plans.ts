import { supabase } from '@/lib/supabase'
import { DEFAULT_PLANS } from '@/config'
import type { PlanInfo } from '@/types'

export async function fetchPlans(): Promise<PlanInfo[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('id, name, monthly_price, max_images, purchasable')
    .order('sort_order')
  if (error || !data || data.length === 0) return DEFAULT_PLANS
  return data as PlanInfo[]
}

// Active images = every image currently attached to one of the store's products.
export async function fetchImageUsage(businessId: string): Promise<number> {
  const { data, error } = await supabase.from('products').select('images').eq('business_id', businessId)
  if (error) throw error
  return (data ?? []).reduce((sum, row: any) => sum + (row.images?.length ?? 0), 0)
}
