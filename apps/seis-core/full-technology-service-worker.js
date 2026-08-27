const CACHE_PREFIX = 'seis-full-technology-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;

const APP_SHELL_PATHS = [
  './full-technology.html',
  './full-technology-center.css',
  './full-technology-center.js',
  './full-technology-runtime.js',
  './icon.svg'
];

const DATA_PATHS = [
  '../../content/development/seis-full-technology-registry.json',
  '../../content/development/seis-technology-tool-catalog.json',
  '../../content/development/seis-workbench-composer.json',
  '../../content/development/seis-engine-capability-registry.json',
  '../../content/development/seis-full-technology-command-center.json'
];

const toAbsolute = (path) => new URL(path, self.location.href).toString();
const APP_SHELL_URLS = APP_SHELL_PATHS.map(toAbsolute);
const DATA_URLS = DATA_PATHS.map(toAbsolute);
const PRECACHE_URLS = [...APP_SHELL_URLS, ...DATA_URLS];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    if (request.mode === 'navigate') {
      const fallback = await cache.match(toAbsolute('./full-technology.html'));
      if (fallback) return fallback;
    }
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (DATA_URLS.includes(url.toString())) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (APP_SHELL_URLS.includes(url.toString()) || request.mode === 'navigate') {
    event.respondWith(cacheFirst(request));
  }
});
