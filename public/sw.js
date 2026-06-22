/* Montana Frozen Foods — Service Worker (hand-rolled, dependency-free)
 *
 * Strategy overview:
 *   - Navigations (HTML)         -> network-first, fall back to cached page, then /offline.html
 *   - /_next/static/** + assets  -> cache-first (stale-while-revalidate)
 *   - Images (/images, /icons)   -> cache-first with a capped cache
 *   - Everything else            -> network-first with cache fallback
 *   - /api/** + non-GET          -> always network, never cached
 *
 * Bumping VERSION invalidates every cache (old ones are deleted on activate).
 */

const VERSION = 'v1';
const STATIC_CACHE = `montana-static-${VERSION}`;
const PAGES_CACHE = `montana-pages-${VERSION}`;
const IMAGES_CACHE = `montana-images-${VERSION}`;

// All caches owned by the current VERSION. Anything else is pruned on activate.
const CURRENT_CACHES = [STATIC_CACHE, PAGES_CACHE, IMAGES_CACHE];

// Max number of entries kept in the images cache before we trim oldest-first.
const IMAGES_CACHE_LIMIT = 60;

// App-shell essentials precached on install. Locale homes are "best effort":
// if any single request fails (e.g. a redirect), it must not abort install.
const PRECACHE_URLS = [
  '/offline.html',
  '/site.webmanifest',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32x32.png',
];

const PRECACHE_PAGES = ['/en', '/ar', '/fr', '/de'];

/* ---------------------------------------------------------------- install -- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const staticCache = await caches.open(STATIC_CACHE);
        // Add shell essentials individually so one failure doesn't fail them all.
        await Promise.allSettled(
          PRECACHE_URLS.map((url) => staticCache.add(new Request(url, { cache: 'reload' }))),
        );

        // Best-effort precache of the locale home pages.
        const pagesCache = await caches.open(PAGES_CACHE);
        await Promise.allSettled(
          PRECACHE_PAGES.map((url) => pagesCache.add(new Request(url, { cache: 'reload' }))),
        );
      } catch (err) {
        // Never let install throw — a failed install would block activation.
         
        console.warn('[sw] install precache failed', err);
      }
      await self.skipWaiting();
    })(),
  );
});

/* --------------------------------------------------------------- activate -- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys.filter((key) => !CURRENT_CACHES.includes(key)).map((key) => caches.delete(key)),
        );
      } catch (err) {
         
        console.warn('[sw] activate cleanup failed', err);
      }
      await self.clients.claim();
    })(),
  );
});

/* ------------------------------------------------------------------ fetch -- */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET. Let the browser do everything else (POST, etc.).
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Only handle same-origin http(s) requests. Skip cross-origin and
  // non-http schemes (chrome-extension:, data:, etc.).
  if (url.origin !== self.location.origin) return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // API routes: always network, never cached.
  if (url.pathname.startsWith('/api/')) return;

  // Navigations / HTML documents -> network-first.
  if (request.mode === 'navigate' || isHtmlRequest(request)) {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Hashed/immutable static assets -> cache-first (stale-while-revalidate).
  if (
    url.pathname.startsWith('/_next/static/') ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Images -> cache-first with a capped cache.
  if (
    request.destination === 'image' ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(handleImage(request));
    return;
  }

  // Everything else -> network-first with cache fallback.
  event.respondWith(networkFirst(request, STATIC_CACHE));
});

/* --------------------------------------------------------------- helpers -- */

// True for requests that expect an HTML document even when mode !== 'navigate'.
function isHtmlRequest(request) {
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
}

// Only cache same-origin, basic, 200-OK responses. Skip opaque/error/partial.
function isCacheable(response) {
  return Boolean(
    response &&
      response.ok &&
      response.status === 200 &&
      (response.type === 'basic' || response.type === 'default'),
  );
}

// Network-first for navigations. Cache successful pages so they survive offline,
// otherwise serve the last cached copy, and finally the branded offline page.
async function handleNavigation(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Try the precached locale home for this path, then the global fallback.
    const offline = await caches.match('/offline.html');
    if (offline) return offline;

    return new Response('You are offline.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

// Cache-first with background refresh. Returns cached immediately when present,
// and updates the cache from the network for next time.
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (isCacheable(response)) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    // Kick off revalidation but don't await it.
    networkFetch;
    return cached;
  }

  const network = await networkFetch;
  if (network) return network;

  // Nothing cached and offline.
  return new Response('', { status: 504, statusText: 'Offline' });
}

// Cache-first for images, trimming the cache to stay under the entry cap.
async function handleImage(request) {
  const cache = await caches.open(IMAGES_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      await cache.put(request, response.clone());
      // Trim asynchronously so we don't block the response.
      trimCache(IMAGES_CACHE, IMAGES_CACHE_LIMIT);
    }
    return response;
  } catch {
    // Offline and not cached — return a transparent fallback so layout holds.
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

// Network-first with cache fallback for miscellaneous GET requests.
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

// Keep a cache under a fixed number of entries (oldest-first eviction).
async function trimCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length <= maxEntries) return;
    // keys() is insertion-ordered; delete from the front.
    const overflow = keys.length - maxEntries;
    for (let i = 0; i < overflow; i += 1) {
      await cache.delete(keys[i]);
    }
  } catch (err) {
     
    console.warn('[sw] trimCache failed', err);
  }
}

// Allow the page to trigger an immediate activation if it wants to.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
