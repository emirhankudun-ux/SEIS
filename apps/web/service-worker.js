/* Emirhan Kudun Portfolio — Service Worker */
(function () {
  "use strict";

  var CACHE_NAME = "ek-portfolio-v2";

  var PRECACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./translations.json",
    "./manifest.json",
    "./site-config.json",
    "./favicon.svg",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
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
    var request = event.request;
    if (request.method !== "GET") { return; }

    var url = new URL(request.url);
    if (url.origin !== self.location.origin) { return; }

    /* Navigation (HTML): network-first, fall back to cached index.html */
    if (request.mode === "navigate") {
      event.respondWith(
        fetch(request)
          .then(function (response) {
            var clone = response.clone();
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
        var fetched = fetch(request)
          .then(function (response) {
            if (response.ok) {
              var clone = response.clone();
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
