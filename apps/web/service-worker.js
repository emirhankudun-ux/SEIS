/* Emirhan Kudun Portfolio — Service Worker */
(function () {
  "use strict";

  const CACHE_NAME = "seis-product-foundation-v11";

  const PRECACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./styles.css",
    "./script.js",
    "./app.js",
    "./translations.json",
    "./manifest.json",
    "./manifest.webmanifest",
    "./site-config.json",
    "./favicon.svg",
    "./favicon.ico",
    "./seis-code.html",
    "./seis-code.css",
    "./seis-code.js",
    "./mythic-gacha.html",
    "./mythic-gacha.css",
    "./mythic-gacha.js",
    "./showcase/nature.html",
    "./showcase/still-life.html",
    "./showcase/materials.html",
    "./showcase/metal-parts.html",
    "./showcase/video-hero.css",
    "./showcase/video-hero.js",
    "./showcase/video-heroes.json",
    "./public/media/mythic/shan-hai-creature-atlas.png",
    "./src/config/routes.json",
    "./src/styles/base.css",
    "./src/styles/motion.css",
    "./src/styles/responsive.css"
  ];

  self.addEventListener("install", function (event) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.addAll(PRECACHE);
      })
    );
    self.skipWaiting();
  });

  self.addEventListener("activate", function (event) {
    event.waitUntil(
      caches.keys().then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
        );
      })
    );
    self.clients.claim();
  });

  self.addEventListener("fetch", function (event) {
    const request = event.request;
    if (request.method !== "GET") { return; }

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) { return; }

    /* Navigation (HTML): network-first, fall back to cached index.html */
    if (request.mode === "navigate") {
      event.respondWith(
        fetch(request)
          .then(function (response) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, clone);
            });
            return response;
          })
          .catch(function () {
            return caches.match("./index.html");
          })
      );
      return;
    }

    /* Static assets: stale-while-revalidate */
    event.respondWith(
      caches.match(request).then(function (cached) {
        const fetched = fetch(request)
          .then(function (response) {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(function (cache) {
                cache.put(request, clone);
              });
            }
            return response;
          })
          .catch(function () {
            return cached || new Response("Network error", { status: 503 });
          });
        return cached || fetched;
      })
    );
  });
})();
