import { useState } from 'react'
import GarmentArt from '@/demo/garmentArt'
import type { DemoProduct } from '@/demo/miraStudio'

interface Props {
  product: DemoProduct
  colourHex: string
  className?: string
}

// Shows the product photo when there is one, and falls back to the illustration if it is missing or fails to load.
export default function DemoImage({ product, colourHex, className }: Props) {
  const [failed, setFailed] = useState(false)

  if (product.image && !failed) {
    return (
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={className}
      />
    )
  }
  return <GarmentArt kind={product.art} colour={colourHex} label={product.name} className={className} />
}
