const cacheName = "seis-demo-web-v2";
const coreAssets = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/manifest.webmanifest",
  "/icon.svg",
  "/_redirects",
  "/contracts/seis-demo-contract.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(coreAssets))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== cacheName)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || !response.ok) {
            return caches.match("/") || response;
          }
          const copy = response.clone();
          caches.open(cacheName).then((cache) => {
            cache.put(event.request, copy);
          });
          return response;
        })
        .catch(() => caches.match("/"));
    })
  );
});
