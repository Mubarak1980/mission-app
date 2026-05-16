const CACHE_NAME = 'mission-cache-v114';

const APP_SHELL = [
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

// ============================
// INSTALL (SAFE VERSION)
// ============================
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const file of APP_SHELL) {
        try {
          const res = await fetch(file, { cache: "reload" });
          if (res && res.ok) {
            await cache.put(file, res.clone());
          }
        } catch (err) {
          console.warn("Cache skipped:", file, err);
        }
      }
    })
  );
});

// ============================
// ACTIVATE
// ============================
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

// ============================
// FETCH (offline-first)
// ============================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;

  // Navigation requests (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html');
          return cached || new Response("Offline", { status: 200 });
        })
    );
    return;
  }

  // Static assets (cache-first)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((res) => {
          if (!res || res.status !== 200) return res;

          const copy = res.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });

          return res;
        })
        .catch(() => caches.match(request)); // FIXED SAFE FALLBACK
    })
  );
});

// ============================
// UPDATE CONTROL
// ============================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
