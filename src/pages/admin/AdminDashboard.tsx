import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Package, Share2, ChevronRight } from 'lucide-react'
import { fetchOverviewStats } from '@/services/admin'
import { fetchImageUsage } from '@/services/plans'
import { fetchRecentEnquiries } from '@/services/insights'
import type { Enquiry } from '@/services/insights'
import { useAdmin } from '@/hooks/useAdmin'
import { usePlans } from '@/hooks/usePlans'
import { useServerNow } from '@/hooks/useServerNow'
import { buildNotices, storeVisibility } from '@/utils/adminStatus'
import { timeAgo } from '@/utils/timeAgo'
import SubscriptionSummary from '@/components/SubscriptionSummary'
import type { OverviewStats } from '@/types'

const toneClass = { alert: 'text-red-300', warn: 'text-yellow-200', info: 'text-white/70' } as const

export default function AdminDashboard() {
  const { business, payments, loading, reload, setBusiness } = useAdmin()
  const { byId } = usePlans()
  const now = useServerNow()
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [usedImages, setUsedImages] = useState<number | null>(null)
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null)
  const [shareNote, setShareNote] = useState('')

  useEffect(() => {
    if (!business) return
    fetchOverviewStats(business.id).then(setStats).catch(() => setStats(null))
    fetchImageUsage(business.id).then(setUsedImages).catch(() => setUsedImages(null))
    fetchRecentEnquiries(business.id, 5).then(setEnquiries).catch(() => setEnquiries([]))
  }, [business?.id])

  if (loading) return <p className="text-white/50">Loading...</p>
  if (!business) return <p className="text-white/50">We could not load your store. Please refresh the page.</p>

  const visibility = storeVisibility(business, now)
  const notices = buildNotices({ business, payments, now, usedImages, imageLimit: byId(business.plan).max_images })

  async function handleShare() {
    const url = window.location.origin + '/store/' + business!.slug
    try {
      if (navigator.share) {
        await navigator.share({ title: business!.name, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareNote('Link copied')
    } catch {
      setShareNote('Copy this link: ' + url)
    }
  }

  const statItems: [string, number | string][] = [
    ['Products', stats?.totalProducts ?? '-'],
    ['Product views', stats?.totalViews ?? '-'],
    ['Likes', stats?.totalLikes ?? '-'],
    ['WhatsApp enquiries', stats?.whatsappEnquiries ?? '-'],
  ]

  const action = 'inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-medium'

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-white/50">Welcome back</p>
        <h1 className="mt-1 font-display text-2xl md:text-3xl">{business.name}</h1>
        <p className="mt-2 text-sm text-white/50">
          <span className={visibility.live ? 'text-green-400' : 'text-red-400'}>{visibility.label}</span> - {visibility.detail}
        </p>
      </div>

      <section aria-label="Store statistics">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10 md:grid-cols-4">
          {statItems.map(([label, value]) => (
            <div key={label} className="bg-[#0f0f10] p-4">
              <dt className="text-xs text-white/45">{label}</dt>
              <dd className="mt-1 text-xl font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-[11px] text-white/35">Counts come from real activity on your store. Store visits and order totals are not tracked yet.</p>
      </section>

      <section aria-label="Quick actions" className="flex flex-wrap items-center gap-3">
        <Link to="/admin/products" className={action + ' bg-white text-black'}>
          <Plus size={16} aria-hidden="true" /> Add Product
        </Link>
        <Link to="/admin/products" className={action + ' border border-white/25 text-white/90 hover:border-white/50'}>
          <Package size={16} aria-hidden="true" /> Manage Products
        </Link>
        <button type="button" onClick={handleShare} className={action + ' border border-white/25 text-white/90 hover:border-white/50'}>
          <Share2 size={16} aria-hidden="true" /> Share Store
        </button>
        {shareNote && <span role="status" className="text-xs text-white/60">{shareNote}</span>}
      </section>

      {notices.length > 0 && (
        <section aria-label="Notifications">
          <h2 className="text-xs font-medium uppercase tracking-wide text-white/40">Needs your attention</h2>
          <ul className="mt-2 divide-y divide-white/10 border-y border-white/10">
            {notices.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <p className={'min-w-0 flex-1 text-sm ' + toneClass[n.tone]}>{n.text}</p>
                {n.to && (
                  <Link to={n.to} className="inline-flex shrink-0 items-center gap-1 text-xs text-white/70 underline hover:text-white">
                    {n.cta} <ChevronRight size={12} aria-hidden="true" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Recent activity">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wide text-white/40">Recent activity</h2>
          <Link to="/admin/orders" className="text-xs text-white/60 underline hover:text-white">See all</Link>
        </div>
        {enquiries === null ? (
          <p className="mt-3 text-sm text-white/40">Loading...</p>
        ) : enquiries.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">
            No WhatsApp enquiries yet. They appear here when a customer taps Order on WhatsApp.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-white/10 border-y border-white/10">
            {enquiries.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0 truncate">
                  WhatsApp enquiry{e.product_name ? ' for ' + e.product_name : ''}
                </span>
                <span className="shrink-0 text-xs text-white/40">{timeAgo(e.created_at, now)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SubscriptionSummary
        business={business}
        onStarted={(updated) => {
          setBusiness(updated)
          reload()
        }}
      />
    </div>
  )
}
