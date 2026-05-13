// ===============================
// Service Worker (MISSION APP - FINAL PRO)
// ===============================

const CACHE_NAME = 'mission-cache-v99';

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
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ASSETS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "reload" });

            // Only cache valid responses
            if (res && res.status === 200 && res.type === "basic") {
              await cache.put(url, res.clone());
            }
          } catch (e) {
            // Ignore offline or missing files safely
          }
        })
      );
    })
  );
});


// ===============================
// ACTIVATE
// ===============================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});


// ===============================
// OPTIONAL: FORCE UPDATE SUPPORT
// ===============================
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});


// ===============================
// FETCH (SMART OFFLINE SYSTEM)
// ===============================
self.addEventListener('fetch', event => {

  // ===============================
  // NAVIGATION REQUEST (APP SHELL)
  // ===============================
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('./index.html', { ignoreSearch: true })
      )
    );
    return;
  }

  // ===============================
  // STATIC FILES STRATEGY
  // ===============================
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => cached);
    })
  );
});
