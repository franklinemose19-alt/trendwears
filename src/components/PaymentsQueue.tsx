import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { fetchPaymentsForReview, verifyPayment, rejectPayment } from '@/services/payments'
import { usePlans } from '@/hooks/usePlans'
import { PAYMENT_STATUS_LABEL } from '@/utils/payments'
import type { PaymentWithBusiness } from '@/types'

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

function PendingRow({ payment, planName, onDone }: { payment: PaymentWithBusiness; planName: string; onDone: () => Promise<void> }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)

  // The amount is typed in on purpose: it must come from the M-Pesa statement, not from this screen.
  const received = /^\d+$/.test(amount.trim()) ? Number(amount.trim()) : null
  const store = payment.businesses?.name ?? 'this store'

  async function handleVerify() {
    if (received === null || busy || inFlight.current) return
    const ok = confirm(
      'Activate ' + planName + ' for ' + store + '?\n\nYou are confirming that KSh ' + received.toLocaleString() +
      ' was received with M-Pesa code ' + payment.reference + '.'
    )
    if (!ok) return
    inFlight.current = true
    setBusy(true)
    setError('')
    try {
      await verifyPayment(payment.id, received)
      await onDone()
    } catch (err: any) {
      setError(err?.message ?? 'Could not verify this payment.')
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  async function handleReject() {
    if (busy || inFlight.current) return
    if (!confirm('Reject this payment? ' + store + ' will see that it could not be confirmed.')) return
    inFlight.current = true
    setBusy(true)
    setError('')
    try {
      await rejectPayment(payment.id, note.trim())
      await onDone()
    } catch (err: any) {
      setError(err?.message ?? 'Could not reject this payment.')
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  return (
    <li className="rounded-xl border border-white/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">
            {payment.businesses ? (
              <a href={'/store/' + payment.businesses.slug} target="_blank" rel="noreferrer" className="underline hover:text-white">{store}</a>
            ) : store}
          </p>
          <p className="mt-0.5 text-xs text-white/50">
            {planName} - expected KSh {payment.expected_amount.toLocaleString()} - sent {when(payment.submitted_at)}
          </p>
        </div>
        <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-sm" aria-label={'M-Pesa code ' + payment.reference}>
          {payment.reference}
        </span>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor={'amt-' + payment.id} className="mb-1 block text-xs text-white/60">Amount received per the till statement (KSh)</label>
          <input
            id={'amt-' + payment.id}
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={'Type the amount, e.g. ' + payment.expected_amount}
            className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40"
          />
        </div>
        <div>
          <label htmlFor={'note-' + payment.id} className="mb-1 block text-xs text-white/60">Reason, if rejecting (optional)</label>
          <input
            id={'note-' + payment.id}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Code not found in the statement"
            className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleVerify}
          disabled={received === null || busy}
          className="rounded-lg bg-green-500/15 px-4 py-2 text-xs text-green-400 hover:bg-green-500/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Verify and activate
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={busy}
          className="rounded-lg bg-red-500/15 px-4 py-2 text-xs text-red-400 hover:bg-red-500/25 disabled:opacity-40"
        >
          Reject
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
    </li>
  )
}

export default function PaymentsQueue({ onChanged }: { onChanged: () => void }) {
  const { byId } = usePlans()
  const [payments, setPayments] = useState<PaymentWithBusiness[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      setPayments(await fetchPaymentsForReview())
      setLoadError('')
    } catch (err: any) {
      setLoadError(err?.message ?? 'Could not load payments.')
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function afterAction() {
    await load()
    onChanged()
  }

  const pending = (payments ?? []).filter((p) => p.status === 'pending')
  const reviewed = (payments ?? []).filter((p) => p.status !== 'pending').slice(0, 8)

  return (
    <section aria-labelledby="queue-heading" className="mt-8 rounded-2xl border border-white/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="queue-heading" className="text-sm font-medium">
          Payments to check {payments && <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs">{pending.length}</span>}
        </h2>
        <button type="button" onClick={load} disabled={refreshing} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 hover:text-white disabled:opacity-50">
          <RefreshCw size={12} aria-hidden="true" className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>
      <p className="mt-1 text-xs text-white/50">
        Check each code against the M-Pesa till statement, type the amount you see, then verify. Nothing is activated until you do.
      </p>

      {loadError && <p role="alert" className="mt-3 text-sm text-red-400">{loadError}</p>}
      {payments === null && !loadError && <p className="mt-3 text-sm text-white/50">Loading...</p>}
      {payments !== null && pending.length === 0 && <p className="mt-3 text-sm text-white/50">No payments are waiting to be checked.</p>}

      {pending.length > 0 && (
        <ul className="mt-4 space-y-3">
          {pending.map((p) => (
            <PendingRow key={p.id} payment={p} planName={byId(p.plan).name} onDone={afterAction} />
          ))}
        </ul>
      )}

      {reviewed.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-medium uppercase tracking-wide text-white/40">Recently reviewed</h3>
          <ul className="mt-2 space-y-1.5 text-xs text-white/60">
            {reviewed.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
                <span>{p.businesses?.name ?? 'Store'} - {byId(p.plan).name} - KSh {p.expected_amount.toLocaleString()} - <span className="font-mono">{p.reference}</span></span>
                <span>{PAYMENT_STATUS_LABEL[p.status]}{p.reviewed_at ? ' ' + when(p.reviewed_at) : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
