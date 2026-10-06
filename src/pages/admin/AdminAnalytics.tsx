import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProductsWithStats, sortProducts } from '@/services/products'
import { fetchViewsLast30Days } from '@/services/admin'
import { fetchMyBusiness, fetchPlanFeatures } from '@/services/businesses'
import AnalyticsChart from '@/components/AnalyticsChart'
import type { ProductWithStats } from '@/types'

export default function AdminAnalytics() {
  const [products, setProducts] = useState<ProductWithStats[]>([])
  const [chartData, setChartData] = useState<{ date: string; views: number }[]>([])
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    fetchMyBusiness().then(async (business) => {
      if (!business) return
      const features = await fetchPlanFeatures(business.plan)
      setAllowed(features.analytics)
      if (!features.analytics) return
      fetchProductsWithStats(business.id).then(setProducts)
      fetchViewsLast30Days(business.id).then(setChartData)
    })
  }, [])

  if (allowed === null) return <p className="text-white/50">Loading...</p>

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-white/10 p-8 text-center">
        <h1 className="font-display text-xl">Analytics is a Pro feature</h1>
        <p className="mt-2 text-sm text-white/50">Upgrade to the Pro plan to unlock sales and customer analytics.</p>
        <Link to="/admin/settings" className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black">
          View plan options
        </Link>
      </div>
    )
  }

  const mostViewed = sortProducts(products, 'most_viewed').slice(0, 5)
  const mostLiked = sortProducts(products, 'most_liked').slice(0, 5)
  const mostEnquired = [...products].sort((a, b) => b.whatsapp_click_count - a.whatsapp_click_count).slice(0, 5)

  return (
    <div>
      <h1 className="font-display text-2xl">Analytics</h1>

      <div className="mt-6">
        <AnalyticsChart data={chartData} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Ranking title="Most viewed" items={mostViewed.map((p) => ({ label: p.name, value: p.view_count + ' views' }))} />
        <Ranking title="Most liked" items={mostLiked.map((p) => ({ label: p.name, value: p.like_count + ' likes' }))} />
        <Ranking title="Most enquired" items={mostEnquired.map((p) => ({ label: p.name, value: p.whatsapp_click_count + ' clicks' }))} />
      </div>
    </div>
  )
}

function Ranking({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div className="rounded-2xl border border-white/10 p-5">
      <p className="mb-3 text-sm text-white/60">{title}</p>
      <ol className="space-y-2 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex justify-between">
            <span>{item.label}</span>
            <span className="text-white/50">{item.value}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
