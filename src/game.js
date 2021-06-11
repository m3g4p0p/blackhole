import kaboom from 'kaboom'
import componentsPlugin from './plugins/components'
import displayPlugin from './plugins/display'
import eventsPlugin from './plugins/events'
import mathPlugin from './plugins/math'
import spawnPlugin from './plugins/spawn'
import startScene from './scenes/start'
import mainScene from './scenes/main'
import deathScene from './scenes/death'
import creditsScene from './scenes/credits'
import highscoreSecene from './scenes/highscore'
import { SIZE } from './constants'
import { develop } from './config'
import { logError } from './util'

export const isMobile = (
  window.innerWidth < SIZE.GAME.X ||
  window.innerHeight < SIZE.GAME.Y ||
  'ontouchstart' in window
)

export const k = window.k = kaboom({
  fullscreen: isMobile,
  width: isMobile ? null : SIZE.GAME.X,
  height: isMobile ? null : SIZE.GAME.Y,
  clearColor: [0, 0, 0],
  plugins: [
    componentsPlugin,
    displayPlugin,
    eventsPlugin,
    mathPlugin,
    spawnPlugin
  ],
  debug: develop
})

export const padding = isMobile ? 20 : 100

k.loadSound('soundtrack', 'media/soundtrack.mp3')
k.loadSound('highscore', 'media/highscore.mp3')
k.loadSound('gameover', 'media/gameover.mp3')
k.loadSound('booster', 'media/booster.mp3')
k.loadSound('crash', 'media/crash.mp3')

k.scene('start', startScene)
k.scene('main', mainScene)
k.scene('death', deathScene)
k.scene('credits', creditsScene)
k.scene('highscore', highscoreSecene)
k.start('start')

document.body.classList.toggle('is-fullscreen', isMobile)

if ('serviceWorker' in navigator && !develop) {
  navigator.serviceWorker.register('sw.js').catch(logError)
}
