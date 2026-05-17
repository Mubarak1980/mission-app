const CACHE_NAME = 'mission-cache-v191';

// ============================
// APP SHELL (FIXED)
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
// INSTALL
// ============================
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    await Promise.allSettled(
      APP_SHELL.map(async (file) => {
        try {
          const res = await fetch(file, { cache: "reload" });

          if (res && res.ok) {
            await cache.put(file, res.clone());
          }
        } catch (e) {
          console.warn("Cache skipped:", file);
        }
      })
    );

    self.skipWaiting();
  })());
});

// ============================
// ACTIVATE
// ============================
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    );

    await self.clients.claim();
  })());
});

// ============================
// FETCH
// ============================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;

  // ============================
  // NAVIGATION FIX
  // ============================
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const network = await fetch(request);

        if (network && network.ok) {
          const cache = await caches.open(CACHE_NAME);

          await cache.put('./index.html', network.clone());

          return network;
        }

        throw new Error("Offline");
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
  // STATIC CACHE STRATEGY
  // ============================
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    try {
      const network = await fetch(request);

      if (network && network.ok) {
        await cache.put(request, network.clone());
        return network;
      }

      return cached || network;
    } catch (err) {
      return cached;
    }
  })());
});

// ============================
// MESSAGE CONTROL
// ============================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
