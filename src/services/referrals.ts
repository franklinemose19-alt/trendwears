import { supabase } from '@/lib/supabase'

export interface ReferredStore {
  name: string
  joined_at: string
  set_up: boolean
  published: boolean
  paying: boolean
}

export interface ReferralSummary {
  code: string
  signed_up: number
  set_up: number
  published: number
  active_paying: number
  partner: null | { since: string; ends_at: string; target: number; active_paying_in_period: number }
  referrals: ReferredStore[]
}

// A new merchant applies the code from the link they came through (the database allows it once, for a new store).
export async function claimReferral(code: string): Promise<void> {
  const { error } = await supabase.rpc('claim_referral', { p_code: code })
  if (error) throw new Error(error.message)
}

// The signed-in merchant's own referral summary.
export async function fetchMyReferrals(): Promise<ReferralSummary | null> {
  const { data, error } = await supabase.rpc('my_referral_summary')
  if (error) throw new Error(error.message)
  return (data ?? null) as ReferralSummary | null
}

export interface AdminReferralRow {
  business_id: string
  signed_up: number
  active_paying: number
  partner_in_period: number | null
}

// MIRA administrators only (the database refuses anyone else).
export async function fetchAdminReferralOverview(): Promise<AdminReferralRow[]> {
  const { data, error } = await supabase.rpc('admin_referral_overview')
  if (error) throw new Error(error.message)
  return (data ?? []) as AdminReferralRow[]
}
