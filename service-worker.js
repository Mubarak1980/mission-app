const CACHE_NAME = 'mission-cache-v193';

// ============================
// CORE APP SHELL
// ============================
const APP_SHELL = [
  './index.html',
  './styles.css',
  './main.js',
  './Study-tracker.js',
  './Sunnah-tracker.js',
  './dashboard.js',
  './weekly-timetable.js',
  './top-student-mode.js',
  './manifest.json',
  './icon-192.png'
];

// ============================
// INSTALL (CHROME STABLE)
// ============================
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);

      const results = await Promise.allSettled(
        APP_SHELL.map(async (file) => {
          try {
            const res = await fetch(file, {
              cache: "reload",
              credentials: "same-origin"
            });

            if (!res || !res.ok) {
              console.warn("Skipping:", file);
              return;
            }

            await cache.put(file, res.clone());

          } catch (err) {
            console.warn("Fetch failed:", file);
          }
        })
      );

      console.log("Cache install complete:", results.length);

    } catch (e) {
      console.error("Install failed:", e);
    }

    // IMPORTANT: immediate activation
    self.skipWaiting();
  })());
});

// ============================
// ACTIVATE (CLEAN + FAST)
// ============================
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );

      await self.clients.claim();

      // Notify clients (helps debugging install issues)
      const clients = await self.clients.matchAll();
      clients.forEach(client =>
        client.postMessage({ type: "SW_READY" })
      );

    } catch (err) {
      console.error("Activate error:", err);
    }
  })());
});

// ============================
// FETCH (CHROME OPTIMIZED)
// ============================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;

  // ============================
  // NAVIGATION (CRITICAL PWA FIX)
  // ============================
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const network = await fetch(request);

        if (network && network.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put('./index.html', network.clone());
          return network;
        }

        throw new Error("Network failed");

      } catch (err) {
        const cache = await caches.open(CACHE_NAME);

        return (
          (await cache.match('./index.html')) ||
          new Response("<h1>Offline</h1>", {
            headers: { "Content-Type": "text/html" }
          })
        );
      }
    })());

    return;
  }

  // ============================
  // CACHE FIRST (SAFE FALLBACK)
  // ============================
  event.respondWith((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);

      const network = await fetch(request);

      if (network && network.ok) {
        cache.put(request, network.clone());
        return network;
      }

      return cached || network;

    } catch (err) {
      const cache = await caches.open(CACHE_NAME);
      return await cache.match(request);
    }
  })());
});

// ============================
// UPDATE CONTROL
// ============================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
