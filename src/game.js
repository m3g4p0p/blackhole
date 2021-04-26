import './vendor/kaboom.js'
import { SIZE } from './constants.js'
import { componentsPlugin, displayPlugin } from './plugins.js'
import { hideAddressBar } from './util.js'
import startScene from './scenes/start.js'
import mainScene from './scenes/main.js'
import deathScene from './scenes/death.js'

const develop = window.location.pathname.startsWith('/src/')

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

export const textLeft = isMobile ? 20 : 200

k.scene('start', startScene)
k.scene('main', mainScene)
k.scene('death', deathScene)
k.start('start')

document.body.classList.toggle('is-fullscreen', isMobile)
window.addEventListener('load', hideAddressBar)

if ('serviceWorker' in navigator && !develop) {
  navigator.serviceWorker.register('sw.js').catch(console.error)
}
