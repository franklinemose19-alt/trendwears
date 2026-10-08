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

function guessIconType(url) {
  const lower = url.toLowerCase().split('?')[0]
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.svg')) return 'image/svg+xml'
  return 'image/jpeg'
}

async function handleManifest(req, res) {
  const { slug } = req.query
  if (!slug) {
    res.status(400).json({ error: 'Missing slug' })
    return
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('name, logo_url, slug')
    .eq('slug', slug)
    .maybeSingle()

  const name = business?.name || 'MIRA Store'
  const storeSlug = business?.slug || slug
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const origin = 'https://' + host

  let icons
  if (business?.logo_url) {
    const type = guessIconType(business.logo_url)
    icons = [
      { src: business.logo_url, sizes: '192x192', type: type, purpose: 'any' },
      { src: business.logo_url, sizes: '512x512', type: type, purpose: 'any' },
    ]
  } else {
    icons = [
      { src: origin + '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: origin + '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ]
  }

  const manifest = {
    id: '/store/' + storeSlug,
    name: name,
    short_name: name.length > 12 ? name.slice(0, 12) : name,
    description: name + ' - Powered by MIRA',
    start_url: '/store/' + storeSlug,
    scope: '/store/' + storeSlug,
    display: 'standalone',
    background_color: '#faf9f6',
    theme_color: '#141414',
    icons: icons,
  }

  res.setHeader('Content-Type', 'application/manifest+json')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
  res.status(200).json(manifest)
}
