import { MessageCircle, Instagram } from 'lucide-react'
import { useBusiness } from '@/contexts/BusinessContext'

export default function Contact() {
  const { business } = useBusiness()
  const waLink = business?.whatsapp_number
    ? 'https://wa.me/' + business.whatsapp_number.replace(/[^\d]/g, '')
    : ''

  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <h1 className="font-display text-3xl text-ink">Get in touch</h1>
      <p className="mt-4 text-stone">
        The fastest way to reach us is WhatsApp - ask about a piece, sizing, or delivery.
      </p>

      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-moss px-6 py-3 text-sm font-medium text-paper"
        >
          <MessageCircle size={18} />
          Message us on WhatsApp
        </a>
      )}

      {business?.instagram_url && (
        <a
          href={business.instagram_url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center justify-center gap-2 text-sm text-stone hover:text-ink"
        >
          <Instagram size={16} /> Follow on Instagram
        </a>
      )}
    </div>
  )
}
