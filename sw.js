/* eslint-disable no-undef */
const cacheName = '0.1.1'
const urlsToCache = [
  '.',
  './style.css',
  './scenes',
  './scenes/start.js',
  './scenes/death.js',
  './scenes/main.js',
  './vendor',
  './vendor/kaboom.js',
  './constants.js',
  './manifest.json',
  './util.js',
  './sw.js',
  './plugins.js',
  './index.html',
  './icons',
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
