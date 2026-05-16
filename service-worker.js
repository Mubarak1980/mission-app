// ==========================================
// Service Worker - Mission App PWA Engine
// ==========================================

const CACHE_NAME = 'mission-cache-v101';

// FIXED: Paths updated to relative formatting matching root deployment scope
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
  './icon-192.png'
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
            })
            .catch(() => console.warn('Pre-cache assignment deferred:', url))
        )
      )
    )
  );
});

// ACTIVATE STEP: Cleans up deprecated legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
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
          // FIXED: Intelligently fallback to cached index.html if offline instead of a missing offline.html file
          return caches.match('./index.html') || caches.match(event.request);
        })
    );
    return;
  }

  // 2. STATIC ASSETS CACHE-FIRST LOGIC (JS, CSS, Images, Manifests)
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
        clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }))
      )
    );
  }
});

// SYSTEM MESSAGING SWITCH
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
    
