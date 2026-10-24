import type { Product, ProductAudience } from '@/types'

export const AUDIENCES: ProductAudience[] = ['men', 'women', 'unisex']

export const AUDIENCE_LABELS: Record<ProductAudience, string> = {
  men: 'Men',
  women: 'Women',
  unisex: 'Unisex',
}

// Suggestions only: merchants can type any category that fits their boutique.
export const CATEGORY_SUGGESTIONS = [
  'T-Shirts', 'Polo Shirts', 'Shirts', 'Hoodies', 'Sweatshirts', 'Jeans', 'Trousers', 'Cargo Pants',
  'Shorts', 'Jackets', 'Tracksuits', 'Dresses', 'Tops', 'Blouses', 'Skirts', 'Sneakers', 'Footwear',
  'Heels', 'Handbags', 'Jewellery', 'Caps', 'Belts', 'Accessories', 'Other',
]

// "S, M, L" -> ['S', 'M', 'L'] (trimmed, no duplicates, sensible limits)
export function parseList(input: string, maxItems = 30, maxLength = 20): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of input.split(/[,\n]/)) {
    const value = part.trim().slice(0, maxLength)
    const key = value.toLowerCase()
    if (value && !seen.has(key)) {
      seen.add(key)
      out.push(value)
    }
    if (out.length >= maxItems) break
  }
  return out
}

// Older products only have the single "size" text; newer ones have a list of sizes.
export function sizesOf(p: Pick<Product, 'sizes' | 'size'>): string[] {
  if (p.sizes && p.sizes.length > 0) return p.sizes
  return p.size && p.size.trim() ? parseList(p.size) : []
}

export function colorsOf(p: Pick<Product, 'colors'>): string[] {
  return p.colors ?? []
}

// True when the customer has a real choice to make (more than one size or colour).
export function needsChoice(p: Pick<Product, 'sizes' | 'size' | 'colors'>): boolean {
  return sizesOf(p).length > 1 || colorsOf(p).length > 1
}

export function categoriesIn(products: Pick<Product, 'category'>[]): string[] {
  const counts = new Map<string, number>()
  for (const p of products) {
    const c = (p.category ?? '').trim()
    if (c) counts.set(c, (counts.get(c) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([c]) => c)
}

export function audiencesIn(products: Pick<Product, 'audience'>[]): ProductAudience[] {
  return AUDIENCES.filter((a) => products.some((p) => p.audience === a))
}
