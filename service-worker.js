// ==========================================
// Mission App - Production PWA Service Worker
// Offline-first + Safe Updates + Stable Cache
// ==========================================

const CACHE_NAME = 'mission-cache-v105';
const APP_SHELL_CACHE = 'mission-shell-v105';

// Core app shell (must ALWAYS exist)
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
// INSTALL (APP SHELL CACHE)
// ============================
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
});

// ============================
// ACTIVATE (CLEAN OLD CACHE)
// ============================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== APP_SHELL_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// ============================
// FETCH STRATEGY (OFFLINE FIRST)
// ============================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. NAVIGATION (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 2. STATIC FILES (JS/CSS/IMAGES)
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.json')
  ) {
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
    return;
  }

  // 3. FALLBACK (network first)
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();

        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));

        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// ============================
// UPDATE HANDLING (NATIVE APP STYLE)
// ============================

// Force activation of new SW immediately
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
