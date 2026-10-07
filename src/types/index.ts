export type ProductStatus = 'available' | 'sold' | 'draft'
export type BusinessStatus = 'active' | 'suspended' | 'pending'
export type Plan = 'basic' | 'popular' | 'pro'
export type FeatureName = 'cart' | 'favorites' | 'customer_accounts' | 'notifications' | 'promotions' | 'analytics' | 'advanced_customization' | 'flash_sales' | 'in_app_payment'

export interface Business {
  id: string
  slug: string
  name: string
  logo_url: string | null
  banner_url: string | null
  description: string | null
  location: string | null
  whatsapp_number: string | null
  opening_hours: string | null
  plan: Plan
  status: BusinessStatus
  owner_user_id: string | null
  subscription_status: 'unpaid' | 'paid'
  next_billing_date: string | null
  instagram_url: string | null
  tiktok_url: string | null
  facebook_url: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  business_id: string
  name: string
  price: number
  sale_price: number | null
  category: string
  size: string
  condition: string
  description: string | null
  images: string[]
  status: ProductStatus
  created_at: string
  updated_at: string
}

export interface ProductWithStats extends Product {
  view_count: number
  like_count: number
  whatsapp_click_count: number
  liked_by_visitor?: boolean
  saved_by_visitor?: boolean
}

export type SortOption = 'newest' | 'most_viewed' | 'most_liked' | 'price_low' | 'price_high'

export interface OverviewStats {
  totalProducts: number
  totalViews: number
  totalLikes: number
  whatsappEnquiries: number
  availableProducts: number
  soldProducts: number
}

export interface PlanFeatures {
  cart: boolean
  favorites: boolean
  customer_accounts: boolean
  notifications: boolean
  promotions: boolean
  analytics: boolean
  advanced_customization: boolean
  flash_sales: boolean
  in_app_payment: boolean
}
