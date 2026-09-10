import { supabase } from '@/lib/supabase'
import { getVisitorId } from '@/utils/visitorId'
import type { Product, ProductWithStats, SortOption } from '@/types'

const VIEW_DEDUPE_WINDOW_HOURS = 24

export async function fetchProductsWithStats(): Promise<ProductWithStats[]> {
  const visitorId = getVisitorId()

  const [{ data: products, error: pErr }, { data: views }, { data: likes }, { data: clicks }] =
    await Promise.all([
      supabase.from('products').select('*').neq('status', 'draft').order('created_at', { ascending: false }),
      supabase.from('product_views').select('product_id'),
      supabase.from('product_likes').select('product_id, visitor_id'),
      supabase.from('whatsapp_clicks').select('product_id'),
    ])

  if (pErr) throw pErr

  const viewCounts = countBy(views ?? [], 'product_id')
  const likeCounts = countBy(likes ?? [], 'product_id')
  const clickCounts = countBy(clicks ?? [], 'product_id')
  const likedSet = new Set((likes ?? []).filter((l) => l.visitor_id === visitorId).map((l) => l.product_id))

  return (products ?? []).map((p) => ({
    ...p,
    view_count: viewCounts[p.id] ?? 0,
    like_count: likeCounts[p.id] ?? 0,
    whatsapp_click_count: clickCounts[p.id] ?? 0,
    liked_by_visitor: likedSet.has(p.id),
  }))
}

export async function fetchProductById(id: string): Promise<ProductWithStats | null> {
  const visitorId = getVisitorId()

  const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error || !product) return null

  const [{ data: views }, { data: likes }, { data: clicks }, { data: myLike }] = await Promise.all([
    supabase.from('product_views').select('id').eq('product_id', id),
    supabase.from('product_likes').select('id').eq('product_id', id),
    supabase.from('whatsapp_clicks').select('id').eq('product_id', id),
    supabase.from('product_likes').select('id').eq('product_id', id).eq('visitor_id', visitorId).maybeSingle(),
  ])

  return {
    ...product,
    view_count: views?.length ?? 0,
    like_count: likes?.length ?? 0,
    whatsapp_click_count: clicks?.length ?? 0,
    liked_by_visitor: !!myLike,
  }
}

export async function recordView(productId: string): Promise<void> {
  const visitorId = getVisitorId()
  const since = new Date(Date.now() - VIEW_DEDUPE_WINDOW_HOURS * 60 * 60 * 1000).toISOString()

  const { data: recent } = await supabase
    .from('product_views')
    .select('id')
    .eq('product_id', productId)
    .eq('visitor_id', visitorId)
    .gte('created_at', since)
    .maybeSingle()

  if (recent) return

  await supabase.from('product_views').insert({ product_id: productId, visitor_id: visitorId })
}

export async function toggleLike(productId: string, currentlyLiked: boolean): Promise<boolean> {
  const visitorId = getVisitorId()

  if (currentlyLiked) {
    await supabase.from('product_likes').delete().eq('product_id', productId).eq('visitor_id', visitorId)
    return false
  } else {
    await supabase.from('product_likes').insert({ product_id: productId, visitor_id: visitorId })
    return true
  }
}

export async function recordWhatsAppClick(productId: string): Promise<void> {
  const visitorId = getVisitorId()
  await supabase.from('whatsapp_clicks').insert({ product_id: productId, visitor_id: visitorId })
}

export function sortProducts(products: ProductWithStats[], sort: SortOption): ProductWithStats[] {
  const arr = [...products]
  switch (sort) {
    case 'most_viewed':
      return arr.sort((a, b) => b.view_count - a.view_count)
    case 'most_liked':
      return arr.sort((a, b) => b.like_count - a.like_count)
    case 'price_low':
      return arr.sort((a, b) => a.price - b.price)
    case 'price_high':
      return arr.sort((a, b) => b.price - a.price)
    case 'newest':
    default:
      return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}

function countBy<T extends Record<string, any>>(rows: T[], key: keyof T): Record<string, number> {
  return rows.reduce((acc, row) => {
    const k = row[key] as string
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
}
