import { k, isMobile, textLeft } from '../game.js'
import { toggleFullscreen } from '../util.js'

let difficulty = 1
let highscore = 0
let deferredPrompt = null

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault()
  deferredPrompt = event
})

export default function startScene (score = 0) {
  const info = k.addMessage([], textLeft, 300)
  let promptText = null

  function updateInfo () {
    info.setText([
      `Difficulty: ${difficulty}`,
      `Highscore: ${highscore}`
    ])
  }

  function setDificulty (value) {
    difficulty = Math.max(1, Math.min(10, value))
    updateInfo()
  }

  highscore = Math.max(score, highscore)

  if (isMobile) {
    k.addInfo([
      k.text('+', 32),
      k.origin('topright'),
      'control'
    ], -20, 20).clicks(() => {
      setDificulty(difficulty + 1)
    })

    k.addInfo([
      k.text('-', 32),
      k.origin('topleft'),
      'control'
    ], 20, 20).clicks(() => {
      setDificulty(difficulty - 1)
    })

    k.addInfo([
      k.text('START', 32),
      k.origin('top'),
      'control'
    ], 0.5, 20).clicks(() => {
      const countdown = k.addInfo([
        k.text(3, 32),
        k.origin('center')
      ], 0.5, 0.5)

      const handle = window.setInterval(() => {
        const value = countdown.text - 1

        if (value === -1) {
          window.clearInterval(handle)
          k.go('main', difficulty, true)
        } else {
          countdown.text = value
        }
      }, 1000)

      toggleFullscreen(true)
      k.destroy(info)
      k.destroyAll('control')
    })
  } else {
    k.addMessage([
      'Press SPACE to start falling!',
      'Use UP and DOWN to adjust the difficulty.'
    ], textLeft, 200, 2)

    k.mouseClick(() => {
      k.go('main', difficulty, true)
    })
  }

  if (window.blackhole) {
    k.addInfo([
      k.text(window.blackhole),
      k.origin('botright')
    ], -20, -20).clicks(() => {
      window.location.assign('about.html')
    })
  }

  k.render(() => {
    if (promptText || !deferredPrompt) {
      return
    }

    promptText = k.addInfo([
      k.text('install', 16),
      k.origin('bot'),
      'control'
    ], 0.5, -20)

    promptText.clicks(() => {
      deferredPrompt.prompt()
      deferredPrompt = null
    })
  })

  k.keyPress('space', () => {
    k.go('main', difficulty, false)
  })

  k.keyPress('up', () => {
    setDificulty(difficulty + 1)
    updateInfo()
  })

  k.keyPress('down', () => {
    setDificulty(difficulty - 1)
    updateInfo()
  })

  updateInfo()
}
