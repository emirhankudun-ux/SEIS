/* Emirhan Kudun Portfolio — Service Worker */
(function () {
  "use strict";

  const CACHE_NAME = "seis-product-foundation-v14";

  const PRECACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./styles.css",
    "./script.js",
    "./app.js",
    "./desktop.html",
    "./desktop.css",
    "./desktop.js",
    "./translations.json",
    "./manifest.json",
    "./manifest.webmanifest",
    "./site-config.json",
    "./favicon.svg",
    "./favicon.ico",
    "./seis-code.html",
    "./seis-code.css",
    "./seis-code.js",
    "./seis-github-coding-lab.html",
    "./seis-linux-replica.html",
    "./seis-five-year-plan.js",
    "./seis-vfs-store.js",
    "./seis-linux-replica-public-demo.html",
    "./seis-demo-flight-deck.html",
    "./wow-gallery.html",
    "./wow-gallery.css",
    "./wow-gallery.js",
    "./website/index.html",
    "./website/seis-ai.html",
    "./website/seis-os.html",
    "./website/seis-code.html",
    "./website/seis-design.html",
    "./website/seis-search.html",
    "./website/seis-cloud.html",
    "./website/seis-store.html",
    "./website/seis-agents.html",
    "./website/product-page.css",
    "./website/product-page.js",
    "./wow-pages/wow-catalog.json",
    "./wow-pages/sub-agent-evidence-summary.json",
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
