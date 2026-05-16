// Eva's Draperies — service worker
// Strategy:
//   * Navigations (HTML): network-first, fall back to cached /index.html when offline.
//     The cached HTML is REFRESHED on every successful navigate, so it always points
//     at the latest hashed Vite bundle names.
//   * Hashed build assets (/assets/*-[hash].ext): cache-first. They're content-addressed
//     and never change for the same URL.
//   * Everything else: network-first, fall back to cache only on offline.
//
// IMPORTANT: bump CACHE_VERSION on any strategy change so installed clients drop
// their old caches on the next activate.

const CACHE_VERSION = 'v3'
const CACHE = `eva-drapes-${CACHE_VERSION}`
const OFFLINE_FALLBACK = '/index.html'
const PRECACHE = [OFFLINE_FALLBACK, '/manifest.webmanifest', '/favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

const HASHED_ASSET_RE = /\/assets\/.+-[a-f0-9]{8,}\.(?:js|mjs|css|woff2?|png|jpg|jpeg|svg|gif|ico)$/i

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // --- Navigations (HTML) — network-first, refresh offline fallback ---
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone()
            caches
              .open(CACHE)
              .then((cache) => cache.put(OFFLINE_FALLBACK, clone))
              .catch(() => {})
          }
          return res
        })
        .catch(() => caches.match(OFFLINE_FALLBACK)),
    )
    return
  }

  // --- Hashed build assets — cache-first (immutable) ---
  if (HASHED_ASSET_RE.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached
        return fetch(req).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone()
            caches
              .open(CACHE)
              .then((cache) => cache.put(req, clone))
              .catch(() => {})
          }
          return res
        })
      }),
    )
    return
  }

  // --- Everything else — network-first, cache fallback for offline ---
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone()
          caches
            .open(CACHE)
            .then((cache) => cache.put(req, clone))
            .catch(() => {})
        }
        return res
      })
      .catch(() => caches.match(req)),
  )
})
