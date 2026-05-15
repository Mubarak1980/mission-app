const CACHE_NAME = 'mission-cache-v57';

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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// ===============================
// ACTIVATE
// ===============================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// ===============================
// FETCH
// ===============================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((res) => {
          if (!res || res.status !== 200 || res.type !== 'basic') {
            return res;
          }

          const clone = res.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });

          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
