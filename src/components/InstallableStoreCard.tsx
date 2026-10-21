import { Smartphone, Lock, ExternalLink, MessageCircle } from 'lucide-react'
import { getSubscriptionState } from '@/utils/subscription'
import { supportWhatsAppUrl } from '@/config'
import type { Business } from '@/types'

interface Props {
  business: Business
  enabled: boolean
  popularName: string
}

export default function InstallableStoreCard({ business, enabled, popularName }: Props) {
  const live = business.status === 'active' && getSubscriptionState(business).state === 'active'
  const storePath = '/store/' + business.slug

  // Not part of this plan
  if (!enabled && business.plan === 'basic') {
    return (
      <div className="rounded-2xl border border-white/10 p-5">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-white/40" />
          <p className="text-sm font-medium">Installable store</p>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">{popularName} feature</span>
        </div>
        <p className="mt-2 text-xs text-white/50">
          Upgrade to {popularName} to let your customers add your store to their phone's home screen.
        </p>
      </div>
    )
  }

  // Should be included in the plan but is not switched on
  if (!enabled) {
    return (
      <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/5 p-5">
        <div className="flex items-center gap-2">
          <Smartphone size={16} className="text-yellow-400" />
          <p className="text-sm font-medium">Installable store</p>
        </div>
        <p className="mt-2 text-xs text-yellow-300">
          This feature should be part of your plan but is not switched on yet. Please contact MIRA support.
        </p>
        <a
          href={supportWhatsAppUrl('Hi MIRA, the Installable store feature is not showing on my ' + business.plan + ' plan. Store: ' + business.name)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/70 underline hover:text-white"
        >
          <MessageCircle size={13} />
          Chat with MIRA support
        </a>
      </div>
    )
  }

  // Included in the plan
  return (
    <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Smartphone size={16} className="text-white" />
        <p className="text-sm font-medium">Installable store</p>
        <span className={'rounded-full px-2 py-0.5 text-[11px] ' + (live ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400')}>
          {live ? 'Active' : 'Waiting for your store to go live'}
        </span>
      </div>

      <p className="mt-2 text-xs text-white/60">
        Customers can add your store to their phone's home screen. On Chrome and Edge they will see an Install App
        button on your store pages. On iPhone they use Share, then Add to Home Screen.
      </p>

      {!live && (
        <p className="mt-2 text-xs text-yellow-400">
          The install button only appears while your store is active and paid up. It is switched on for your plan, so
          it will show as soon as MIRA confirms your payment.
        </p>
      )}

      {live && (
        <a
          href={storePath}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-xs text-white/85 hover:border-white/50 hover:text-white"
        >
          <ExternalLink size={13} />
          Open my store to see it
        </a>
      )}

      <p className="mt-3 text-[11px] text-white/40">
        The install button appears on supported browsers only, and not inside the WhatsApp or Instagram in-app browser.
        Customers can open your link in Chrome or Safari first.
      </p>
    </div>
  )
}
