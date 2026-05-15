const CACHE_NAME = 'mission-cache-v52';

const ASSETS = [
  '/Mission-app/',
  '/Mission-app/index.html',
  '/Mission-app/styles.css',
  '/Mission-app/main.js',
  '/Mission-app/Study-tracker.js',
  '/Mission-app/Sunnah-tracker.js',
  '/Mission-app/dashboard.js',
  '/Mission-app/weekly-timetable.js',
  '/Mission-app/top-student-mode.js',
  '/Mission-app/manifest.json',
  '/Mission-app/icon-192.png',
  '/Mission-app/icon-512.png'
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
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// ===============================
// FETCH (SAFE OFFLINE-FIRST)
// ===============================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((res) => {
          // Only cache valid responses
          if (!res || res.status !== 200 || res.type !== 'basic') {
            return res;
          }

          const resClone = res.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });

          return res;
        })
        .catch(() => caches.match('/Mission-app/index.html'));
    })
  );
});
