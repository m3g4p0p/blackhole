import './vendor/kaboom.js'
import { SIZE } from './constants.js'
import { componentsPlugin, displayPlugin } from './plugins.js'
import startScene from './scenes/start.js'
import mainScene from './scenes/main.js'
import deathScene from './scenes/death.js'

export const develop = window.location.pathname.startsWith('/src')

export const isMobile = (
  window.innerWidth < SIZE.GAME.X ||
  window.innerHeight < SIZE.GAME.Y
)

export const k = window.k = window.kaboom({
  fullscreen: isMobile,
  width: isMobile ? null : SIZE.GAME.X,
  height: isMobile ? null : SIZE.GAME.Y,
  plugins: [componentsPlugin, displayPlugin],
  debug: develop
})

export const padding = isMobile ? 20 : 100

k.loadSound('soundtrack', 'media/soundtrack.mp3')
k.loadSound('gameover', 'media/gameover.mp3')
k.loadSound('booster', 'media/booster.mp3')
k.loadSound('crash', 'media/crash.mp3')

k.scene('start', startScene)
k.scene('main', mainScene)
k.scene('death', deathScene)
k.start('start')

document.body.classList.toggle('is-fullscreen', isMobile)

if ('serviceWorker' in navigator && window.blackhole) {
  navigator.serviceWorker.register('sw.js').catch(console.error)
}
