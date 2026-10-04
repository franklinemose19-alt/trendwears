import { useEffect, useMemo, useState } from 'react'
import { Search, ExternalLink } from 'lucide-react'
import { fetchAllBusinesses, updateBusinessStatus, updateBusinessPlan } from '@/services/businesses'
import type { Business, BusinessStatus, Plan } from '@/types'

const statusStyles: Record<BusinessStatus, string> = {
  active: 'bg-green-500/15 text-green-400',
  suspended: 'bg-red-500/15 text-red-400',
  pending: 'bg-yellow-500/15 text-yellow-400',
}

export default function BusinessList() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    const data = await fetchAllBusinesses()
    setBusinesses(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return businesses
    const q = search.toLowerCase()
    return businesses.filter((b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q))
  }, [businesses, search])

  async function handleStatusChange(business: Business, status: BusinessStatus) {
    await updateBusinessStatus(business.id, status)
    load()
  }

  async function handlePlanChange(business: Business, plan: Plan) {
    await updateBusinessPlan(business.id, plan)
    load()
  }

  return (
    <div>
      <h1 className="font-display text-2xl">Businesses</h1>
      <p className="mt-1 text-sm text-white/50">{businesses.length} total on the platform.</p>

      <div className="mt-6 flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 md:w-80">
        <Search size={16} className="text-white/50" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or slug"
          className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
        />
      </div>

      {loading ? (
        <p className="mt-8 text-white/50">Loading...</p>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="rounded-xl border border-white/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {b.logo_url ? (
                    <img src={b.logo_url} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-white/10" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{b.name}</p>
                    <p className="text-xs text-white/40">/{b.slug}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={'rounded-full px-3 py-1 text-xs capitalize ' + statusStyles[b.status]}>
                    {b.status}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-white/70">
                    {b.plan}
                  </span>
                  <span className={'rounded-full px-3 py-1 text-xs ' + (b.subscription_status === 'paid' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')}>
                    {b.subscription_status}
                  </span>
                  <a
                    href={'/store/' + b.slug}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 hover:text-white"
                  >
                    <ExternalLink size={12} /> View store
                  </a>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
                <select
                  value={b.plan}
                  onChange={(e) => handlePlanChange(b, e.target.value as Plan)}
                  className="rounded-lg border border-white/15 bg-transparent px-3 py-1.5 text-xs"
                >
                  <option value="basic">Basic</option>
                  <option value="popular">Popular</option>
                  <option value="pro">Pro</option>
                </select>

                {b.status !== 'active' && (
                  <button
                    onClick={() => handleStatusChange(b, 'active')}
                    className="rounded-lg bg-green-500/15 px-3 py-1.5 text-xs text-green-400 hover:bg-green-500/25"
                  >
                    Activate
                  </button>
                )}
                {b.status !== 'suspended' && (
                  <button
                    onClick={() => handleStatusChange(b, 'suspended')}
                    className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/25"
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && <p className="text-white/50">No businesses match your search.</p>}
        </div>
      )}
    </div>
  )
}
