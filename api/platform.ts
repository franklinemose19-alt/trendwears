import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  const { action, slug } = req.query

  if (action === 'manifest') {
    if (!slug || typeof slug !== 'string') {
      res.status(400).json({ error: 'Missing slug' })
      return
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL as string
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: business } = await supabase
      .from('businesses')
      .select('name, logo_url')
      .eq('slug', slug)
      .maybeSingle()

    const name = business?.name || 'MIRA Store'
    const icon = business?.logo_url || 'https://trendwears.vercel.app/favicon.svg'

    const manifest = {
      name: name,
      short_name: name.length > 12 ? name.slice(0, 12) : name,
      description: name + ' - Powered by MIRA',
      start_url: '/store/' + slug,
      scope: '/store/' + slug,
      display: 'standalone',
      background_color: '#faf9f6',
      theme_color: '#141414',
      icons: [
        { src: icon, sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: icon, sizes: '512x512', type: 'image/png', purpose: 'any' },
      ],
    }

    res.setHeader('Content-Type', 'application/manifest+json')
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.status(200).json(manifest)
    return
  }

  res.status(400).json({ error: 'Unknown action' })
}
