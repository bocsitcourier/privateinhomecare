const CACHE_NAME = 'privateinhomecaregiver-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - careful caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // NEVER cache sensitive API routes (admin, auth, forms with PHI/PII)
  const sensitiveRoutes = ['/api/admin', '/api/auth', '/api/inquiries', '/api/applications', '/api/intake', '/api/session'];
  const isSensitive = sensitiveRoutes.some(route => url.pathname.startsWith(route));
  
  if (isSensitive) {
    // Sensitive routes: Network only, no caching
    event.respondWith(fetch(request));
    return;
  }

  // Public API requests (articles, jobs, pages) - Network First with short TTL
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache public, successful responses
          if (response.ok && (url.pathname.includes('/articles') || url.pathname.includes('/jobs') || url.pathname.includes('/pages'))) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline: only serve cached public content
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response(JSON.stringify({ error: 'Offline' }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            });
          });
        })
    );
    return;
  }

  // Static assets - Cache First strategy (JS, CSS, images only)
  const cacheableExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.woff', '.woff2', '.ttf'];
  const isCacheable = cacheableExtensions.some(ext => url.pathname.endsWith(ext));

  if (isCacheable) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
            return response;
          });
        })
    );
  } else {
    // HTML and other resources: Network first, no offline fallback
    event.respondWith(fetch(request));
  }
});

// Note: Background sync removed - forms require real-time submission for PHI/PII compliance