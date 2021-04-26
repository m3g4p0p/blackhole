/* eslint-disable no-undef */
const cacheName = '0.1.7'
const urlsToCache = [
  '.',
  './style.css',
  './scenes/start.js',
  './scenes/death.js',
  './scenes/main.js',
  './vendor/kaboom.js',
  './constants.js',
  './util.js',
  './plugins.js',
  './index.html',
  './icons/launcher-icon.png',
  './icons/favicon.ico',
  './game.js'
]
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

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== cacheName) {
            return caches.delete(name)
          }

          return null
        })
      )
    })
  )
})
