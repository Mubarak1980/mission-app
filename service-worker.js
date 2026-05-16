const CACHE_NAME = 'mission-cache-v130';

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
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const file of APP_SHELL) {
        try {
          const res = await fetch(file, { cache: "reload" });
          if (res && res.ok) {
            await cache.put(file, res.clone());
          }
        } catch (e) {
          console.warn("Install skip:", file);
        }
      }
    })
  );
});

// ============================
// ACTIVATE (IMPORTANT FIX)
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

      // CRITICAL FIX: ensures PWA becomes "controlled"
      await self.clients.claim();
    })()
  );
});

// ============================
// FETCH (STABLE OFFLINE-FIRST)
// ============================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ---------------------------
  // NAVIGATION FIX (MOST IMPORTANT)
  // ---------------------------
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match('/index.html');
        return cached || new Response("Offline", {
          headers: { "Content-Type": "text/html" }
        });
      })
    );
    return;
  }

  // ---------------------------
  // STATIC FILES
  // ---------------------------
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((res) => {
          if (!res || res.status !== 200) return res;

          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));

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
