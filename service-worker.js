const CACHE_NAME = 'mission-cache-v96';
const OFFLINE_URL = '/Mission-app/offline.html';

const ASSETS = [
  '/Mission-app/',
  '/Mission-app/index.html',
  '/Mission-app/offline.html',
  '/Mission-app/styles.css',
  '/Mission-app/main.js',
  '/Mission-app/Study-tracker.js',
  '/Mission-app/Sunnah-tracker.js',
  '/Mission-app/dashboard.js',
  '/Mission-app/weekly-timetable.js',
  '/Mission-app/top-student-mode.js',
  '/Mission-app/manifest.json',
  '/Mission-app/icon-192.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        ASSETS.map(url =>
          fetch(url)
            .then(res => { if (res.ok) return cache.put(url, res); })
            .catch(() => console.warn('Failed to cache:', url))
        )
      )
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() =>
          caches.match(event.request).then(cached => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  if (
    event.request.url.includes('.js') ||
    event.request.url.includes('.css') ||
    event.request.url.includes('.png') ||
    event.request.url.includes('.json')
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(res => {
          if (!res || res.status !== 200 || res.type !== 'basic') return res;
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-study-data') {
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }))
      )
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
