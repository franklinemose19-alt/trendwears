import { useEffect, useState } from 'react'
import { getSavedProducts, saveProduct, removeSavedProduct, isProductSaved, type SavedProduct } from '@/utils/savedProducts'

export function useSavedProducts() {
  const [saved, setSaved] = useState<SavedProduct[]>([])

  useEffect(() => {
    setSaved(getSavedProducts())
  }, [])

  function save(product: SavedProduct) {
    setSaved(saveProduct(product))
  }

  function remove(id: string) {
    setSaved(removeSavedProduct(id))
  }

  function toggle(product: SavedProduct) {
    if (isProductSaved(product.id)) {
      remove(product.id)
    } else {
      save(product)
    }
  }

  return { saved, save, remove, toggle, isSaved: isProductSaved }
}
