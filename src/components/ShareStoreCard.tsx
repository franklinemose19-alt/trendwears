import { useState } from 'react'
import { Copy, Check, Share2 } from 'lucide-react'
import type { Business } from '@/types'

export default function ShareStoreCard({ business }: { business: Business }) {
  const [copied, setCopied] = useState(false)
  const url = window.location.origin + '/store/' + business.slug

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy your store link:', url)
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: business.name, text: 'Shop at ' + business.name, url })
      } catch {
        // user closed the share sheet
      }
      return
    }
    window.open('https://wa.me/?text=' + encodeURIComponent('Shop at ' + business.name + ': ' + url), '_blank')
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/10 p-5">
      <p className="text-sm text-white/60">Your store link</p>
      <p className="mt-2 break-all rounded-lg bg-white/5 px-3 py-2 text-sm">{url}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white"
        >
          <Share2 size={15} />
          Share
        </button>
      </div>

      <p className="mt-3 text-xs text-white/40">
        Paste this link on your WhatsApp status or Instagram story link sticker so customers can open your store.
        {business.status !== 'active' && ' The link works once MIRA activates your store.'}
      </p>
    </div>
  )
}
