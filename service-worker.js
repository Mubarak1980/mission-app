const CACHE_NAME = 'mission-cache-v89';

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

// ===============================
// INSTALL — resilient, won't fail if one file is missing
// ===============================
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        ASSETS.map(url =>
          fetch(url)
            .then(res => {
              if (res.ok) return cache.put(url, res);
            })
            .catch(() => {
              console.warn('Failed to cache:', url);
            })
        )
      );
    })
  );
});

// ===============================
// ACTIVATE — clear old caches
// ===============================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// ===============================
// FETCH — hybrid strategy
// ===============================
self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'GET') return;

  // 1. NAVIGATION → APP SHELL (instant load)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/Mission-app/index.html')
        .then(cached => cached || fetch(event.request))
    );
    return;
  }

  // 2. STATIC FILES → CACHE FIRST (fast)
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

  // 3. DEFAULT → NETWORK FIRST (safe)
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;

        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match('/Mission-app/index.html'))
  );
});

// ===============================
// SKIP WAITING (from page message)
// ===============================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
