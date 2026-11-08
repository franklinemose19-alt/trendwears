import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, ExternalLink, Banknote, Star } from 'lucide-react'
import { fetchAllBusinesses, updateBusinessStatus, updateBusinessPlan } from '@/services/businesses'
import { recordPayment } from '@/services/payments'
import { syncTrialStatus, setFoundingAmbassador } from '@/services/trial'
import { getSubscriptionState } from '@/utils/subscription'
import { getTrialState, trialLengthDays, trialCountdownLabel, formatTrialDate } from '@/utils/trial'
import { validateMpesaCode, cleanMpesaCode } from '@/utils/payments'
import { usePlans } from '@/hooks/usePlans'
import { useServerNow } from '@/hooks/useServerNow'
import SubscriptionCountdown from '@/components/SubscriptionCountdown'
import PaymentsQueue from '@/components/PaymentsQueue'
import type { Business, BusinessStatus, Plan } from '@/types'

const FOUNDING_LIMIT = 3

const statusStyles: Record<BusinessStatus, string> = {
  active: 'bg-green-500/15 text-green-400',
  suspended: 'bg-red-500/15 text-red-400',
  pending: 'bg-yellow-500/15 text-yellow-400',
}

// A trial counts as "converted" when the merchant started one and is now on a paid plan.
const isConverted = (b: Business) => !!b.trial_started_at && b.subscription_status === 'paid'

function TrialDetails({ business, now }: { business: Business; now: number }) {
  if (business.founding_ambassador) {
    return (
      <p className="text-xs text-white/60">
        Founding ambassador: complimentary lifetime MIRA Essential
        {business.founding_ambassador_since ? ' since ' + new Date(business.founding_ambassador_since).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}.
        Not on the free trial.
      </p>
    )
  }
  if (!business.trial_started_at || !business.trial_ends_at) {
    return <p className="text-xs text-white/40">No free trial started.</p>
  }
  const { state, msLeft } = getTrialState(business, now)
  const length = trialLengthDays(business)
  const outcome = isConverted(business)
    ? 'Converted to a paid plan'
    : state === 'active' ? trialCountdownLabel(msLeft)
    : 'Trial expired - not converted'
  return (
    <dl className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
      <div><dt className="text-white/40">Trial length</dt><dd>{length} days</dd></div>
      <div><dt className="text-white/40">Started</dt><dd>{formatTrialDate(business.trial_started_at)}</dd></div>
      <div><dt className="text-white/40">Ends</dt><dd>{formatTrialDate(business.trial_ends_at)}</dd></div>
      <div><dt className="text-white/40">Outcome</dt><dd>{outcome}</dd></div>
    </dl>
  )
}

