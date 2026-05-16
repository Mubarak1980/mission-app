// ==========================================
// Service Worker - Mission App (Stable Build)
// ==========================================

const CACHE_NAME = 'mission-cache-v103';

// IMPORTANT: Only include files that actually exist
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/Study-tracker.js',
  '/Sunnah-tracker.js',
  '/dashboard.js',
  '/weekly-timetable.js',
  '/top-student-mode.js',
  '/manifest.json',
  '/icon-192.png'
];

// INSTALL: Cache core files (fail-safe clean install)
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// ACTIVATE: Remove old caches safely
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

// FETCH: Offline-first smart strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;

  // Handle page navigation (important for SPA/PWA)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first strategy for assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        const clone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, clone);
        });

        return response;
      });
    })
  );
});

// MESSAGE: Allow instant update
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// OPTIONAL: Background sync support
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-study-data') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_COMPLETE' });
        });
      })
    );
  }
});
