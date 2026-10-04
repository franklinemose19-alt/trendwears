import { supabase } from '@/lib/supabase'
import type { Business, BusinessStatus, Plan, PlanFeatures } from '@/types'

export async function fetchBusinessBySlug(slug: string): Promise<Business | null> {
  const { data, error } = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle()
  if (error || !data) return null
  return data
}

export async function fetchAllBusinesses(): Promise<Business[]> {
  const { data, error } = await supabase.from('businesses').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchMyBusiness(): Promise<Business | null> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return null
  const { data, error } = await supabase.from('businesses').select('*').eq('owner_user_id', auth.user.id).maybeSingle()
  if (error || !data) return null
  return data
}

export async function updateBusiness(id: string, patch: Partial<Business>): Promise<void> {
  const { error } = await supabase.from('businesses').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function updateBusinessStatus(id: string, status: BusinessStatus): Promise<void> {
  await updateBusiness(id, { status })
}

export async function updateBusinessPlan(id: string, plan: Plan): Promise<void> {
  await updateBusiness(id, { plan })
}

export async function fetchPlanFeatures(plan: Plan): Promise<PlanFeatures> {
  const { data, error } = await supabase.from('plan_features').select('feature, enabled').eq('plan', plan)
  if (error) throw error

  const features: PlanFeatures = {
    cart: false,
    favorites: false,
    customer_accounts: false,
    notifications: false,
    promotions: false,
    analytics: false,
    advanced_customization: false,
  }
  ;(data ?? []).forEach((row) => {
    if (row.feature in features) {
      ;(features as any)[row.feature] = row.enabled
    }
  })
  return features
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function registerBusiness(params: {
  name: string
  whatsappNumber: string
}): Promise<void> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('You must be signed in to register a business.')

  const baseSlug = slugify(params.name) || 'store'
  const uniqueSlug = baseSlug + '-' + auth.user.id.slice(0, 6)

  const { error } = await supabase.from('businesses').insert({
    slug: uniqueSlug,
    name: params.name,
    whatsapp_number: params.whatsappNumber,
    status: 'pending',
    plan: 'basic',
    subscription_status: 'unpaid',
    owner_user_id: auth.user.id,
  })

  if (error) throw error
}
