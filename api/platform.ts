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
  const icon = business?.logo_url || 'https://trendwears.vercel.app/favicon.svg'

  const manifest = {
    name: name,
    short_name: name.length > 12 ? name.slice(0, 12) : name,
    description: name + ' - Powered by MIRA',
    start_url: '/store/' + (business?.slug || slug),
    scope: '/store/' + (business?.slug || slug),
    display: 'standalone',
    background_color: '#faf9f6',
    theme_color: '#141414',
    icons: [
      { src: icon, sizes: '192x192', type: 'image/png' },
      { src: icon, sizes: '512x512', type: 'image/png' },
    ],
  }

  res.setHeader('Content-Type', 'application/manifest+json')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
  res.status(200).json(manifest)
}
