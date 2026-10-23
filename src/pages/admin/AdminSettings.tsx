import { useEffect, useState } from 'react'
import { fetchMyBusiness, fetchPlanFeatures, updateBusiness } from '@/services/businesses'
import { usePlans } from '@/hooks/usePlans'
import type { Business, PlanFeatures } from '@/types'

const fields: [keyof Business, string][] = [
  ['name', 'Store name'],
  ['whatsapp_number', 'WhatsApp number (e.g. 254712345678)'],
  ['description', 'Store description'],
  ['instagram_url', 'Instagram URL'],
  ['tiktok_url', 'TikTok URL'],
  ['facebook_url', 'Facebook URL'],
]

const DEFAULT_BRAND = '#4a5240'

export default function AdminSettingsPage() {
  const { byId } = usePlans()
  const [settings, setSettings] = useState<Business | null>(null)
  const [features, setFeatures] = useState<PlanFeatures | null>(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMyBusiness().then((b) => {
      setSettings(b)
      if (b) fetchPlanFeatures(b.plan).then(setFeatures)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!settings) return
    setError('')
    if (settings.brand_color && !/^#[0-9a-fA-F]{6}$/.test(settings.brand_color)) {
      setError('Pick a valid colour.')
      return
    }
    try {
      await updateBusiness(settings.id, settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setError('Could not save: ' + (err?.message ?? 'unknown error'))
    }
  }

  if (!settings) return <p className="text-white/50">Loading...</p>

  return (
    <div>
      <h1 className="font-display text-2xl">Settings</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-4 rounded-2xl border border-white/10 p-6">
        {fields.map(([key, label]) => (
          <div key={String(key)}>
            <label className="mb-1 block text-sm text-white/60">{label}</label>
            <input
              value={(settings[key] as string) ?? ''}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40"
            />
          </div>
        ))}

        <div>
          <label className="mb-1 block text-sm text-white/60">Brand colour (buttons)</label>
          {features?.custom_branding ? (
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.brand_color ?? DEFAULT_BRAND}
                onChange={(e) => setSettings({ ...settings, brand_color: e.target.value })}
                className="h-10 w-14 cursor-pointer rounded border border-white/15 bg-transparent"
              />
              <button
                type="button"
                onClick={() => setSettings({ ...settings, brand_color: null })}
                className="text-xs text-white/50 underline hover:text-white"
              >
                Reset to MIRA default
              </button>
              <span className="text-xs text-white/40">Choose a darker colour so button text stays readable.</span>
            </div>
          ) : (
            <p className="text-xs text-white/40">Custom branding is included in {byId('popular').name}.</p>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-60">
          {saved ? 'Saved' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}
