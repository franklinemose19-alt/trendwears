import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageCircle, LogOut } from 'lucide-react'
import StoreSettingsForm from '@/components/StoreSettingsForm'
import SubscriptionSettings from '@/components/SubscriptionSettings'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { supportWhatsAppUrl } from '@/config'

const tabs = [
  { id: 'store', label: 'Store' },
  { id: 'subscription', label: 'Subscription' },
  { id: 'account', label: 'Account & help' },
] as const

type TabId = (typeof tabs)[number]['id']

export default function AdminSettings() {
  const [params, setParams] = useSearchParams()
  const { business } = useAdmin()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const requested = params.get('tab')
  const active: TabId = tabs.some((t) => t.id === requested) ? (requested as TabId) : 'store'

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl">Settings</h1>

      <div role="tablist" aria-label="Settings sections" className="mt-5 flex gap-1 overflow-x-auto border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={'tab-' + t.id}
            aria-selected={active === t.id}
            aria-controls={'panel-' + t.id}
            onClick={() => setParams(t.id === 'store' ? {} : { tab: t.id })}
            className={
              'min-h-[44px] whitespace-nowrap border-b-2 px-4 text-sm ' +
              (active === t.id ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={'panel-' + active} aria-labelledby={'tab-' + active} className="mt-6">
        {active === 'store' && <StoreSettingsForm />}
        {active === 'subscription' && <SubscriptionSettings />}
        {active === 'account' && (
          <div className="max-w-lg space-y-6">
            <section>
              <h2 className="text-sm font-medium">Help and support</h2>
              <p className="mt-1 text-sm text-white/50">Questions about your store, a payment or your plan? Message MIRA on WhatsApp.</p>
              <a
                href={supportWhatsAppUrl('Hi MIRA, I need help with my store: ' + (business?.name ?? ''))}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 px-5 text-sm text-white/90 hover:border-white/50"
              >
                <MessageCircle size={16} aria-hidden="true" /> Chat with MIRA support
              </a>
            </section>
            <section className="border-t border-white/10 pt-6">
              <h2 className="text-sm font-medium">Account</h2>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 px-5 text-sm text-white/90 hover:border-white/50"
              >
                <LogOut size={16} aria-hidden="true" /> Log out
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
