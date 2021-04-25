/* eslint-disable no-undef */
const cacheName = CACHE_NAME
const urlsToCache = URLS_TO_CACHE
/* eslint-enable no-undef */

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request)
    })
  )
})
