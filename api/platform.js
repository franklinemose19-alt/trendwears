import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { action } = req.query

  if (action === 'manifest') {
    return handleManifest(req, res)
  }

  res.status(400).json({ error: 'Unknown action' })
}

// A store's app manifest is only issued while the store is active, paid up AND on a plan that
// includes the installable store. Anything else gets no manifest, so the browser cannot offer
// (or refresh) the install. The check runs on every request and is never cached for denials.
async function isEntitledToInstall(business) {
  if (!business) return false
  if (business.status !== 'active') return false
  if (!business.next_billing_date || new Date(business.next_billing_date) <= new Date()) return false
  if (business.plan === 'pro') return false // Pro is not available yet

  const { data: feature } = await supabase
    .from('plan_features')
    .select('enabled')
    .eq('plan', business.plan)
    .eq('feature', 'installable_store')
    .maybeSingle()

  return !!feature?.enabled
}

async function handleManifest(req, res) {
  const { slug } = req.query
  if (!slug) {
    res.status(400).json({ error: 'Missing slug' })
    return
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('name, slug, plan, status, next_billing_date')
    .eq('slug', slug)
    .maybeSingle()

  if (!(await isEntitledToInstall(business))) {
    res.setHeader('Cache-Control', 'no-store')
    res.status(403).json({ error: 'The installable store is not available for this store.' })
    return
  }

  const name = business.name
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const origin = 'https://' + host

  // The trailing slash keeps this app limited to this one store (/store/abc must not cover /store/abcd).
  const storePath = '/store/' + business.slug + '/'

  // Every store gets the same MIRA "M" icon; the store name is the only thing that differs.
  const icons = [
    { src: origin + '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: origin + '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ]

  const manifest = {
    id: storePath,
    name: name,
    short_name: name.length > 12 ? name.slice(0, 12) : name,
    description: name + ' - Powered by MIRA',
    start_url: storePath,
    scope: storePath,
    display: 'standalone',
    background_color: '#faf9f6',
    theme_color: '#141414',
    icons: icons,
  }

  res.setHeader('Content-Type', 'application/manifest+json')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60')
  res.status(200).json(manifest)
}
