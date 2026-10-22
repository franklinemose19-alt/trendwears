interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable'

export const MIRA_MANIFEST_HREF = '/mira.webmanifest'

export function storeManifestHref(slug: string): string {
  return '/api/platform?action=manifest&slug=' + slug
}

let deferred: { event: BeforeInstallPromptEvent; forHref: string | null } | null = null
let activeHref: string | null = null
let installed = false
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

if (typeof window !== 'undefined') {
  // Registered when the app starts, so the browser's install event is never missed.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = { event: e as BeforeInstallPromptEvent, forHref: activeHref }
    notify()
  })
  window.addEventListener('appinstalled', () => {
    installed = true
    deferred = null
    notify()
  })
}

// Points the page at one manifest (a store's, or MIRA's). Returns a cleanup that removes it again,
// so a page never offers to install the wrong app.
export function activateManifest(href: string): () => void {
  let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'manifest'
    document.head.appendChild(link)
  }
  link.href = href
  activeHref = href
  notify()

  const el = link
  return () => {
    el.remove()
    if (activeHref === href) activeHref = null
    notify()
  }
}

export function subscribeInstall(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function canPromptInstall(href: string): boolean {
  return !installed && !!deferred && deferred.forHref === href
}

export function isInstalled(): boolean {
  return installed
}

export async function promptInstall(href: string): Promise<InstallOutcome> {
  if (!deferred || deferred.forHref !== href) return 'unavailable'
  const ev = deferred.event
  deferred = null // the browser allows prompt() only once per event
  notify()
  await ev.prompt()
  const choice = await ev.userChoice
  return choice.outcome
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const byMedia = typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches
  return byMedia || (navigator as any).standalone === true
}

export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
}
