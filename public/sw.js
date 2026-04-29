// Lightweight service worker — offline shell for PWA install.
// Caches the home shell + manifest; everything else falls back to network.

const CACHE = 'stranger-atti-club-v1';
const SHELL = ['/', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  // Never intercept Razorpay or API calls — they must hit the network fresh.
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/') || url.host.includes('razorpay')) return;

  e.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            // Cache static assets only (same-origin GET, ok response)
            if (
              res.ok &&
              url.origin === self.location.origin &&
              (url.pathname.startsWith('/_next/static') ||
                url.pathname.startsWith('/icons/'))
            ) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(request, copy));
            }
            return res;
          })
          .catch(() => caches.match('/'))
    )
  );
});
