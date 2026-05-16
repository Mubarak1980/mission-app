const CACHE_NAME = 'mission-cache-v140';

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
  // ❌ REMOVED icon-512.png (you don't have it → breaks install)
];

// ============================
// INSTALL (SAFE + REQUIRED FOR PWA)
// ============================
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const file of APP_SHELL) {
        try {
          const res = await fetch(file, { cache: "reload" });

          // ✅ STRICT: only cache valid responses
          if (res && res.status === 200) {
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
// ACTIVATE (CRITICAL FOR NATIVE INSTALL)
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

      // ✅ REQUIRED: ensures app is controlled immediately
      await self.clients.claim();
    })()
  );
});

// ============================
// FETCH (PWA SAFE STRATEGY)
// ============================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;

  // ---------------------------
  // NAVIGATION (MOST IMPORTANT)
  // ---------------------------
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(request);

          if (network && network.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put('/index.html', network.clone());
            return network;
          }

          throw new Error("Bad response");
        } catch (err) {
          return (
            (await caches.match('/index.html')) ||
            new Response("<h1>Offline</h1>", {
              headers: { "Content-Type": "text/html" }
            })
          );
        }
      })()
    );
    return;
  }

  // ---------------------------
  // STATIC FILES
  // ---------------------------
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);

      try {
        const network = await fetch(request);

        if (network && network.status === 200) {
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
// UPDATE CONTROL (SAFE)
// ============================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
