const CACHE_NAME = "mission-app-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/main.js",
  "/Study-tracker.js",
  "/Sunnah-tracker.js",
  "/weekly-timetable.js",
  "/dashboard.js",
  "/top-student-mode.js",
  "/icon-192.png",
  "/icon-512.png"
];

// Install
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    self.clients.claim()
  );
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
