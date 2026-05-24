// ChurchFlow Liberia — Service Worker
// Strategy:
//   • Network-first for navigation (HTML) so users always get the
//     freshest index.html → no stale bundle-hash 404s.
//   • Network-first for API calls.
//   • Cache-first for hashed static assets in /assets/ (immutable).
//   • Skip cache entirely for everything else (safest default).
const CACHE_NAME = 'churchflow-v3'

self.addEventListener('install', (event) => {
  // Take over immediately on update
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

  // ── 1. Navigation requests (HTML pages) → network-first ─────
  // Critical: prevents stale index.html that references old JS/CSS hashes.
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    )
    return
  }

  // ── 2. API / backend → network-only with cache fallback ────
  if (url.pathname.startsWith('/api/') || url.hostname.includes('insforge.app') || url.hostname.includes('groq.com')) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    )
    return
  }

  // ── 3. Hashed static assets in /assets/ → cache-first ──────
  // Vite emits content-hashed filenames so cache-first is safe forever.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached
        return fetch(req).then((res) => {
          if (res.ok && res.type === 'basic') {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(req, clone))
          }
          return res
        })
      })
    )
    return
  }

  // ── 4. Default → network, no cache ─────────────────────────
  // (Skips icons/images so a missing PNG isn't permanently cached.)
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
