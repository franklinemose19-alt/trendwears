import { Link } from 'react-router-dom'
import { Check, Lock } from 'lucide-react'
import { PLAN_PRICES } from '@/config'
import HelplineButton from '@/components/HelplineButton'
import PayInstructions from '@/components/PayInstructions'

const basicFeatures = [
  'Online product catalogue',
  'Product images and details',
  'WhatsApp ordering',
  'Mobile-friendly design',
  'About & Contact section',
  'Basic customization',
  'Hosting and website maintenance included',
]

const popularFeatures = [
  'Everything in Basic',
  'Product categories',
  'Search and filtering',
  'Featured products',
  'Better product organization',
  'Customer inquiry features',
  'Analytics',
  'Custom branding',
  'More advanced customization',
  'Hosting and website maintenance included',
]

export default function MiraLanding() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e8e6]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <span className="font-display text-xl">MIRA</span>
        <Link to="/login" className="text-sm text-white/70 hover:text-white">Sign in</Link>
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
            <p className="text-sm text-white/60">Basic</p>
            <p className="mt-1 text-2xl font-medium">
              KSh {PLAN_PRICES.basic.toLocaleString()}<span className="text-sm text-white/40">/month</span>
            </p>
            <p className="mt-2 text-xs text-white/50">For small boutiques and businesses getting started online.</p>
            <ul className="mt-5 space-y-2.5">
              {basicFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                  <Check size={15} className="mt-0.5 shrink-0 text-white/40" />
                  {f}
                </li>
              ))}
            </ul>
            <PayInstructions planName="Basic" amount={PLAN_PRICES.basic} />
          </div>

          {/* POPULAR - stands out */}
          <div className="relative rounded-2xl border-2 border-white bg-white/5 p-6 shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
              {'\u2B50 Recommended'}
            </span>
            <p className="text-sm text-white/70">Popular</p>
            <p className="mt-1 text-2xl font-medium">
              KSh {PLAN_PRICES.popular.toLocaleString()}<span className="text-sm text-white/40">/month</span>
            </p>
            <p className="mt-2 text-xs text-white/60">For boutiques that want a more complete online shopping experience.</p>
            <ul className="mt-5 space-y-2.5">
              {popularFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                  <Check size={15} className="mt-0.5 shrink-0 text-white" />
                  {f}
                </li>
              ))}
            </ul>
            <PayInstructions planName="Popular" amount={PLAN_PRICES.popular} />
          </div>

          {/* PRO - locked, coming soon */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 opacity-60">
            <div className="flex items-center gap-2">
              <p className="text-sm text-white/50">Pro</p>
              <Lock size={13} className="text-white/30" />
            </div>
            <p className="mt-1 text-xl font-medium text-white/50">Coming Soon</p>
            <p className="mt-4 text-sm text-white/40">
              Advanced e-commerce tools and powerful business features are coming soon.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        MIRA · Built by FRANK DAVINCI TECHNOLOGIES
      </footer>

      <HelplineButton />
    </div>
  )
}
