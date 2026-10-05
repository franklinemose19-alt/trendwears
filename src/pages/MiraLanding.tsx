import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Basic',
    price: 'KSh 3,000',
    features: ['Branded storefront', 'Business profile', 'Product catalog & images', 'WhatsApp ordering', 'Add to Home Screen'],
  },
  {
    name: 'Popular',
    price: 'KSh 5,500',
    features: ['Everything in Basic', 'Cart', 'Favourites', 'Customer accounts', 'Push notifications', 'Promotions & discounts'],
    highlighted: true,
  },
  {
    name: 'Pro',
    price: 'KSh 8,500',
    features: ['Everything in Popular', 'Sales analytics', 'Customer analytics', 'Advanced customization', 'Priority support'],
  },
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
          <Link
            to="/store/trendthrift-wears"
            className="inline-block rounded-full border border-white/20 px-8 py-3 text-sm font-medium text-white/80 hover:border-white/40 hover:text-white"
          >
            View an example store
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={
                'rounded-2xl border p-6 ' +
                (plan.highlighted ? 'border-white/30 bg-white/5' : 'border-white/10')
              }
            >
              <p className="text-sm text-white/60">{plan.name}</p>
              <p className="mt-1 text-2xl font-medium">{plan.price}<span className="text-sm text-white/40">/mo</span></p>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                    <Check size={15} className="mt-0.5 shrink-0 text-white/40" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        MIRA · Built by FRANK DAVINCI TECHNOLOGIES
      </footer>
    </div>
  )
}
