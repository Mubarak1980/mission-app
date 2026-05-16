const CACHE_NAME = 'mission-cache-v77';

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
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// ===============================
// ACTIVATE
// ===============================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// ===============================
// FETCH (HYBRID - NATIVE FEEL)
// ===============================
self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'GET') return;

  // 🔥 1. NAVIGATION → INSTANT LOAD (APP SHELL)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/Mission-app/index.html')
        .then(cached => cached || fetch(event.request))
    );
    return;
  }

  // 🔥 2. STATIC FILES → CACHE FIRST (FAST)
  if (
    event.request.url.includes('.js') ||
    event.request.url.includes('.css') ||
    event.request.url.includes('.png') ||
    event.request.url.includes('.json')
  ) {
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
    return;
  }

  // 🔥 3. DEFAULT → NETWORK FIRST (SAFE)
  event.respondWith(
    fetch(event.request)
      .then(res => {

        if (!res || res.status !== 200 || res.type !== 'basic') {
          return res;
        }

        const clone = res.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });

        return res;
      })
      .catch(() => caches.match('/Mission-app/index.html'))
  );
});

// ===============================
// SKIP WAITING
// ===============================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
