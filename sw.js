'use strict';
const CACHE_NAME = 'disability-iat-v4.0.0';
const CORE = [
  './', './index.html', './app.js?v=40', './style.css?v=40', './manifest.json', './admin.html',
  './A1_non_disabled_young_man.jpg?v=40',
  './A2_non_disabled_young_woman.jpg?v=40',
  './A3_non_disabled_middle_aged_man.jpg?v=40',
  './A4_non_disabled_middle_aged_woman.jpg?v=40',
  './A5_non_disabled_young_athletic_man.jpg?v=40',
  './A6_non_disabled_young_athletic_woman.jpg?v=40',
  './A7_non_disabled_older_man.jpg?v=40',
  './A8_non_disabled_older_woman.jpg?v=40',
  './D1_white_cane_young_man.jpg?v=40',
  './D2_white_cane_young_woman.jpg?v=40',
  './D3_wheelchair_middle_aged_man.jpg?v=40',
  './D4_wheelchair_middle_aged_woman.jpg?v=40',
  './D5_prosthesis_young_athletic_man.jpg?v=40',
  './D6_prosthesis_young_athletic_woman.jpg?v=40',
  './D7_wheelchair_older_man.jpg?v=40',
  './D8_prosthesis_older_woman.jpg?v=40',
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
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  })));
});
