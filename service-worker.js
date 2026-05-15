const CACHE_NAME = "mission-app-v14";

const urlsToCache = [
  "/Mission-app/",
  "/Mission-app/index.html",
  "/Mission-app/styles.css",
  "/Mission-app/main.js",
  "/Mission-app/Study-tracker.js",
  "/Mission-app/Sunnah-tracker.js",
  "/Mission-app/weekly-timetable.js",
  "/Mission-app/dashboard.js",
  "/Mission-app/top-student-mode.js",
  "/Mission-app/icon-192.png",
  "/Mission-app/icon-512.png"
];

// ===============================
// INSTALL (SAFE VERSION)
// ===============================
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      try {
        await cache.addAll(urlsToCache);
      } catch (err) {
        console.error("Cache install failed:", err);

        // IMPORTANT: prevent total install failure
        for (const url of urlsToCache) {
          try {
            await cache.add(url);
          } catch (e) {
            console.warn("Skipped cache:", url);
          }
        }
      }
    })
  );
});

// ===============================
// ACTIVATE
// ===============================
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// ===============================
// FETCH (INSTALL-STABLE)
// ===============================
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cached => {
          return cached || caches.match("/Mission-app/index.html");
        });
      })
  );
});
