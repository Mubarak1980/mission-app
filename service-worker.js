// ==========================================
// Service Worker - Mission App (Fixed Stable)
// ==========================================

const CACHE_NAME = 'mission-cache-v104';

// IMPORTANT: ONLY real existing files
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

// INSTALL STEP (FIXED: use cache.addAll instead of manual fetch)
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// ACTIVATE STEP
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

// FETCH ENGINE
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') {
          return res;
        }

        const clone = res.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });

        return res;
      });
    })
  );
});

// MESSAGE
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// SYNC
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-study-data') {
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(client =>
          client.postMessage({ type: 'SYNC_COMPLETE' })
        )
      )
    );
  }
});