// For a payment MIRA received that the merchant never submitted: it is recorded and checked in one step.
function RecordPaymentForm({ business, onDone }: { business: Business; onDone: () => void }) {
  const { byId } = usePlans()
  const [plan, setPlan] = useState<'basic' | 'popular'>(business.plan === 'popular' ? 'popular' : 'basic')
  const [amount, setAmount] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (busy || inFlight.current) return
    const problem = validateMpesaCode(code)
    if (problem) return setError(problem)
    if (!/^\d+$/.test(amount.trim())) return setError('Type the amount received as a whole number, for example ' + (byId(plan).monthly_price ?? 0) + '.')
    const received = Number(amount.trim())
    if (!confirm('Record KSh ' + received.toLocaleString() + ' from ' + business.name + ' for ' + byId(plan).name + '?\n\nThis activates the plan for one month.')) return
    inFlight.current = true
    setBusy(true)
    setError('')
    try {
      await recordPayment(business.id, plan, received, cleanMpesaCode(code))
      onDone()
    } catch (err: any) {
      setError(err?.message ?? 'Could not record this payment.')
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  const input = 'w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-xs outline-none focus:border-white/40'
  return (
    <form onSubmit={handleSubmit} noValidate className="mt-3 grid gap-3 rounded-xl bg-white/[0.03] p-3 md:grid-cols-4">
      <div>
        <label htmlFor={'rp-plan-' + business.id} className="mb-1 block text-[11px] text-white/50">Package</label>
        <select id={'rp-plan-' + business.id} value={plan} onChange={(e) => setPlan(e.target.value as 'basic' | 'popular')} className={input}>
          <option value="basic">{byId('basic').name}</option>
          <option value="popular">{byId('popular').name}</option>
        </select>
      </div>
      <div>
        <label htmlFor={'rp-amt-' + business.id} className="mb-1 block text-[11px] text-white/50">Amount received (KSh)</label>
        <input id={'rp-amt-' + business.id} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="From the statement" className={input} />
      </div>
      <div>
        <label htmlFor={'rp-code-' + business.id} className="mb-1 block text-[11px] text-white/50">M-Pesa code</label>
        <input id={'rp-code-' + business.id} value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. QGH7X8Y9Z1" className={input + ' uppercase'} />
      </div>
      <div className="flex items-end">
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-green-500/15 px-3 py-2 text-xs text-green-400 hover:bg-green-500/25 disabled:opacity-50">
          {busy ? 'Recording...' : 'Record and activate'}
        </button>
      </div>
      {error && <p role="alert" className="text-xs text-red-400 md:col-span-4">{error}</p>}
    </form>
  )
}

export default function BusinessList() {
  const { byId } = usePlans()
  const now = useServerNow()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [recordingFor, setRecordingFor] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    // Let the server mark any overdue trials as "trial_expired" before the list is read.
    try { await syncTrialStatus() } catch { /* the label is cosmetic: access is decided by the dates */ }
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

  const summary = useMemo(() => {
    const trials = businesses.filter((b) => !b.founding_ambassador && b.trial_started_at)
    return {
      founding: businesses.filter((b) => b.founding_ambassador).length,
      active: trials.filter((b) => !isConverted(b) && getTrialState(b, now).state === 'active').length,
      expired: trials.filter((b) => !isConverted(b) && getTrialState(b, now).state === 'expired').length,
      converted: trials.filter(isConverted).length,
    }
  }, [businesses, now])

  async function handleStatusChange(business: Business, status: BusinessStatus) {
    try {
      await updateBusinessStatus(business.id, status)
      load()
    } catch (err: any) {
      alert('Could not change the status: ' + (err?.message ?? 'unknown error'))
    }
  }

  async function handlePlanChange(business: Business, plan: Plan) {
    try {
      await updateBusinessPlan(business.id, plan)
      load()
    } catch (err: any) {
      alert('Could not change the plan: ' + (err?.message ?? 'unknown error'))
    }
  }

  async function handleFounding(business: Business, value: boolean) {
    const message = value
      ? 'Make ' + business.name + ' one of the Founding 3?\n\nThey receive complimentary lifetime MIRA Essential access under their partnership agreement: no free trial and no payments. Only three stores can hold this status.'
      : 'Remove the Founding Ambassador status from ' + business.name + '?\n\nTheir store will need a subscription or trial to stay online. Their products and settings are kept.'
    if (!confirm(message)) return
    try {
      await setFoundingAmbassador(business.id, value)
      load()
    } catch (err: any) {
      alert(err?.message ?? 'Could not change the founding ambassador status.')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl">Businesses</h1>
      <p className="mt-1 text-sm text-white/50">{businesses.length} total on the platform.</p>

      <div role="group" aria-label="Free trial overview" className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 p-3"><p className="text-xs text-white/40">Founding ambassadors</p><p className="mt-1 text-lg">{summary.founding} of {FOUNDING_LIMIT}</p></div>
        <div className="rounded-xl border border-white/10 p-3"><p className="text-xs text-white/40">Free trials running</p><p className="mt-1 text-lg">{summary.active}</p></div>
        <div className="rounded-xl border border-white/10 p-3"><p className="text-xs text-white/40">Trials ended, not converted</p><p className="mt-1 text-lg">{summary.expired}</p></div>
        <div className="rounded-xl border border-white/10 p-3"><p className="text-xs text-white/40">Trials converted to paid</p><p className="mt-1 text-lg">{summary.converted}</p></div>
      </div>

      <PaymentsQueue onChanged={load} />

      <div className="mt-8 flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 md:w-80">
        <Search size={16} className="text-white/50" aria-hidden="true" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or slug"
          aria-label="Search businesses"
          className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
        />
      </div>

      {loading ? (
        <p className="mt-8 text-white/50">Loading...</p>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((b) => {
            const sub = getSubscriptionState(b, now)
            const trial = getTrialState(b, now).state
            const locked = b.status === 'active' && sub.state !== 'active'
            const statusLabel = b.founding_ambassador ? 'founding ambassador'
              : trial === 'active' ? 'free trial'
              : locked ? (trial === 'expired' ? 'trial ended' : 'locked - unpaid')
              : b.status
            const statusClass = b.founding_ambassador || trial === 'active' ? statusStyles.active : locked ? statusStyles.suspended : statusStyles[b.status]

            return (
              <div key={b.id} className="rounded-xl border border-white/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 font-display text-lg">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{b.name}</p>
                      <p className="text-xs text-white/40">/{b.slug}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {b.founding_ambassador && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
                        <Star size={11} aria-hidden="true" /> Founding Ambassador
                      </span>
                    )}
                    <span className={'rounded-full px-3 py-1 text-xs capitalize ' + statusClass}>
                      {statusLabel}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                      {!b.founding_ambassador && (trial === 'active' || trial === 'expired') ? 'MIRA Preview' : byId(b.plan).name}
                    </span>
                    <a
                      href={'/store/' + b.slug}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 hover:text-white"
                    >
                      <ExternalLink size={12} aria-hidden="true" /> View store
                    </a>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <SubscriptionCountdown nextBillingDate={b.next_billing_date} founding={b.founding_ambassador} />
                </div>
                <div className="mt-3 rounded-lg bg-white/[0.03] p-3">
                  <TrialDetails business={b} now={now} />
                </div>

                {b.plan === 'pro' && (
                  <p className="mt-3 text-xs text-yellow-400">
                    This store is on {byId('pro').name}, which is not available yet and gives no extra features. Move it to {byId('basic').name} or {byId('popular').name}.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
                  <select
                    value={b.plan}
                    onChange={(e) => handlePlanChange(b, e.target.value as Plan)}
                    aria-label={'Package for ' + b.name}
                    className="rounded-lg border border-white/15 bg-transparent px-3 py-1.5 text-xs"
                  >
                    <option value="basic">{byId('basic').name}</option>
                    <option value="popular">{byId('popular').name}</option>
                    {b.plan === 'pro' && <option value="pro" disabled>{byId('pro').name} (not available)</option>}
                  </select>

                  {!b.founding_ambassador && (
                    <button
                      type="button"
                      onClick={() => setRecordingFor(recordingFor === b.id ? null : b.id)}
                      aria-expanded={recordingFor === b.id}
                      className="flex items-center gap-1.5 rounded-lg bg-green-500/15 px-3 py-1.5 text-xs text-green-400 hover:bg-green-500/25"
                    >
                      <Banknote size={13} aria-hidden="true" />
                      Record a payment
                    </button>
                  )}

                  {b.founding_ambassador ? (
                    <button type="button" onClick={() => handleFounding(b, false)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:text-white">
                      Remove founding status
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleFounding(b, true)}
                      disabled={summary.founding >= FOUNDING_LIMIT}
                      title={summary.founding >= FOUNDING_LIMIT ? 'The Founding 3 are already assigned' : undefined}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Make Founding Ambassador
                    </button>
                  )}

                  {b.status !== 'active' && (
                    <button
                      onClick={() => handleStatusChange(b, 'active')}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
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

                {recordingFor === b.id && !b.founding_ambassador && (
                  <RecordPaymentForm business={b} onDone={() => { setRecordingFor(null); load() }} />
                )}
              </div>
            )
          })}

          {filtered.length === 0 && <p className="text-white/50">No businesses match your search.</p>}
        </div>
      )}
    </div>
  )
}
