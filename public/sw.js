// ChurchFlow Liberia — Service Worker
// Strategy: NETWORK-FIRST for everything. When online, users always
// get the freshest deployed build (no stale colours / code). Cache is
// only an offline fallback. This permanently prevents the stale-bundle
// problem that cache-first /assets/ could cause on slow networks.
const CACHE_NAME = 'churchflow-v6'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return

  // Backend / AI calls → straight to network, cache fallback only offline.
  if (url.pathname.startsWith('/api/') || url.hostname.includes('insforge.app') || url.hostname.includes('groq.com')) {
    event.respondWith(fetch(req).catch(() => caches.match(req)))
    return
  }

  // Everything else (HTML, JS, CSS, images) → network-first.
  // Refresh the cache copy on every successful fetch so the offline
  // fallback stays current; fall back to cache only when offline.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === 'basic' && url.origin === self.location.origin) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(req, clone))
        }
        return res
      })
      .catch(() => caches.match(req).then((c) => c || caches.match('/index.html')))
  )
})

// ─── Push notifications ───────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'ChurchFlow', {
      body: data.body || 'You have a new notification',
      icon: '/logo.png',
      badge: '/logo.png',
      data: data.url || '/',
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data))
})
