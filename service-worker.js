// ==========================================
// Service Worker - Mission App (Final Fixed)
// ==========================================

const CACHE_NAME = 'mission-cache-v103';

// FIXED: Keep your structure, but ensure ONLY existing files are included
const ASSETS = [
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
  // ❌ REMOVED: /icon-512.png (because you don't have it)
];

// INSTALL STEP: Pre-caches core application files
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        ASSETS.map(url =>
          fetch(url)
            .then(res => {
              if (res.ok) return cache.put(url, res);
              throw new Error('Fetch failed: ' + url);
            })
            .catch(err => console.warn('Pre-cache skipped:', url, err))
        )
      )
    )
  );
});

// ACTIVATE STEP: Cleans up deprecated legacy caches
self.addEventListener('activate', (event) => {
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

// FETCH ENGINE: Smart offline interceptor proxy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. NAVIGATION REQUEST HANDLING (HTML Page Loads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 2. STATIC ASSETS CACHE-FIRST LOGIC (JS, CSS, Images, JSON)
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.json')
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

  // 3. GENERIC STRATEGY (Network-first with cache backup)
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

// BACKGROUND SYNC EVENT
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-study-data') {
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(client =>
          client.postMessage({ type: 'SYNC_COMPLETE' })
        )
      )
    );
  }
});

// SYSTEM MESSAGING SWITCH
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
