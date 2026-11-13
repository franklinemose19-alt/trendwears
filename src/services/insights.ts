import { supabase } from '@/lib/supabase'

export interface Enquiry {
  id: string
  created_at: string
  product_id: string | null
  product_name: string | null
}

// Each row is one tap on "Order on WhatsApp". MIRA does not see the conversation, so it cannot know if it became a sale.
// If the tracking table cannot be read, this returns an empty list instead of breaking the page.
export async function fetchRecentEnquiries(businessId: string, limit = 10): Promise<Enquiry[]> {
  const { data, error } = await supabase
    .from('whatsapp_clicks')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []

  const ids = [...new Set((data as any[]).map((r) => r.product_id).filter(Boolean))] as string[]
  const names: Record<string, string> = {}
  if (ids.length > 0) {
    const { data: prods } = await supabase.from('products').select('id, name').in('id', ids)
    ;((prods ?? []) as any[]).forEach((p) => { names[p.id] = p.name })
  }

  return (data as any[]).map((r, i) => ({
    id: String(r.id ?? r.created_at + i),
    created_at: r.created_at,
    product_id: r.product_id ?? null,
    product_name: r.product_id ? names[r.product_id] ?? null : null,
  }))
}

// How many enquiries in the last N days, or null if it cannot be counted.
export async function fetchEnquiryCountSince(businessId: string, days: number): Promise<number | null> {
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const { count, error } = await supabase
    .from('whatsapp_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('created_at', since)
  if (error) return null
  return count ?? 0
}
