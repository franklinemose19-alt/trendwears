import { useEffect, useState } from 'react'
import { getCart, addToCart, updateQuantity, removeFromCart, clearCart, type CartItem } from '@/utils/cart'

export function useCart(businessId: string | undefined) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    if (!businessId) return
    setItems(getCart(businessId))
  }, [businessId])

  function add(product: Omit<CartItem, 'quantity'>) {
    if (!businessId) return
    setItems(addToCart(businessId, product))
  }

  function setQuantity(productId: string, quantity: number) {
    if (!businessId) return
    setItems(updateQuantity(businessId, productId, quantity))
  }

  function remove(productId: string) {
    if (!businessId) return
    setItems(removeFromCart(businessId, productId))
  }

  function clear() {
    if (!businessId) return
    setItems(clearCart(businessId))
  }

  return { items, add, setQuantity, remove, clear }
}
