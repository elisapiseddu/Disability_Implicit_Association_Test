'use strict';
const CACHE = 'disability-iat-v3.0.0';
const LOCAL_FILES = [
  './', './index.html', './style.css', './app.js', './admin.html',
  './manifest.json', './README.md', './DEPLOYMENT.md', './SCORING_AND_DATA.md',
  './stimuli/abled/abled_1.jpg',
  './stimuli/abled/abled_2.jpg',
  './stimuli/abled/abled_3.jpg',
  './stimuli/abled/abled_4.jpg',
  './stimuli/abled/abled_5.jpg',
  './stimuli/abled/abled_6.jpg',
  './stimuli/abled/abled_7.jpg',
  './stimuli/abled/abled_8.jpg',
  './stimuli/disabled/disabled_1.jpg',
  './stimuli/disabled/disabled_2.jpg',
  './stimuli/disabled/disabled_3.jpg',
  './stimuli/disabled/disabled_4.jpg',
  './stimuli/disabled/disabled_5.jpg',
  './stimuli/disabled/disabled_6.jpg',
  './stimuli/disabled/disabled_7.jpg',
  './stimuli/disabled/disabled_8.jpg'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(LOCAL_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
