import { MessageCircle } from 'lucide-react'
import { MIRA_TILL_NUMBER, supportWhatsAppUrl } from '@/config'

export default function PayInstructions({ planName, amount }: { planName: string; amount: number }) {
  const message =
    'Hi MIRA, I have paid KSh ' + amount.toLocaleString() + ' to Till ' + MIRA_TILL_NUMBER +
    ' for the ' + planName + ' plan. My store name is: '

  return (
    <div className="mt-5 rounded-lg bg-white/5 p-3 text-xs text-white/60">
      <p>Pay with M-Pesa: Lipa na M-Pesa, then Buy Goods and Services.</p>
      <p className="mt-1 text-sm text-white">
        Till number <span className="font-medium">{MIRA_TILL_NUMBER}</span>
      </p>
      <p className="mt-1">Amount: KSh {amount.toLocaleString()}</p>
      <a
        href={supportWhatsAppUrl(message)}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-white underline"
      >
        <MessageCircle size={13} />
        Send payment confirmation on WhatsApp
      </a>
    </div>
  )
}
