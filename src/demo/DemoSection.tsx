import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEMO_PRODUCTS, DEMO_STORE } from '@/demo/miraStudio'
import DemoImage from '@/demo/DemoImage'
import type { PlanInfo } from '@/types'

// The full demo store is only downloaded when a visitor asks for it, which keeps the landing page light on mobile data.
const DemoStore = lazy(() => import('@/demo/DemoStore'))

interface Props {
  essential: PlanInfo
  signature: PlanInfo
  atelier: PlanInfo
}

const teaser = DEMO_PRODUCTS.filter((p) => p.tags.includes('featured')).slice(0, 4)

export default function DemoSection({ essential, signature, atelier }: Props) {
  const [open, setOpen] = useState<{ productId?: string } | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const openDemo = useCallback((trigger: HTMLElement | null, productId?: string) => {
    triggerRef.current = trigger
    setOpen({ productId })
  }, [])

  const closeDemo = useCallback(() => {
    setOpen(null)
    setTimeout(() => triggerRef.current?.focus(), 0)
  }, [])

  const seePricing = useCallback(() => {
    setOpen(null)
    setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 0)
  }, [])

  return (
    <section id="demo" aria-labelledby="demo-heading" className="mx-auto max-w-5xl px-5 pb-16">
      <div className="rounded-3xl border border-[#c6f432]/15 bg-white/[0.03] p-6 text-center md:p-10">
        <p className="text-[11px] font-medium tracking-wide text-[#c6f432]">INTERACTIVE DEMO</p>
        <h2 id="demo-heading" className="mt-2 font-display text-3xl leading-tight md:text-4xl">See Your Boutique Come to Life.</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-white/60 md:text-base">
          Explore a sample MIRA boutique and see how your products could look online. No account needed.
        </p>

        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
          {teaser.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-label={'Open the demo store: ' + p.name}
              onClick={(e) => openDemo(e.currentTarget, p.id)}
              className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left transition-colors hover:border-[#c6f432]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c6f432]"
            >
              <DemoImage product={p} colourHex={p.colours[0].hex} className="h-auto w-full transition-transform duration-500 group-hover:scale-105" />
              <div className="px-3 py-2">
                <p className="truncate text-xs font-medium text-white/90">{p.name}</p>
                <p className="text-xs text-white/50">KSh {p.price.toLocaleString('en-KE')}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={(e) => openDemo(e.currentTarget)}
            className="rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition hover:scale-[1.02] hover:shadow-[0_0_28px_-6px_rgba(198,244,50,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6f432]"
          >
            Explore Demo Store
          </button>
          <Link
            to="/register"
            className="rounded-full border border-white/30 px-8 py-3 text-sm font-medium text-white hover:border-[#c6f432] hover:text-[#c6f432] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6f432]"
          >
            Create Your Store
          </Link>
        </div>

        <p className="mt-5 text-xs text-white/40">
          {DEMO_STORE.name} is a fictional demonstration boutique with illustrated sample products. Your real store shows your own photos.
        </p>
      </div>

      {open && (
        <Suspense
          fallback={
            <div role="status" className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0b]/90 text-sm text-white/70">
              Loading the demo store...
            </div>
          }
        >
          <DemoStore
            onClose={closeDemo}
            onSeePricing={seePricing}
            initialProductId={open.productId}
            plans={{ essential, signature, atelier }}
          />
        </Suspense>
      )}
    </section>
  )
}
