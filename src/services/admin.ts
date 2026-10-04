import { supabase } from '@/lib/supabase'
import type { OverviewStats, Product } from '@/types'

export async function fetchOverviewStats(): Promise<OverviewStats> {
  const [total, views, likes, clicks, available, sold] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('product_views').select('*', { count: 'exact', head: true }),
    supabase.from('product_likes').select('*', { count: 'exact', head: true }),
    supabase.from('whatsapp_clicks').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
  ])

  return {
    totalProducts: total.count ?? 0,
    totalViews: views.count ?? 0,
    totalLikes: likes.count ?? 0,
    whatsappEnquiries: clicks.count ?? 0,
    availableProducts: available.count ?? 0,
    soldProducts: sold.count ?? 0,
  }
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const { data, error } = await supabase.from('products').insert(product).select().single()
  if (error) throw error
  return data
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<void> {
  const { error } = await supabase.from('products').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = 'products/' + crypto.randomUUID() + '.' + ext
  const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export async function fetchViewsLast30Days(): Promise<{ date: string; views: number }[]> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase.from('product_views').select('created_at').gte('created_at', since)
  if (error) throw error

  const counts: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    counts[d.toISOString().slice(0, 10)] = 0
  }
  ;(data ?? []).forEach((row) => {
    const day = row.created_at.slice(0, 10)
    if (day in counts) counts[day]++
  })

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, views]) => ({ date, views }))
}
