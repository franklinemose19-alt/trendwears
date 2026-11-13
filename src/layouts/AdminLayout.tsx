import { useCallback, useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import AdminSidebar, { AdminBottomNav } from '@/components/AdminSidebar'
import { fetchMyBusiness, fetchPlanFeatures } from '@/services/businesses'
import { fetchMyPayments } from '@/services/payments'
import { syncTrialStatus } from '@/services/trial'
import { useServerNow } from '@/hooks/useServerNow'
import { storeVisibility } from '@/utils/adminStatus'
import type { AdminContextValue } from '@/hooks/useAdmin'
import type { Business, PaymentRecord, PlanFeatures } from '@/types'

export default function AdminLayout() {
  const now = useServerNow()
  const [business, setBusiness] = useState<Business | null>(null)
  const [features, setFeatures] = useState<PlanFeatures | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Loads the store, its plan features and its payments once, and again whenever something changes (a payment, a trial start).
  const reload = useCallback(async () => {
    try { await syncTrialStatus() } catch { /* the label is cosmetic: access follows the dates */ }
    const b = await fetchMyBusiness().catch(() => null)
    if (!b) {
      setLoading(false)
      return
    }
    setBusiness(b)
    fetchPlanFeatures(b.plan).then(setFeatures).catch(() => {})
    fetchMyPayments(b.id).then(setPayments).catch(() => setPayments([]))
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  const name = business?.name ?? 'My store'
  const visibility = business ? storeVisibility(business, now) : null
  const context: AdminContextValue = { business, features, payments, loading, reload, setBusiness }

  return (
    <div className="flex min-h-screen bg-[#0f0f10] text-[#e8e8e6]">
      <AdminSidebar business={business} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0f0f10]/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate font-display text-base md:hidden">{name}</span>
            {visibility && (
              <span
                className={
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ' +
                  (visibility.live ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')
                }
              >
                <span aria-hidden="true" className={'h-1.5 w-1.5 rounded-full ' + (visibility.live ? 'bg-green-400' : 'bg-red-400')} />
                {visibility.label}
              </span>
            )}
            {visibility && <span className="hidden truncate text-xs text-white/40 lg:inline">{visibility.detail}</span>}
          </div>
          {business && (
            <Link
              to={'/store/' + business.slug}
              className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border border-white/20 px-4 text-xs text-white/80 hover:border-white/50 hover:text-white"
            >
              View My Store <ExternalLink size={12} aria-hidden="true" />
            </Link>
          )}
        </header>

        <main className="mx-auto w-full max-w-5xl min-w-0 flex-1 overflow-x-hidden px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">
          <Outlet context={context} />
        </main>
      </div>

      <AdminBottomNav />
    </div>
  )
}
