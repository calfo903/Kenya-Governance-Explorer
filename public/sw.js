const CACHE_VERSION = 'ke-gov-v1';
const STATIC_CACHE = CACHE_VERSION + '-static';
const DATA_CACHE = CACHE_VERSION + '-data';
const API_CACHE = CACHE_VERSION + '-api';

const STATIC_EXTS = ['.js', '.css', '.png', '.svg', '.ico', '.woff2', '.woff', '.ttf', '.json'];
const API_PATTERN = /\/api\//;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(['/'])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  try { return STATIC_EXTS.some((ext) => new URL(url).pathname.endsWith(ext)); } catch { return false; }
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.protocol === 'chrome-extension:') return;

  // API routes: network-first
  if (API_PATTERN.test(url.pathname)) {
    e.respondWith(networkFirst(e.request, API_CACHE, 86400));
    return;
  }

  // Static assets: cache-first
  if (isStaticAsset(e.request.url)) {
    e.respondWith(cacheFirst(e.request, STATIC_CACHE));
    return;
  }

  // HTML pages: stale-while-revalidate
  if (e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(staleWhileRevalidate(e.request, DATA_CACHE));
    return;
  }

  e.respondWith(fetch(e.request));
});

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch { return new Response('Offline', { status: 503 }); }
}

async function networkFirst(req, cacheName, maxAge) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline — cached data unavailable' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then((res) => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => cached);
  return cached || fetchPromise;
}
