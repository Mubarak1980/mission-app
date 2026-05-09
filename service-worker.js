const CACHE_NAME = 'mission-cache-v12';

const ASSETS = [
  '/mission-app/',
  '/mission-app/index.html',
  '/mission-app/styles.css',
  '/mission-app/main.js',
  '/mission-app/Study-tracker.js',
  '/mission-app/Sunnah-tracker.js',
  '/mission-app/dashboard.js',
  '/mission-app/weekly-timetable.js',
  '/mission-app/top-student-mode.js',
  '/mission-app/manifest.json',
  '/mission-app/icon-192.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/mission-app/index.html')
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
