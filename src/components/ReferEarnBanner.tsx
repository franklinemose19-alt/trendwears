import { useState } from 'react'
import { Sparkles, Share2, Copy, Check, MessageCircle, X } from 'lucide-react'

type Variant = 'landing' | 'dashboard'

const BADGE = 'COMING SOON \u2014 MIRA MARKETPLACE'

const COPY: Record<Variant, { headline: string; description: string; button: string; note?: string }> = {
  landing: {
    headline: 'Your Boutique Deserves the Spotlight.',
    description:
      'Know another boutique owner who wants to grow online? Refer them to MIRA and get a chance to earn a top spot on our upcoming marketplace. Grow with MIRA and put your boutique in the spotlight.',
    button: 'Refer & Earn',
    note: 'Marketplace launch and placement criteria will be announced soon.',
  },
  dashboard: {
    headline: 'Refer & Earn a Top Spot!',
    description:
      'Refer other boutique owners to MIRA for a chance to qualify for a top spot on our upcoming marketplace.',
    button: 'Refer a Boutique',
  },
}

export default function ReferEarnBanner({ variant }: { variant: Variant }) {
  const copy = COPY[variant]
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // MIRA's real public address (whatever domain the site is served from).
  const url = typeof window !== 'undefined' ? window.location.origin + '/' : ''
  const message = 'I put my boutique online with MIRA and take orders on WhatsApp. Have a look: ' + url
  const panelId = 'refer-panel-' + variant

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy the MIRA link:', url)
    }
  }

  return (
    <div
      role="region"
      aria-label="Refer and earn"
      className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-transparent p-6 text-left md:p-10"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium tracking-wide text-white/80">
            <Sparkles size={12} />
            {BADGE}
          </span>
          <h2 className="mt-4 font-display text-2xl leading-tight md:text-3xl">{copy.headline}</h2>
          <p className="mt-3 text-sm text-white/65 md:text-base">{copy.description}</p>
          {copy.note && <p className="mt-3 text-xs text-white/45">{copy.note}</p>}
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.02] md:w-auto"
          >
            <Share2 size={16} />
            {copy.button}
          </button>
        </div>
      </div>

      {open && (
        <div id={panelId} className="relative mt-6 rounded-2xl border border-white/15 bg-black/30 p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium">Share MIRA with another boutique owner</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close share panel"
              className="text-white/50 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <p className="mt-3 break-all rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80">{url}</p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a
              href={'https://wa.me/?text=' + encodeURIComponent(message)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-black"
            >
              <MessageCircle size={16} />
              Share on WhatsApp
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm text-white/85 hover:border-white/50 hover:text-white"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>

          <p className="mt-3 text-xs text-white/45">
            Referrals are not tracked yet, so sharing does not record anything. Marketplace launch and placement
            details will be announced by MIRA.
          </p>
        </div>
      )}
    </div>
  )
}
