'use strict';
const CACHE_NAME = 'disability-iat-v5.1.0';
const CORE = [
  './', './index.html', './app.js?v=50', './style.css?v=50', './manifest.json', './admin.html',
  './A1_non_disabled_young_man.jpg',
  './A2_non_disabled_young_woman.jpg',
  './A3_non_disabled_middle_aged_man.jpg',
  './A4_non_disabled_middle_aged_woman.jpg',
  './A5_non_disabled_young_athletic_man.jpg',
  './A6_non_disabled_young_athletic_woman.jpg',
  './A7_non_disabled_older_man.jpg',
  './A8_non_disabled_older_woman.jpg',
  './D1_white_cane_young_man.jpg',
  './D2_white_cane_young_woman.jpg',
  './D3_wheelchair_middle_aged_man.jpg',
  './D4_wheelchair_middle_aged_woman.jpg',
  './D5_prosthesis_young_athletic_man.jpg',
  './D6_prosthesis_young_athletic_woman.jpg',
  './D7_wheelchair_older_man.jpg',
  './D8_prosthesis_older_woman.jpg',
  'https://unpkg.com/jspsych@8.2.3'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request, { ignoreSearch: true }).then(hit => hit || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  })));
});
