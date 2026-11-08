import { supabase } from '@/lib/supabase'
import type { Business } from '@/types'

// The difference between the database clock and this device's clock, so a countdown cannot be fooled by a wrong phone clock.
let offsetPromise: Promise<number> | null = null
export function fetchServerOffsetMs(): Promise<number> {
  if (!offsetPromise) {
    offsetPromise = (async () => {
      const before = Date.now()
      const { data, error } = await supabase.rpc('mira_server_time')
      const after = Date.now()
      if (error || !data) return 0
      return new Date(data as string).getTime() - (before + after) / 2
    })().catch(() => 0)
  }
  return offsetPromise
}

// Marks overdue trials as "trial_expired" using the database clock. Access never depends on this label.
export async function syncTrialStatus(slug?: string): Promise<void> {
  await supabase.rpc('sync_trial_status', { p_slug: slug ?? null })
}

// MIRA administrators only (the database refuses anyone else, and allows at most three).
export async function setFoundingAmbassador(businessId: string, value: boolean): Promise<Business> {
  const { data, error } = await supabase.rpc('admin_set_founding_ambassador', {
    p_business_id: businessId,
    p_value: value,
  })
  if (error) throw new Error(error.message)
  return data as Business
}
