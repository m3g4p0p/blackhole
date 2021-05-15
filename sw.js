/* eslint-disable no-undef */
const cacheName = '0.1.28'
const urlsToCache = [
  '.',
  './style.css',
  './about.html',
  './scenes/start.js',
  './scenes/death.js',
  './scenes/main.js',
  './vendor/kaboom.js',
  './vendor/kaboom.mjs.map',
  './vendor/kaboom.mjs',
  './plugins/spawn.js',
  './plugins/components.js',
  './plugins/math.js',
  './plugins/display.js',
  './constants.js',
  './util.js',
  './index.html',
  './icons/launcher-icon.png',
  './icons/favicon.ico',
  './media/crash.mp3',
  './media/booster.mp3',
  './media/gameover.mp3',
  './media/soundtrack.mp3',
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
