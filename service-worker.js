// ===============================
// 🌐 SERVICE WORKER (STABLE PWA VERSION)
// ===============================

const CACHE_NAME = 'mission-cache-v120';

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './Study-tracker.js',
  './Sunnah-tracker.js',
  './dashboard.js',
  './weekly-timetable.js',
  './top-student-mode.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ===============================
// INSTALL
// ===============================
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// ===============================
// ACTIVATE
// ===============================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// ===============================
// FETCH (IMPROVED STRATEGY)
// ===============================
self.addEventListener('fetch', (event) => {

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) => {
        return cached || fetch(event.request).catch(() => cached);
      })
    );
    return;
  }

  // Static assets (CSS, JS, images)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          // Cache new successful responses
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }

          return networkResponse;
        })
        .catch(() => {
          // Silent fallback (no breaking install)
          return cachedResponse;
        });
    })
  );
});
