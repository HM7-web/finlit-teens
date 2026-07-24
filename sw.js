const CACHE_NAME = 'finlit-teens-v1';
const ASSETS_TO_CACHE = [
  '/finlit-teens/',
  '/finlit-teens/index.html',
  '/finlit-teens/manifest.json',
  '/finlit-teens/icon-192.svg',
  '/finlit-teens/icon-512.svg',
  '/finlit-teens/icon-maskable.svg'
];

// Install: cache all essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache first, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Cache successful responses for future offline use
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // If offline and not in cache, return the main page
        if (event.request.mode === 'navigate') {
          return caches.match('/finlit-teens/index.html');
        }
      });
    })
  );
});
