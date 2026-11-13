import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchOverviewStats } from '@/services/admin'
import { fetchProductsWithStats } from '@/services/products'
import { fetchRecentEnquiries, fetchEnquiryCountSince } from '@/services/insights'
import type { Enquiry } from '@/services/insights'
import { useAdmin } from '@/hooks/useAdmin'
import { useServerNow } from '@/hooks/useServerNow'
import { timeAgo } from '@/utils/timeAgo'
import type { ProductWithStats } from '@/types'

const tabs = [
  { id: 'recent', label: 'Recent enquiries' },
  { id: 'products', label: 'By product' },
  { id: 'sold', label: 'Sold' },
] as const

type TabId = (typeof tabs)[number]['id']

// Customers order through WhatsApp, so MIRA tracks enquiries (taps on "Order on WhatsApp"), not orders.
export default function AdminOrders() {
  const { business, loading } = useAdmin()
  const now = useServerNow()
  const [tab, setTab] = useState<TabId>('recent')
  const [total, setTotal] = useState<number | null>(null)
  const [last30, setLast30] = useState<number | null>(null)
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null)
  const [products, setProducts] = useState<ProductWithStats[] | null>(null)

  useEffect(() => {
    if (!business) return
    fetchOverviewStats(business.id).then((s) => setTotal(s.whatsappEnquiries)).catch(() => setTotal(null))
    fetchEnquiryCountSince(business.id, 30).then(setLast30).catch(() => setLast30(null))
    fetchRecentEnquiries(business.id, 20).then(setEnquiries).catch(() => setEnquiries([]))
    fetchProductsWithStats(business.id).then(setProducts).catch(() => setProducts([]))
  }, [business?.id])

  if (loading) return <p className="text-white/50">Loading...</p>
  if (!business) return <p className="text-white/50">We could not load your store. Please refresh the page.</p>

  const byEnquiries = [...(products ?? [])].sort((a, b) => b.whatsapp_click_count - a.whatsapp_click_count)
  const sold = (products ?? []).filter((p) => p.status === 'sold')

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl">Orders</h1>
      <p className="mt-2 max-w-xl text-sm text-white/55">
        Customers order through WhatsApp. Every time someone taps Order on WhatsApp it is counted here as an enquiry. The
        order itself is agreed with the customer in WhatsApp, so MIRA does not track payments or order status.
      </p>

      <dl className="mt-5 grid max-w-md grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10">
        <div className="bg-[#0f0f10] p-4">
          <dt className="text-xs text-white/45">Enquiries, all time</dt>
          <dd className="mt-1 text-xl font-medium">{total ?? '-'}</dd>
        </div>
        <div className="bg-[#0f0f10] p-4">
          <dt className="text-xs text-white/45">Last 30 days</dt>
          <dd className="mt-1 text-xl font-medium">{last30 ?? '-'}</dd>
        </div>
      </dl>

      <div role="tablist" aria-label="Enquiry views" className="mt-6 flex gap-1 overflow-x-auto border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={'orders-tab-' + t.id}
            aria-selected={tab === t.id}
            aria-controls={'orders-panel-' + t.id}
            onClick={() => setTab(t.id)}
            className={'min-h-[44px] whitespace-nowrap border-b-2 px-4 text-sm ' + (tab === t.id ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={'orders-panel-' + tab} aria-labelledby={'orders-tab-' + tab} className="mt-4">
        {tab === 'recent' &&
          (enquiries === null ? (
            <p className="text-sm text-white/40">Loading...</p>
          ) : enquiries.length === 0 ? (
            <p className="text-sm text-white/40">No WhatsApp enquiries yet. Share your store to start receiving them.</p>
          ) : (
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {enquiries.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0 truncate">{e.product_name ?? 'A product'}</span>
                  <span className="shrink-0 text-xs text-white/40">{timeAgo(e.created_at, now)}</span>
                </li>
              ))}
            </ul>
          ))}

        {tab === 'products' &&
          (products === null ? (
            <p className="text-sm text-white/40">Loading...</p>
          ) : byEnquiries.length === 0 ? (
            <p className="text-sm text-white/40">You have not added any products yet.</p>
          ) : (
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {byEnquiries.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0 truncate">{p.name}</span>
                  <span className="shrink-0 text-xs text-white/50">
                    {p.whatsapp_click_count} {p.whatsapp_click_count === 1 ? 'enquiry' : 'enquiries'}
                  </span>
                </li>
              ))}
            </ul>
          ))}

        {tab === 'sold' &&
          (products === null ? (
            <p className="text-sm text-white/40">Loading...</p>
          ) : sold.length === 0 ? (
            <p className="text-sm text-white/40">
              Nothing is marked as sold yet. When an item sells, mark it as Sold in{' '}
              <Link to="/admin/products" className="underline hover:text-white">My Products</Link>.
            </p>
          ) : (
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {sold.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0 truncate">{p.name}</span>
                  <span className="shrink-0 text-xs text-white/50">KSh {p.price.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </div>
  )
}
