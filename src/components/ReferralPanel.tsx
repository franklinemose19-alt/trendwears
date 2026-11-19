import { useEffect, useState } from 'react'
import { Check, Copy, MessageCircle, Share2, Sparkles } from 'lucide-react'
import { fetchMyReferrals } from '@/services/referrals'
import type { ReferralSummary } from '@/services/referrals'
import { referralLink, referralShareMessage, referralStageLabel } from '@/utils/referral'
import { formatTrialDate } from '@/utils/trial'

const btn = 'inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 px-5 text-sm text-white/90 hover:border-white/50'

// Refer & Earn: a personal link, and a real count of how many referred boutiques have actually become paying stores.
export default function ReferralPanel({ storeName }: { storeName: string }) {
  const [summary, setSummary] = useState<ReferralSummary | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [note, setNote] = useState('')

  useEffect(() => {
    fetchMyReferrals()
      .then((s) => { setSummary(s); setState('ready') })
      .catch(() => setState('error'))
  }, [])

  if (state === 'loading') return <p className="text-sm text-white/40">Loading your referral details...</p>
  if (state === 'error' || !summary) {
    return <p role="alert" className="text-sm text-red-300">We could not load your referral details right now. Please try again later.</p>
  }

  const link = referralLink(summary.code)
  const message = referralShareMessage(storeName, link)
  const whatsapp = 'https://wa.me/?text=' + encodeURIComponent(message)
  const partner = summary.partner

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setNote('Link copied')
    } catch {
      setNote('Copy this link: ' + link)
    }
  }

  async function share() {
    try {
      await navigator.share({ title: 'MIRA', text: message, url: link })
    } catch { /* the person closed the share sheet */ }
  }

  const stats: [string, number][] = [
    ['Signed up', summary.signed_up],
    ['Store set up', summary.set_up],
    ['Published', summary.published],
    ['Active paying', summary.active_paying],
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] text-white/50">
          <Sparkles size={12} aria-hidden="true" /> COMING SOON - MIRA MARKETPLACE
        </p>
        <h3 className="mt-2 font-display text-xl">Refer &amp; Earn a Top Spot!</h3>
        <p className="mt-1 max-w-xl text-sm text-white/60">
          Invite other boutique owners to join MIRA for a chance to qualify for a top spot on our upcoming marketplace.
        </p>
        <p className="mt-1 text-xs text-white/40">Marketplace launch details and placement criteria will be announced soon.</p>
      </div>

      <div>
        <label htmlFor="referral-link" className="mb-1 block text-xs text-white/50">Your personal referral link</label>
        <input
          id="referral-link"
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white/80"
        />
        <p className="mt-1 text-xs text-white/40">Your code: <span className="font-mono text-white/70">{summary.code}</span></p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={copy} className={btn}>
            <Copy size={16} aria-hidden="true" /> Copy link
          </button>
          <a href={whatsapp} target="_blank" rel="noreferrer" className={btn}>
            <MessageCircle size={16} aria-hidden="true" /> Share on WhatsApp
          </a>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button type="button" onClick={share} className={btn}>
              <Share2 size={16} aria-hidden="true" /> More ways to share
            </button>
          )}
          {note && <span role="status" className="text-xs text-white/60">{note}</span>}
        </div>
      </div>

      <section aria-label="Your referral numbers">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10 md:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="bg-[#0f0f10] p-4">
              <dt className="text-xs text-white/45">{label}</dt>
              <dd className="mt-1 text-xl font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-[11px] text-white/35">
          A referral counts as active only when the new boutique has signed up, set up its store, published it and become a
          paying subscriber. A free trial on its own does not count.
        </p>
      </section>

      {partner && (
        <section aria-label="Founding Partner target" className="rounded-xl border border-white/15 bg-white/5 p-4">
          <p className="text-sm font-medium">Founding Partner target</p>
          <p className="mt-1 text-sm text-white/70">
            {partner.active_paying_in_period} of {partner.target} active paying referrals in your 3 months
          </p>
          <div
            role="progressbar"
            aria-label="Founding Partner referral target"
            aria-valuemin={0}
            aria-valuemax={partner.target}
            aria-valuenow={Math.min(partner.active_paying_in_period, partner.target)}
            className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"
          >
            <div className="h-full rounded-full bg-white" style={{ width: Math.min(100, (partner.active_paying_in_period / partner.target) * 100) + '%' }} />
          </div>
          <p className="mt-2 text-xs text-white/40">
            Counted from {formatTrialDate(partner.since)} to {formatTrialDate(partner.ends_at)}. MIRA reviews this target; nothing changes automatically.
          </p>
        </section>
      )}

      <section aria-label="Boutiques you referred">
        <h4 className="text-xs font-medium uppercase tracking-wide text-white/40">Boutiques you referred</h4>
        {summary.referrals.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">No one has joined through your link yet. Share it with boutique owners you know.</p>
        ) : (
          <ul className="mt-2 divide-y divide-white/10 border-y border-white/10">
            {summary.referrals.map((r) => (
              <li key={r.name + r.joined_at} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="min-w-0 truncate">{r.name}</span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-white/60">
                  {r.set_up && r.published && r.paying && <Check size={12} aria-hidden="true" className="text-green-400" />}
                  {referralStageLabel(r)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
