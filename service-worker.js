const CACHE_NAME = 'mission-cache-v133';

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
// INSTALL (STABLE PWA FIX)
// ============================
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const file of APP_SHELL) {
        try {
          const res = await fetch(file, { cache: "reload" });

          // STRICT CHECK (IMPORTANT FOR INSTALL ELIGIBILITY)
          if (res && res.ok && res.status === 200) {
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
// ACTIVATE (FORCE CONTROL)
// ============================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );

      // CRITICAL: ensures app becomes controlled immediately
      await self.clients.claim();
    })()
  );
});

// ============================
// FETCH (ROBUST OFFLINE FIRST)
// ============================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;

  // ---------------------------
  // NAVIGATION FIX (PWA CORE)
  // ---------------------------
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (!res || res.status !== 200 || res.type !== 'basic') {
            throw new Error("Bad response");
          }

          // update cache
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('/index.html', copy));

          return res;
        })
        .catch(async () => {
          return (
            (await caches.match('/index.html')) ||
            new Response("<h1>Offline</h1>", {
              headers: { "Content-Type": "text/html" }
            })
          );
        })
    );
    return;
  }

  // ---------------------------
  // STATIC CACHE STRATEGY
  // ---------------------------
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((res) => {
          if (!res || res.status !== 200 || res.type !== "basic") {
            return res;
          }

          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));

          return res;
        })
        .catch(() => cached);
    })
  );
});

// ============================
// UPDATE HANDLER
// ============================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
