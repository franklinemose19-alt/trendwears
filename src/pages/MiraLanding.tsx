import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, Lock, Smartphone } from 'lucide-react'
import { usePlans } from '@/hooks/usePlans'
import HelplineButton from '@/components/HelplineButton'
import PayInstructions from '@/components/PayInstructions'
import InstallButton from '@/components/InstallButton'
import { activateManifest, MIRA_MANIFEST_HREF } from '@/utils/installPrompt'

type Cell = string | boolean
interface Row { label: string; basic: Cell; popular: Cell }

function CompareCell({ value }: { value: Cell }) {
  if (value === true) return <Check size={16} className="mx-auto text-white" />
  if (value === false) return <span className="text-white/25">-</span>
  return <span className="text-xs text-white/70">{value}</span>
}

function Soon() {
  return <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">Coming soon</span>
}

export default function MiraLanding() {
  const { byId } = usePlans()
  const basic = byId('basic')
  const popular = byId('popular')
  const pro = byId('pro')

  useEffect(() => activateManifest(MIRA_MANIFEST_HREF), [])

  const basicFeatures = [
    basic.max_images + ' active product images',
    'Online product catalogue',
    'Product images and details',
    'WhatsApp ordering',
    'Mobile-friendly design',
    'About and Contact sections',
    'Basic customization',
    'Hosting and website maintenance included',
  ]

  const popularFeatures: { text: string; soon?: boolean }[] = [
    { text: 'Everything in Basic' },
    { text: popular.max_images + ' active product images' },
    { text: 'Product categories' },
    { text: 'Search and filtering' },
    { text: 'Featured products' },
    { text: 'Better product organization', soon: true },
    { text: 'Customer inquiry features' },
    { text: 'Store analytics' },
    { text: 'Custom branding (store colour)' },
    { text: 'More advanced customization', soon: true },
    { text: 'Hosting and website maintenance included' },
  ]

  const rows: Row[] = [
    { label: 'Monthly price', basic: 'KSh ' + basic.monthly_price.toLocaleString(), popular: 'KSh ' + popular.monthly_price.toLocaleString() },
    { label: 'Active product images', basic: String(basic.max_images), popular: String(popular.max_images) },
    { label: 'Online catalogue and WhatsApp ordering', basic: true, popular: true },
    { label: 'Mobile-friendly design', basic: true, popular: true },
    { label: 'About and Contact sections', basic: true, popular: true },
    { label: 'Basic customization', basic: true, popular: true },
    { label: 'Installable store (Add to Home Screen)', basic: false, popular: true },
    { label: 'Product categories', basic: false, popular: true },
    { label: 'Search and filtering', basic: false, popular: true },
    { label: 'Featured products', basic: false, popular: true },
    { label: 'Customer inquiry features', basic: false, popular: true },
    { label: 'Store analytics', basic: false, popular: true },
    { label: 'Custom branding (store colour)', basic: false, popular: true },
    { label: 'Better product organization', basic: false, popular: 'Soon' },
    { label: 'More advanced customization', basic: false, popular: 'Soon' },
    { label: 'Hosting and website maintenance', basic: true, popular: true },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e8e6]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <span className="font-display text-xl">MIRA</span>
        <div className="flex items-center gap-4">
          <InstallButton manifestHref={MIRA_MANIFEST_HREF} label="Install MIRA" variant="dark" />
          <Link to="/login" className="text-sm text-white/70 hover:text-white">Sign in</Link>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-5 pb-16 pt-10 text-center">
        <h1 className="font-display text-4xl leading-tight md:text-5xl">
          Your branded online store, powered by MIRA.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-white/60">
          Create a storefront, add your products, and take orders on WhatsApp - no checkout, no complexity.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-block rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
          >
            Create your store
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20">
        <h2 className="mb-8 text-center font-display text-2xl">Pricing</h2>
        <div className="grid items-start gap-5 md:grid-cols-3">
          {/* BASIC */}
          <div className="rounded-2xl border border-white/10 p-6">
            <p className="text-sm text-white/60">{basic.name}</p>
            <p className="mt-1 text-2xl font-medium">
              KSh {basic.monthly_price.toLocaleString()}<span className="text-sm text-white/40">/month</span>
            </p>
            <p className="mt-2 text-xs text-white/50">A simple online home for your boutique.</p>
            <ul className="mt-5 space-y-2.5">
              {basicFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                  <Check size={15} className="mt-0.5 shrink-0 text-white/40" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="mt-6 block rounded-full border border-white/30 py-2.5 text-center text-sm font-medium text-white hover:border-white/60"
            >
              Get {basic.name}
            </Link>
            <PayInstructions planName={basic.name} amount={basic.monthly_price} />
          </div>

          {/* POPULAR - recommended */}
          <div className="relative rounded-2xl border-2 border-white bg-white/5 p-6 shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
              {'\u2B50 Recommended'}
            </span>
            <p className="text-sm text-white/70">{popular.name}</p>
            <p className="mt-1 text-2xl font-medium">
              KSh {popular.monthly_price.toLocaleString()}<span className="text-sm text-white/40">/month</span>
            </p>
            <p className="mt-2 text-xs text-white/60">A more organized, branded shopping experience for growing boutiques.</p>
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-white/20 bg-white/10 p-3">
              <Smartphone size={20} className="mt-0.5 shrink-0 text-white" />
              <div>
                <p className="text-sm font-medium text-white">Installable Store</p>
                <p className="text-xs text-white/80">Add to Home Screen</p>
                <p className="mt-1 text-xs text-white/60">
                  Let your customers add your store to their phone's home screen for quick, convenient access.
                  It installs from the browser and is not an app-store download.
                </p>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5">
              {popularFeatures.map((f) => (
                <li key={f.text} className="flex items-start gap-2 text-sm text-white/80">
                  <Check size={15} className="mt-0.5 shrink-0 text-white" />
                  <span>
                    {f.text}
                    {f.soon && <Soon />}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="mt-6 block rounded-full bg-white py-2.5 text-center text-sm font-medium text-black hover:scale-[1.01]"
            >
              Choose {popular.name}
            </Link>
            <PayInstructions planName={popular.name} amount={popular.monthly_price} />
          </div>

          {/* PRO - visible but locked */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <span className="absolute -top-3 right-5 rounded-full border border-white/20 bg-[#0a0a0b] px-3 py-1 text-xs text-white/70">
              Coming Soon
            </span>
            <div className="flex items-center gap-2 opacity-70">
              <p className="text-sm text-white/60">{pro.name}</p>
              <Lock size={13} className="text-white/40" />
            </div>
            <p className="mt-1 text-2xl font-medium text-white/60">
              KSh {pro.monthly_price.toLocaleString()}<span className="text-sm text-white/30">/month</span>
            </p>
            <p className="mt-4 text-sm text-white/40">
              Advanced e-commerce tools and powerful business features are coming soon.
            </p>
            <button
              disabled
              aria-disabled="true"
              className="mt-6 w-full cursor-not-allowed rounded-full bg-white/10 py-2.5 text-sm text-white/40"
            >
              Coming Soon
            </button>
          </div>
        </div>

        <div className="mt-14 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 font-normal text-white/50">Compare plans</th>
                <th className="p-3 text-center font-medium">{basic.name}</th>
                <th className="p-3 text-center font-medium">{popular.name}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-white/5 last:border-0">
                  <td className="p-3 text-white/70">{r.label}</td>
                  <td className="p-3 text-center"><CompareCell value={r.basic} /></td>
                  <td className="p-3 text-center"><CompareCell value={r.popular} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          Hosting and website maintenance are included in the monthly price. There is no separate maintenance fee.
        </p>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        MIRA · Built by FRANK DAVINCI TECHNOLOGIES
      </footer>

      <HelplineButton />
    </div>
  )
}
