const CACHE_NAME = 'mission-cache-v137';

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
  '/icon-192.png',
  '/icon-512.png'
];

// ============================
// INSTALL (SAFE)
// ============================
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const file of APP_SHELL) {
        try {
          const res = await fetch(file, { cache: "reload" });

          if (res && res.ok) {
            await cache.put(file, res.clone());
          }
        } catch (e) {
          console.warn("Install skipped:", file);
        }
      }
    })()
  );
});

// ============================
// ACTIVATE (CONTROL FIX)
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

      await self.clients.claim();
    })()
  );
});

// ============================
// FETCH (STABLE OFFLINE-FIRST)
// ============================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;

  // ---------------------------
  // NAVIGATION (CRITICAL FIX)
  // ---------------------------
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Always accept valid responses
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put('/index.html', copy));
            return res;
          }

          throw new Error("Network response invalid");
        })
        .catch(async () => {
          const cached = await caches.match('/index.html');

          return cached || new Response(
            "<h1>Offline</h1><p>Please reconnect</p>",
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );

    return;
  }

  // ---------------------------
  // STATIC FILES (CACHE-FIRST + UPDATE SAFE)
  // ---------------------------
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);

      try {
        const network = await fetch(request);

        if (network && network.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, network.clone());
          return network;
        }

        return cached || network;
      } catch (err) {
        return cached;
      }
    })()
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
