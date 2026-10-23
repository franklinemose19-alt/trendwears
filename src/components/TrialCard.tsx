import { useState } from 'react'
import { Sparkles, Clock, AlertTriangle } from 'lucide-react'
import { startTrial } from '@/services/businesses'
import { getTrialState, trialReminder } from '@/utils/trial'
import { PREVIEW_TRIAL_DAYS } from '@/config'
import SubscriptionCountdown from '@/components/SubscriptionCountdown'
import PayInstructions from '@/components/PayInstructions'
import type { Business, PlanInfo } from '@/types'

interface Props {
  business: Business
  essential: PlanInfo
  signature: PlanInfo
  onStarted: (business: Business) => void
}

const dateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

function PlanChoices({ essential, signature }: { essential: PlanInfo; signature: PlanInfo }) {
  const plans = [essential, signature].filter((p) => p.monthly_price != null)
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {plans.map((p) => (
        <div
          key={p.id}
          className={'rounded-xl border p-4 ' + (p.id === 'popular' ? 'border-white/40 bg-white/5' : 'border-white/10')}
        >
          <p className="text-sm font-medium">
            {p.name}
            {p.id === 'popular' && (
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-black">Recommended</span>
            )}
          </p>
          <p className="mt-1 text-lg">
            KSh {(p.monthly_price as number).toLocaleString()}
            <span className="text-xs text-white/40">/month</span>
          </p>
          <p className="text-xs text-white/50">{p.max_images} active product images</p>
          <PayInstructions planName={p.name} amount={p.monthly_price as number} />
        </div>
      ))}
    </div>
  )
}

export default function TrialCard({ business, essential, signature, onStarted }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { state, msLeft } = getTrialState(business)

  async function handleStart() {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const updated = await startTrial()
      onStarted(updated)
    } catch (err: any) {
      setError(err?.message ?? 'Could not start your trial. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (state === 'none') return null

  if (state === 'eligible') {
    return (
      <div className="mt-6 rounded-2xl border border-white/25 bg-white/5 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles size={16} />
          <p className="text-sm font-medium">MIRA Preview</p>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">KSh 0 for {PREVIEW_TRIAL_DAYS} days</span>
        </div>
        <p className="mt-2 text-sm text-white/70">
          Try MIRA free for {PREVIEW_TRIAL_DAYS} days. Build your boutique, add your products and test how customers
          enquire on WhatsApp.
        </p>
        <p className="mt-2 text-xs text-white/50">
          The trial includes the {essential.name} features. When it ends you choose a plan, and nothing is charged
          automatically. There is one free trial per store and per WhatsApp number.
        </p>
        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
          className="mt-4 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-60"
        >
          {loading ? 'Starting...' : 'Start my ' + PREVIEW_TRIAL_DAYS + '-day free trial'}
        </button>
        {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
        <p className="mt-3 text-xs text-white/40">Prefer to pay now? Choose a plan below and send your M-Pesa confirmation.</p>
      </div>
    )
  }

  if (state === 'active') {
    const reminder = trialReminder(msLeft)
    return (
      <div className="mt-6 rounded-2xl border border-white/25 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <p className="text-sm font-medium">MIRA Preview trial</p>
            <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[11px] text-green-400">Active</span>
          </div>
          <SubscriptionCountdown nextBillingDate={business.trial_ends_at} />
        </div>
        <p className="mt-2 text-xs text-white/60">
          Started {dateOnly(business.trial_started_at as string)}. Ends {dateTime(business.trial_ends_at as string)}.
        </p>
        <p className="mt-2 text-xs text-white/50">
          Included: the {essential.name} features, with up to {essential.max_images} active product images and WhatsApp
          enquiries from customers.
        </p>
        {reminder && (
          <p role="status" className="mt-3 rounded-lg bg-yellow-500/10 px-3 py-2 text-sm text-yellow-300">{reminder}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a href="/#pricing" className="rounded-full border border-white/25 px-4 py-2 text-xs text-white/85 hover:border-white/50 hover:text-white">
            Compare packages
          </a>
        </div>
        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-white/60 hover:text-white">Ready to continue? See how to pay</summary>
          <PlanChoices essential={essential} signature={signature} />
          <p className="mt-3 text-xs text-white/40">
            Nothing is charged automatically. Your plan starts only after MIRA confirms your M-Pesa payment.
          </p>
        </details>
      </div>
    )
  }

  // expired
  return (
    <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/5 p-5">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="text-red-400" />
        <p className="text-sm font-medium">MIRA Preview trial ended</p>
      </div>
      <p className="mt-2 text-sm text-red-300">
        Your 7-day MIRA Preview trial has ended. Choose a plan to continue using your store.
      </p>
      <p className="mt-2 text-xs text-white/50">
        Your store, products, images and settings are saved. Nothing was charged. Your plan starts after MIRA confirms
        your M-Pesa payment, and your store goes back online without you rebuilding anything.
      </p>
      <PlanChoices essential={essential} signature={signature} />
    </div>
  )
}
