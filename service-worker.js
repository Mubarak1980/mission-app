const CACHE_NAME = "mission-app-v26";

const urlsToCache = [
"./",
"./index.html",
"./styles.css",
"./main.js",
"./Study-tracker.js",
"./Sunnah-tracker.js",
"./weekly-timetable.js",
"./dashboard.js",
"./top-student-mode.js",
"./icon-192.png",
"./icon-512.png"
];

self.addEventListener("install", event => {
self.skipWaiting();
event.waitUntil(
caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
);
});

self.addEventListener("activate", event => {
event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
if (event.request.method !== "GET") return;

event.respondWith(
caches.match(event.request).then(cached => {
return cached || fetch(event.request);
})
);
});
