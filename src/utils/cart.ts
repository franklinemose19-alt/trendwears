export interface CartItem {
  id: string
  name: string
  price: number
  images: string[]
  quantity: number
}

function cartKey(businessId: string): string {
  return 'tw_cart_' + businessId
}

export function getCart(businessId: string): CartItem[] {
  try {
    const raw = localStorage.getItem(cartKey(businessId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(businessId: string, items: CartItem[]): CartItem[] {
  localStorage.setItem(cartKey(businessId), JSON.stringify(items))
  return items
}

export function addToCart(businessId: string, product: Omit<CartItem, 'quantity'>): CartItem[] {
  const current = getCart(businessId)
  const existing = current.find((i) => i.id === product.id)
  if (existing) {
    existing.quantity += 1
    return saveCart(businessId, [...current])
  }
  return saveCart(businessId, [...current, { ...product, quantity: 1 }])
}

export function updateQuantity(businessId: string, productId: string, quantity: number): CartItem[] {
  const current = getCart(businessId)
  if (quantity <= 0) {
    return saveCart(businessId, current.filter((i) => i.id !== productId))
  }
  const next = current.map((i) => (i.id === productId ? { ...i, quantity } : i))
  return saveCart(businessId, next)
}

export function removeFromCart(businessId: string, productId: string): CartItem[] {
  return saveCart(businessId, getCart(businessId).filter((i) => i.id !== productId))
}

export function clearCart(businessId: string): CartItem[] {
  return saveCart(businessId, [])
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}
