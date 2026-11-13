import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProductsWithStats, sortProducts } from '@/services/products'
import { fetchViewsLast30Days } from '@/services/admin'
import { fetchMyBusiness, fetchPlanFeatures } from '@/services/businesses'
import { usePlans } from '@/hooks/usePlans'
import AnalyticsChart from '@/components/AnalyticsChart'
import type { ProductWithStats } from '@/types'

export default function AdminAnalytics() {
  const { byId } = usePlans()
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
        <h1 className="font-display text-xl">Store Insights is included in {byId('popular').name}</h1>
        <p className="mt-2 text-sm text-white/50">
          Upgrade to see how customers find and engage with your products.
        </p>
        <Link to="/admin/settings?tab=subscription" className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-white px-6 text-sm font-medium text-black">
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
      <h1 className="font-display text-2xl md:text-3xl">Store Insights</h1>
      <p className="mt-2 text-sm text-white/55">
        Real activity on your store over the last 30 days. These are product views: visits to your store as a whole are not tracked yet.
      </p>

      <div className="mt-6">
        <AnalyticsChart data={chartData} />
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <Ranking title="Most viewed" items={mostViewed.map((p) => ({ label: p.name, value: p.view_count + ' views' }))} />
        <Ranking title="Most liked" items={mostLiked.map((p) => ({ label: p.name, value: p.like_count + ' likes' }))} />
        <Ranking title="Most enquired" items={mostEnquired.map((p) => ({ label: p.name, value: p.whatsapp_click_count + ' enquiries' }))} />
      </div>
    </div>
  )
}

function Ranking({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <section>
      <h2 className="text-xs font-medium uppercase tracking-wide text-white/40">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-white/40">Nothing yet.</p>
      ) : (
        <ol className="mt-2 divide-y divide-white/10 border-y border-white/10 text-sm">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3 py-2.5">
              <span className="min-w-0 truncate">{item.label}</span>
              <span className="shrink-0 text-white/50">{item.value}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
