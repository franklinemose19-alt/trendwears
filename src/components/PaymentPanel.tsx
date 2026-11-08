import { useRef, useState } from 'react'
import { CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react'
import { submitPaymentClaim } from '@/services/payments'
import { validateMpesaCode, cleanMpesaCode, PAYMENT_STATUS_LABEL } from '@/utils/payments'
import { MIRA_TILL_NUMBER } from '@/config'
import type { Business, PaymentRecord, PlanInfo } from '@/types'

interface Props {
  business: Business
  payments: PaymentRecord[]
  essential: PlanInfo
  signature: PlanInfo
  onChanged: () => Promise<void> | void
}

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
const day = (iso: string) =>
  new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })

function StatusBadge({ status }: { status: PaymentRecord['status'] }) {
  const style =
    status === 'verified' ? 'bg-green-500/15 text-green-400'
    : status === 'pending' ? 'bg-yellow-500/15 text-yellow-300'
    : 'bg-red-500/15 text-red-400'
  // The icon and the words carry the meaning, never the colour alone.
  const Icon = status === 'verified' ? CheckCircle2 : status === 'pending' ? Clock : XCircle
  return (
    <span className={'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ' + style}>
      <Icon size={12} aria-hidden="true" />
      {PAYMENT_STATUS_LABEL[status]}
    </span>
  )
}

export default function PaymentPanel({ business, payments, essential, signature, onChanged }: Props) {
  const [plan, setPlan] = useState<'basic' | 'popular'>(business.plan === 'popular' ? 'popular' : 'basic')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const inFlight = useRef(false)

  const choices = [essential, signature].filter((p) => p.monthly_price != null)
  const chosen = plan === 'popular' ? signature : essential
  const pending = payments.filter((p) => p.status === 'pending')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (busy || inFlight.current) return
    setNotice('')
    const problem = validateMpesaCode(code)
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    inFlight.current = true
    setBusy(true)
    try {
      const sent = cleanMpesaCode(code)
      await submitPaymentClaim(plan, sent)
      setCode('')
      setNotice('Thank you. MIRA will check code ' + sent + '. Your plan does not change until the payment is confirmed.')
      await onChanged()
    } catch (err: any) {
      setError(err?.message ?? 'Could not send your payment. Please try again.')
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await onChanged()
    } finally {
      setRefreshing(false)
    }
  }

  // Founding ambassadors have complimentary Essential access: there is nothing to pay.
  if (business.founding_ambassador || choices.length === 0) return null

  return (
    <section id="payments" aria-labelledby="payments-heading" className="mt-6 rounded-2xl border border-white/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="payments-heading" className="text-sm font-medium">Confirm your payment</h2>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={12} aria-hidden="true" className={refreshing ? 'animate-spin' : ''} />
          Refresh status
        </button>
      </div>
      <p className="mt-1 text-xs text-white/50">
        Paid already? Enter your M-Pesa code so MIRA can check it. Nothing is charged automatically.
      </p>

      {pending.length > 0 && (
        <p role="status" className="mt-3 rounded-lg bg-yellow-500/10 px-3 py-2 text-sm text-yellow-300">
          {pending.length === 1 ? '1 payment is' : pending.length + ' payments are'} waiting to be checked by MIRA.
          Your plan does not change until it is confirmed.
        </p>
      )}

      <div role="group" aria-label="Package" className="mt-4 grid gap-2 sm:grid-cols-2">
        {choices.map((p) => {
          const id = p.id === 'popular' ? 'popular' : 'basic'
          const selected = plan === id
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setPlan(id)}
              className={'rounded-xl border px-4 py-3 text-left text-sm ' + (selected ? 'border-white bg-white/10' : 'border-white/15 hover:border-white/40')}
            >
              <span className="block font-medium">{p.name}</span>
              <span className="block text-white/60">KSh {(p.monthly_price as number).toLocaleString()}/month</span>
            </button>
          )
        })}
      </div>

      <ol className="mt-4 space-y-1.5 text-sm text-white/70">
        <li>
          1. Pay <span className="font-medium text-white">KSh {(chosen.monthly_price as number).toLocaleString()}</span> to Till{' '}
          <span className="font-medium text-white">{MIRA_TILL_NUMBER}</span> (Lipa na M-Pesa, then Buy Goods and Services).
        </li>
        <li>2. Enter the confirmation code from the M-Pesa message below.</li>
        <li>3. MIRA checks the payment. Your plan switches on only after it is confirmed.</li>
      </ol>

      <form onSubmit={handleSubmit} className="mt-4" noValidate>
        <label htmlFor="mpesa-code" className="mb-1 block text-sm text-white/60">M-Pesa confirmation code</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="mpesa-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. QGH7X8Y9Z1"
            autoComplete="off"
            autoCapitalize="characters"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'mpesa-code-error' : undefined}
            className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm uppercase outline-none focus:border-white/40"
          />
          <button
            type="submit"
            disabled={busy}
            className="shrink-0 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-60"
          >
            {busy ? 'Sending...' : 'Submit payment for checking'}
          </button>
        </div>
        {error && <p id="mpesa-code-error" role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
        {notice && <p role="status" className="mt-2 text-sm text-green-400">{notice}</p>}
      </form>

      <div className="mt-6">
        <h3 className="text-xs font-medium uppercase tracking-wide text-white/40">Your payments</h3>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-white/40">No payments submitted yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {payments.map((p) => (
              <li key={p.id} className="rounded-xl border border-white/10 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">
                    {(p.plan === 'popular' ? signature : essential).name} - KSh {p.expected_amount.toLocaleString()}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-1 text-xs text-white/50">
                  Code <span className="font-mono text-white/70">{p.reference}</span> - sent {when(p.submitted_at)}
                </p>
                {p.status === 'verified' && p.period_end && (
                  <p className="mt-1 text-xs text-green-400">Covers your store until {day(p.period_end)}.</p>
                )}
                {p.status === 'rejected' && (
                  <p className="mt-1 text-xs text-red-300">
                    MIRA could not confirm this payment{p.review_note ? ': ' + p.review_note : '.'} You can send the code
                    again, or chat with MIRA support.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
