const CACHE_NAME = "seis-foundation-v8";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./favicon.svg",
  "./manifest.webmanifest",
  "./assets/styles/seis.tokens.css",
  "./src/styles/base.css",
  "./src/styles/motion.css",
  "./src/styles/responsive.css",
  "./src/scripts/motion-system.js",
  "./src/scripts/development-mode.js",
  "./src/scripts/efficiency-governor.js",
  "./src/scripts/gallery-system.js",
  "./src/scripts/handoff-system.js",
  "./src/scripts/i18n-system.js",
  "./src/scripts/system-pulse.js",
  "./src/scripts/weekly-usage-governor.js",
  "./src/scripts/pwa-system.js",
  "./src/i18n/locales.js",
  "./src/content/artworks.js",
  "./content/lab/development-mode.json",
  "./content/lab/efficiency-governor.json",
  "./content/lab/system-pulse.json",
  "./content/lab/weekly-usage-governor.json",
  "./content/lab/handoff-checklist.json"
];

self.addEventListener("install", event => {
  event.waitUntil(cacheCoreAssets());
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCaches());
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (!isSameOrigin(request.url)) return;

  event.respondWith(cacheFirst(request));
});

async function cacheCoreAssets() {
  const cache = await caches.open(CACHE_NAME);
  const urls = CORE_ASSETS.map(path => new URL(path, self.registration.scope).toString());
  await cache.addAll(urls);
}

async function clearOldCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_error) {
    return caches.match(new URL("./index.html", self.registration.scope).toString());
  }
}

function isSameOrigin(url) {
  return new URL(url).origin === self.location.origin;
}
