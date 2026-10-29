import type { ArtKind } from '@/demo/garmentArt'

// MIRA Studio is a FICTIONAL demonstration boutique. Everything here is sample data that lives in the page itself:
// it is never read from or written to the database.

export type DemoAudience = 'men' | 'women' | 'unisex'
export type DemoTag = 'new' | 'featured'

export interface DemoColour {
  name: string
  hex: string
}

export interface DemoProduct {
  id: string
  name: string
  price: number
  audience: DemoAudience
  category: string
  art: ArtKind
  sizes: string[]
  colours: DemoColour[]
  description: string
  tags: DemoTag[]
  // Optional real photo (for example /demo/hoodie.webp). When it is missing or fails to load, the illustration is shown.
  image?: string
}

export const DEMO_STORE = {
  name: 'MIRA Studio',
  tagline: 'Modern essentials for men, women and everyone in between.',
}

const clothing = ['S', 'M', 'L', 'XL']
const clothingWide = ['S', 'M', 'L', 'XL', 'XXL']
const womenClothing = ['XS', 'S', 'M', 'L', 'XL']

const c = (name: string, hex: string): DemoColour => ({ name, hex })

export const DEMO_PRODUCTS: DemoProduct[] = [
  // ---- Men ----
  {
    id: 'ms-m1', name: 'Classic Crew Tee', price: 1200, audience: 'men', category: 'T-Shirts', art: 'tee',
    sizes: clothingWide, colours: [c('White', '#f4f4f1'), c('Black', '#1f1f22'), c('Olive', '#6b7048'), c('Navy', '#26364f')],
    description: 'Soft heavyweight cotton with a clean neckline. The everyday tee that goes with everything.', tags: ['new'],
  },
  {
    id: 'ms-m2', name: 'Oxford Linen Shirt', price: 2800, audience: 'men', category: 'Shirts', art: 'shirt',
    sizes: clothing, colours: [c('Sky Blue', '#a9c7e3'), c('White', '#f4f4f1'), c('Sand', '#d8c7a4')],
    description: 'A breathable linen blend for hot afternoons and smart evenings. Relaxed fit, button-down collar.', tags: ['featured'],
  },
  {
    id: 'ms-m3', name: 'Heritage Polo', price: 1800, audience: 'men', category: 'Polo Shirts', art: 'polo',
    sizes: clothing, colours: [c('Navy', '#26364f'), c('Forest', '#2f5a3f'), c('Burgundy', '#6e2432')],
    description: 'Piqu\u00e9 cotton polo with a two-button placket. Smart enough for the office, easy enough for the weekend.', tags: [],
  },
  {
    id: 'ms-m4', name: 'Slim Fit Jeans', price: 3500, audience: 'men', category: 'Jeans', art: 'pants',
    sizes: ['30', '32', '34', '36', '38'], colours: [c('Indigo', '#2d3f66'), c('Black', '#1f1f22')],
    description: 'Stretch denim that keeps its shape. A slim cut through the leg with room to move.', tags: ['new'],
  },
  {
    id: 'ms-m5', name: 'Leather Belt', price: 1500, audience: 'men', category: 'Accessories', art: 'belt',
    sizes: ['S', 'M', 'L'], colours: [c('Black', '#1f1f22'), c('Tan', '#a8693b')],
    description: 'Full-grain leather with a brushed metal buckle. Built to age well.', tags: [],
  },
  // ---- Women ----
  {
    id: 'ms-w1', name: 'Wrap Midi Dress', price: 4500, audience: 'women', category: 'Dresses', art: 'dress',
    sizes: womenClothing, colours: [c('Terracotta', '#b5593c'), c('Emerald', '#1f6b52'), c('Black', '#1f1f22')],
    description: 'A flattering wrap silhouette in a fluid fabric that moves with you. Falls just below the knee.', tags: ['featured', 'new'],
  },
  {
    id: 'ms-w2', name: 'Satin Blouse', price: 2600, audience: 'women', category: 'Tops', art: 'shirt',
    sizes: womenClothing, colours: [c('Ivory', '#efe6d2'), c('Blush', '#e4b7b0'), c('Black', '#1f1f22')],
    description: 'Fluid satin with a soft drape. Tuck it into trousers or wear it loose over jeans.', tags: [],
  },
  {
    id: 'ms-w3', name: 'Pleated Midi Skirt', price: 2900, audience: 'women', category: 'Skirts', art: 'skirt',
    sizes: womenClothing, colours: [c('Sand', '#d8c7a4'), c('Black', '#1f1f22'), c('Sage', '#9aaa8c')],
    description: 'Knife pleats that hold their shape, with a comfortable elastic back waist.', tags: ['featured'],
  },
  {
    id: 'ms-w4', name: 'High-Rise Jeans', price: 3600, audience: 'women', category: 'Jeans', art: 'pants',
    sizes: ['26', '28', '30', '32', '34'], colours: [c('Light Wash', '#8fa9c9'), c('Indigo', '#2d3f66')],
    description: 'A high waist and a straight leg in soft, stretchy denim.', tags: [],
  },
  {
    id: 'ms-w5', name: 'Block Heel Sandals', price: 4200, audience: 'women', category: 'Footwear', art: 'heel',
    sizes: ['36', '37', '38', '39', '40', '41'], colours: [c('Tan', '#b27d4c'), c('Black', '#1f1f22'), c('Nude', '#d9b8a0')],
    description: 'A stable block heel that is easy to walk in all day. Adjustable ankle strap.', tags: [],
  },
  {
    id: 'ms-w6', name: 'Mini Crossbody Bag', price: 2900, audience: 'women', category: 'Accessories', art: 'bag',
    sizes: [], colours: [c('Black', '#1f1f22'), c('Tan', '#b27d4c')],
    description: 'Just big enough for your phone, cards and keys. Adjustable strap.', tags: ['new'],
  },
  // ---- Unisex ----
  {
    id: 'ms-u1', name: 'Oversized Hoodie', price: 3800, audience: 'unisex', category: 'Hoodies', art: 'hoodie',
    sizes: clothingWide, colours: [c('Charcoal', '#3a3d42'), c('Cream', '#eadfc8'), c('Forest', '#2f5a3f')],
    description: 'A roomy, brushed-back fleece hoodie with a double-layer hood. The streetwear staple.', tags: ['featured'],
  },
  {
    id: 'ms-u2', name: 'Street Cargo Pants', price: 3400, audience: 'unisex', category: 'Cargo Pants', art: 'pants',
    sizes: clothing, colours: [c('Khaki', '#a89b72'), c('Black', '#1f1f22'), c('Olive', '#6b7048')],
    description: 'Relaxed cargo pants with deep pockets and an adjustable hem.', tags: [],
  },
  {
    id: 'ms-u3', name: 'Court Sneakers', price: 5900, audience: 'unisex', category: 'Footwear', art: 'sneaker',
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'], colours: [c('White', '#f4f4f1'), c('Black', '#1f1f22'), c('Cream', '#eadfc8')],
    description: 'Clean leather court sneakers with a cushioned insole. Goes with absolutely everything.', tags: ['featured'],
  },
  {
    id: 'ms-u4', name: 'Tracksuit Set', price: 5500, audience: 'unisex', category: 'Tracksuits', art: 'hoodie',
    sizes: clothing, colours: [c('Grey', '#8b8d92'), c('Black', '#1f1f22')],
    description: 'A matching zip jacket and joggers in soft jersey. Sold as a set.', tags: ['new'],
  },
  {
    id: 'ms-u5', name: 'Canvas Tote Bag', price: 1800, audience: 'unisex', category: 'Accessories', art: 'bag',
    sizes: [], colours: [c('Natural', '#e3d8bd'), c('Black', '#1f1f22')],
    description: 'Sturdy cotton canvas with an inner pocket. Carries a laptop, a lunch and a little extra.', tags: [],
  },
  {
    id: 'ms-u6', name: 'Everyday Cap', price: 900, audience: 'unisex', category: 'Accessories', art: 'cap',
    sizes: [], colours: [c('Black', '#1f1f22'), c('Navy', '#26364f'), c('Sand', '#d8c7a4')],
    description: 'A six-panel cap with an adjustable strap. One size fits most.', tags: [],
  },
]

export function categoriesFor(products: DemoProduct[]): string[] {
  const counts = new Map<string, number>()
  for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([cat]) => cat)
}
