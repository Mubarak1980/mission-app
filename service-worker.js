// ==========================================
// Service Worker - Mission App (Final Fixed)
// ==========================================

const CACHE_NAME = 'mission-cache-v102';

// Use ROOT paths (critical for PWA install)
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
  '/icon-192.png',
  '/icon-512.png'
];

// INSTALL: Cache all core files (STRICT - will fail if any missing)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

// ACTIVATE: Remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH: Smart caching strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;

  // 1. Handle page navigation (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 2. Cache-first for static assets
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        // Only cache valid responses
        if (
          !response ||
          response.status !== 200 ||
          response.type !== 'basic'
        ) {
          return response;
        }

        const clone = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => cache.put(request, clone));

        return response;
      });
    })
  );
});

// MESSAGE: Allow immediate update
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// OPTIONAL: Background sync (safe fallback)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-study-data') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SYNC_COMPLETE' });
        });
      })
    );
  }
});
