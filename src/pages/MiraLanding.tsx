import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, Lock, Smartphone, Sparkles } from 'lucide-react'
import { usePlans } from '@/hooks/usePlans'
import { PREVIEW_TRIAL_DAYS } from '@/config'
import ReferEarnBanner from '@/components/ReferEarnBanner'
import DemoSection from '@/demo/DemoSection'
import PayInstructions from '@/components/PayInstructions'
import InstallButton from '@/components/InstallButton'
import { activateManifest, MIRA_MANIFEST_HREF } from '@/utils/installPrompt'

type Cell = string | boolean
interface Row { label: string; essential: Cell; signature: Cell }

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
  const essential = byId('basic')
  const signature = byId('popular')
  const atelier = byId('pro')
  const essentialPrice = essential.monthly_price ?? 0
  const signaturePrice = signature.monthly_price ?? 0

  useEffect(() => activateManifest(MIRA_MANIFEST_HREF), [])

  // Links like /#pricing should land on the pricing section even on a fresh page load.
  useEffect(() => {
    if (window.location.hash === '#pricing') document.getElementById('pricing')?.scrollIntoView()
  }, [])

  const previewFeatures = [
    PREVIEW_TRIAL_DAYS + ' days free - nothing is charged automatically',
    'Build a real boutique storefront',
    'Add your products and up to ' + essential.max_images + ' images',
    'Test customer enquiries on WhatsApp',
    'Mobile-friendly storefront',
  ]

  const essentialFeatures = [
    essential.max_images + ' active product images',
    'Online product catalogue',
    'Product images and details',
    'WhatsApp ordering',
    'Mobile-friendly design',
    'About and Contact sections',
    'Basic customization',
    'Hosting and website maintenance included',
  ]

  const signatureFeatures: { text: string; soon?: boolean }[] = [
    { text: 'Everything in ' + essential.name },
    { text: signature.max_images + ' active product images' },
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
    { label: 'Monthly price', essential: 'KSh ' + essentialPrice.toLocaleString(), signature: 'KSh ' + signaturePrice.toLocaleString() },
    { label: 'Active product images', essential: String(essential.max_images), signature: String(signature.max_images) },
    { label: 'Online catalogue and WhatsApp ordering', essential: true, signature: true },
    { label: 'Mobile-friendly design', essential: true, signature: true },
    { label: 'About and Contact sections', essential: true, signature: true },
    { label: 'Basic customization', essential: true, signature: true },
    { label: 'Installable store (Add to Home Screen)', essential: false, signature: true },
    { label: 'Product categories', essential: false, signature: true },
    { label: 'Search and filtering', essential: false, signature: true },
    { label: 'Featured products', essential: false, signature: true },
    { label: 'Customer inquiry features', essential: false, signature: true },
    { label: 'Store analytics', essential: false, signature: true },
    { label: 'Custom branding (store colour)', essential: false, signature: true },
    { label: 'Better product organization', essential: false, signature: 'Soon' },
    { label: 'More advanced customization', essential: false, signature: 'Soon' },
    { label: 'Hosting and website maintenance', essential: true, signature: true },
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

      <DemoSection essential={essential} signature={signature} atelier={atelier} />

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <ReferEarnBanner variant="landing" />
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="mb-2 text-center font-display text-2xl">Pricing</h2>
        <p className="mx-auto mb-8 max-w-md text-center text-sm text-white/50">
          Start with a free {PREVIEW_TRIAL_DAYS}-day trial, then choose the package that fits your boutique.
        </p>
        <div className="grid items-start gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* PREVIEW - 7 day trial */}
          <div className="relative rounded-2xl border border-dashed border-white/25 p-6">
            <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full border border-white/20 bg-[#0a0a0b] px-3 py-1 text-[11px] text-white/80">
              <Sparkles size={11} /> {PREVIEW_TRIAL_DAYS}-DAY FREE TRIAL
            </span>
            <p className="text-sm text-white/60">MIRA Preview</p>
            <p className="mt-1 text-2xl font-medium">
              KSh 0<span className="text-sm text-white/40"> for {PREVIEW_TRIAL_DAYS} days</span>
            </p>
            <p className="mt-2 text-xs text-white/50">Try MIRA before you pay. This is a temporary trial, not a permanent free plan.</p>
            <ul className="mt-5 space-y-2.5">
              {previewFeatures.map((f) => (
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
              Start free trial
            </Link>
            <p className="mt-3 text-xs text-white/40">
              After {PREVIEW_TRIAL_DAYS} days you choose a plan to keep your store online. Your products and settings are saved.
            </p>
          </div>

          {/* ESSENTIAL */}
          <div className="rounded-2xl border border-white/10 p-6">
            <p className="text-sm text-white/60">{essential.name}</p>
            <p className="mt-1 text-2xl font-medium">
              KSh {essentialPrice.toLocaleString()}<span className="text-sm text-white/40">/month</span>
            </p>
            <p className="mt-2 text-xs text-white/50">A simple online home for your boutique.</p>
            <ul className="mt-5 space-y-2.5">
              {essentialFeatures.map((f) => (
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
              Get {essential.name}
            </Link>
            <PayInstructions planName={essential.name} amount={essentialPrice} />
          </div>

          {/* SIGNATURE - recommended */}
          <div className="relative rounded-2xl border-2 border-white bg-white/5 p-6 shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
              {'\u2B50 Recommended'}
            </span>
            <p className="text-sm text-white/70">{signature.name}</p>
            <p className="mt-1 text-2xl font-medium">
              KSh {signaturePrice.toLocaleString()}<span className="text-sm text-white/40">/month</span>
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
              {signatureFeatures.map((f) => (
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
              Choose {signature.name}
            </Link>
            <PayInstructions planName={signature.name} amount={signaturePrice} />
          </div>

          {/* ATELIER - coming soon, no price */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <span className="absolute -top-3 right-5 rounded-full border border-white/20 bg-[#0a0a0b] px-3 py-1 text-xs text-white/70">
              Coming Soon
            </span>
            <div className="flex items-center gap-2 opacity-70">
              <p className="text-sm text-white/60">{atelier.name}</p>
              <Lock size={13} className="text-white/40" />
            </div>
            <p className="mt-1 text-xl font-medium text-white/50">Coming Soon</p>
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
                <th className="p-3 text-center font-medium">{essential.name}</th>
                <th className="p-3 text-center font-medium">{signature.name}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-white/5 last:border-0">
                  <td className="p-3 text-white/70">{r.label}</td>
                  <td className="p-3 text-center"><CompareCell value={r.essential} /></td>
                  <td className="p-3 text-center"><CompareCell value={r.signature} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          MIRA Preview gives you the {essential.name} features for {PREVIEW_TRIAL_DAYS} days. Hosting and website
          maintenance are included in the monthly price. There is no separate maintenance fee, and nothing is charged
          automatically.
        </p>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        MIRA · Built by FRANK DAVINCI TECHNOLOGIES
      </footer>
    </div>
  )
}
