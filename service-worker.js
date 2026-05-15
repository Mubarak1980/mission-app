const CACHE_NAME = 'mission-v1.0.0';

const ASSETS = [
  '/Mission-app/',
  '/Mission-app/index.html',
  '/Mission-app/styles.css',
  '/Mission-app/main.js',
  '/Mission-app/Study-tracker.js',
  '/Mission-app/Sunnah-tracker.js',
  '/Mission-app/dashboard.js',
  '/Mission-app/weekly-timetable.js',
  '/Mission-app/top-student-mode.js',
  '/Mission-app/manifest.json',
  '/Mission-app/icon-192.png',
  '/Mission-app/icon-512.png'
];

// INSTALL
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// ACTIVATE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH (NETWORK-FIRST FOR HTML = PROFESSIONAL RULE)
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // HTML → network-first (important for updates)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/Mission-app/index.html'))
    );
    return;
  }

  // static assets → cache-first
  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(res => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return res;
      });
    })
  );
});
