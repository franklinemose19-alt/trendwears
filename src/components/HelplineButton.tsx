import { MessageCircle } from 'lucide-react'
import { supportWhatsAppUrl } from '@/config'

export default function HelplineButton() {
  return (
    <a
      href={supportWhatsAppUrl('Hi MIRA, I need help / I want to report a problem.')}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with MIRA support on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-black shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle size={18} />
      Help & Reports
    </a>
  )
}
