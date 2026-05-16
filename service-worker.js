const CACHE_NAME = 'mission-cache-v128';

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
// INSTALL
// ============================
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const file of APP_SHELL) {
        try {
          const res = await fetch(file, { cache: "reload" });

          if (res && res.ok && res.status === 200) {
            await cache.put(file, res.clone());
          }
        } catch (err) {
          console.warn("Skipped (safe install):", file);
        }
      }
    })()
  );
});

// ============================
// ACTIVATE
// ============================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })()
  );

  self.clients.claim();
});

// ============================
// FETCH (OFFLINE-FIRST + SAFE FALLBACK)
// ============================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;

  // ----------------------------
  // NAVIGATION (CRITICAL FIX)
  // ----------------------------
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // cache latest index.html
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(async () => {
          // SAFE OFFLINE FALLBACK
          const cached = await caches.match('/index.html');
          return (
            cached ||
            new Response(
              `<h1>Offline</h1><p>Please reconnect to use Mission App.</p>`,
              { headers: { 'Content-Type': 'text/html' } }
            )
          );
        })
    );
    return;
  }

  // ----------------------------
  // STATIC ASSETS
  // ----------------------------
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((res) => {
          if (!res || res.status !== 200 || res.type !== "basic") {
            return res;
          }

          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });

          return res;
        })
        .catch(() => cached);
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
