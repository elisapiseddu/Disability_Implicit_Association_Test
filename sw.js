const CACHE = 'disability-iat-v1.0.0';
const LOCAL_ASSETS = ['./', './index.html', './style.css', './app.js', './manifest.json', './admin.html'];
const JSPsychURL = 'https://unpkg.com/jspsych@8.2.3/dist/index.browser.js';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(LOCAL_ASSETS);
    try { await cache.add(JSPsychURL); } catch (e) { /* first load may be offline */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (event.request.method === 'GET') {
        const cache = await caches.open(CACHE);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch (e) {
      return caches.match('./index.html');
    }
  })());
});
