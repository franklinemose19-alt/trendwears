self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Minimal fetch handler: required by browsers to consider the app installable.
// It does not intercept or cache anything - requests proceed to the network as normal.
self.addEventListener('fetch', () => {})
