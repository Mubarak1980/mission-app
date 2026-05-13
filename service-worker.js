const CACHE_NAME = 'mission-cache-v93';

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
            if (res.ok) {
              await cache.put(url, res.clone());
            }
          } catch (e) {
            // ignore offline / missing assets
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
// FETCH
// ===============================
self.addEventListener('fetch', event => {

  // NAVIGATION (APP SHELL)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('./index.html')
      )
    );
    return;
  }

  // STATIC FILES
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
