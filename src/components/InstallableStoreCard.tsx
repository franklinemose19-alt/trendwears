import { useEffect, useState } from 'react'
import { Smartphone, Lock, ExternalLink, MessageCircle, Download, Check } from 'lucide-react'
import { getSubscriptionState } from '@/utils/subscription'
import { activateManifest, storeManifestHref } from '@/utils/installPrompt'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { supportWhatsAppUrl } from '@/config'
import type { Business } from '@/types'

interface Props {
  business: Business
  enabled: boolean
  popularName: string
}

export default function InstallableStoreCard({ business, enabled, popularName }: Props) {
  const live = business.status === 'active' && getSubscriptionState(business).state === 'active'
  const canUse = enabled && live
  const storePath = '/store/' + business.slug
  const href = storeManifestHref(business.slug)
  const [result, setResult] = useState<'accepted' | 'dismissed' | null>(null)

  // While this card is on screen, point the page at THIS store's app so the browser can offer to install it.
  useEffect(() => {
    if (!canUse) return
    return activateManifest(href)
  }, [canUse, href])

  const { canInstall, installed, promptInstall, standalone, ios } = useInstallPrompt(href)

  async function handleInstall() {
    const outcome = await promptInstall()
    if (outcome !== 'unavailable') setResult(outcome)
  }

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

  const helper = canInstall
    ? 'Your browser will ask you to confirm. The store is added to your home screen with the MIRA icon.'
    : ios
      ? 'On iPhone, open your store in Safari, tap Share, then choose Add to Home Screen.'
      : "This browser has not offered to install from here. Open your store and use its Install App button, or your browser menu (Install app or Add to Home screen)."

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
        Add your store to your phone's home screen like an app. Your customers can do the same: on Chrome and Edge they
        see an Install App button on your store pages, and on iPhone they use Share, then Add to Home Screen.
      </p>

      {!live && (
        <p className="mt-2 text-xs text-yellow-400">
          The install button only works while your store is active and paid up. It is switched on for your plan, so it
          will be available as soon as MIRA confirms your payment.
        </p>
      )}

      {live && standalone && (
        <p className="mt-3 text-xs text-green-400">You are using the installed app.</p>
      )}

      {live && !standalone && (installed || result === 'accepted') && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-green-400">
          <Check size={13} />
          Installed. Look for your store on your home screen.
        </p>
      )}

      {live && !standalone && !installed && result !== 'accepted' && (
        <div className="mt-3">
          {result === 'dismissed' && (
            <p className="mb-2 text-xs text-white/50">Installation was cancelled. You can try again from your store.</p>
          )}
          {canInstall ? (
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
            >
              <Download size={15} />
              Install my store
            </button>
          ) : (
            <a
              href={storePath + '?install=1'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
            >
              <ExternalLink size={15} />
              Open my store to install
            </a>
          )}
          <p className="mt-2 text-xs text-white/50">{helper}</p>
        </div>
      )}

      <p className="mt-3 text-[11px] text-white/40">
        Installing works on supported browsers only, and not inside the WhatsApp or Instagram in-app browser.
      </p>
    </div>
  )
}
