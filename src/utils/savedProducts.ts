export interface SavedProduct {
  id: string
  name: string
  price: number
  category: string
  images: string[]
  status: string
}

const SAVED_KEY = 'tw_saved_products'

export function getSavedProducts(): SavedProduct[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function isProductSaved(id: string): boolean {
  return getSavedProducts().some((p) => p.id === id)
}

export function saveProduct(product: SavedProduct): SavedProduct[] {
  const current = getSavedProducts()
  if (current.some((p) => p.id === product.id)) return current
  const next = [...current, product]
  localStorage.setItem(SAVED_KEY, JSON.stringify(next))
  return next
}

export function removeSavedProduct(id: string): SavedProduct[] {
  const next = getSavedProducts().filter((p) => p.id !== id)
  localStorage.setItem(SAVED_KEY, JSON.stringify(next))
  return next
}
