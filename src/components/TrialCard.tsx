import { useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { startTrial } from '@/services/businesses'
import { useServerNow } from '@/hooks/useServerNow'
import { PREVIEW_TRIAL_DAYS } from '@/config'
import { getTrialState, trialLengthDays, trialCountdownLabel, trialReminder, formatTrialDate } from '@/utils/trial'
import type { Business, PlanInfo } from '@/types'

interface Props {
  business: Business
  essential: PlanInfo
  signature: PlanInfo
  onStarted: (business: Business) => void
}

function PlanBoxes({ essential, signature }: { essential: PlanInfo; signature: PlanInfo }) {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      <div className="rounded-xl border border-white/15 p-3 text-sm">
        <p className="font-medium">{essential.name}</p>
        <p className="text-white/60">KSh {(essential.monthly_price ?? 0).toLocaleString()}/month</p>
      </div>
      <div className="rounded-xl border-2 border-white p-3 text-sm">
        <p className="font-medium">
          {signature.name} <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-[10px] text-black">Recommended</span>
        </p>
        <p className="text-white/60">KSh {(signature.monthly_price ?? 0).toLocaleString()}/month</p>
      </div>
    </div>
  )
}

export default function TrialCard({ business, essential, signature, onStarted }: Props) {
  const now = useServerNow()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)

  // Founding ambassadors are never on the promotional trial.
  if (business.founding_ambassador) {
    return (
      <section aria-label="Founding ambassador" className="mt-6 rounded-2xl border border-white/20 bg-white/5 p-5">
        <p className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] text-white/60">
          <Sparkles size={12} aria-hidden="true" /> MIRA FOUNDING AMBASSADOR
        </p>
        <h2 className="mt-2 font-display text-xl">Complimentary lifetime MIRA Essential</h2>
        <p className="mt-1 text-sm text-white/60">
          Your boutique is one of the MIRA Founding 3 ambassadors. Your Essential access is part of your partnership agreement,
          so there is no free trial to track and no payment to make.
        </p>
      </section>
    )
  }

  const { state, msLeft } = getTrialState(business, now)
  const length = trialLengthDays(business)

  async function handleStart() {
    if (busy || inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError('')
    try {
      onStarted(await startTrial())
    } catch (err: any) {
      setError(err?.message ?? 'Could not start your free trial. Please try again.')
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  if (state === 'eligible') {
    return (
      <section aria-label="Free trial" className="mt-6 rounded-2xl border border-white/20 bg-white/5 p-5">
        <p className="text-[11px] tracking-[0.2em] text-white/50">{PREVIEW_TRIAL_DAYS} DAYS FREE</p>
        <h2 className="mt-1 font-display text-xl">Start your free trial</h2>
        <p className="mt-1 text-sm text-white/60">
          Try MIRA Essential free for {PREVIEW_TRIAL_DAYS} days. No payment details required, nothing is charged automatically,
          and you can upgrade at any time.
        </p>
        <button
          type="button"
          onClick={handleStart}
          disabled={busy}
          className="mt-4 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-60"
        >
          {busy ? 'Starting...' : 'Start my ' + PREVIEW_TRIAL_DAYS + '-day free trial'}
        </button>
        {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      </section>
    )
  }

  if (state === 'active' && business.trial_started_at && business.trial_ends_at) {
    const reminder = trialReminder(msLeft, business.trial_ends_at)
    return (
      <section aria-label="Free trial status" className="mt-6 rounded-2xl border border-white/20 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] tracking-[0.2em] text-white/50">MIRA PREVIEW - FREE TRIAL</p>
          <span className="rounded-full bg-green-500/15 px-3 py-0.5 text-xs text-green-400">Active</span>
        </div>
        <p className="mt-2 font-display text-3xl" aria-live="polite">{trialCountdownLabel(msLeft)}</p>
        <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-white/40">Started</dt>
            <dd>{formatTrialDate(business.trial_started_at)}</dd>
          </div>
          <div>
            <dt className="text-white/40">Ends</dt>
            <dd>{formatTrialDate(business.trial_ends_at)}</dd>
          </div>
        </dl>

        {reminder && <p role="status" className="mt-4 rounded-lg bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">{reminder}</p>}

        <p className="mt-4 text-sm text-white/60">
          During your trial you have MIRA Essential: your branded store, up to {essential.max_images} product images and WhatsApp
          ordering. No automatic charges. Upgrade whenever you like and your remaining free days are kept.
        </p>
        <PlanBoxes essential={essential} signature={signature} />
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="#payments" className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black">Upgrade now</a>
          <a href="/#pricing" className="rounded-full border border-white/25 px-6 py-2.5 text-sm text-white/80 hover:border-white/50">Compare plans</a>
        </div>
      </section>
    )
  }

  if (state === 'expired') {
    return (
      <section aria-label="Free trial ended" className="mt-6 rounded-2xl border border-white/20 bg-white/5 p-5">
        <p className="text-[11px] tracking-[0.2em] text-white/50">TRIAL EXPIRED</p>
        <h2 className="mt-1 font-display text-xl">
          {length ? 'Your ' + length + '-day MIRA free trial has ended.' : 'Your MIRA free trial has ended.'} Choose a plan to continue using your store.
        </h2>
        <p className="mt-1 text-sm text-white/60">
          Your products, images, branding and settings are saved. Subscribe to bring your store back online. Nothing is charged automatically.
        </p>
        <PlanBoxes essential={essential} signature={signature} />
        <a href="#payments" className="mt-4 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black">Choose a plan</a>
      </section>
    )
  }

  return null
}
