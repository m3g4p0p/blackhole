import { k, isMobile, textLeft } from '../game.js'
import { requestFullscreen } from '../util.js'

let difficulty = 1
let highscore = 0
let deferredPrompt = null

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault()
  deferredPrompt = event
})

function initInstallButton () {
  let promptText = null

  if (!window.blackhole) {
    return
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
}

export default function startScene (score = 0) {
  const info = k.addMessage([], textLeft, 300)

  highscore = Math.max(score, highscore)

  function updateInfo () {
    info.setText([
      `Difficulty: ${difficulty}`,
      `Highscore: ${highscore}`
    ])
  }

  function setDifficulty (value) {
    difficulty = Math.max(1, Math.min(10, value))
    updateInfo()
  }

  function initMobileControls () {
    k.addInfo([
      k.text('+', 32),
      k.origin('topright'),
      'control'
    ], -20, 20).clicks(() => {
      setDifficulty(difficulty + 1)
    })

    k.addInfo([
      k.text('-', 32),
      k.origin('topleft'),
      'control'
    ], 20, 20).clicks(() => {
      setDifficulty(difficulty - 1)
    })

    k.addInfo([
      k.text('START', 32),
      k.origin('top'),
      'control'
    ], 0.5, 20).clicks(() => {
      k.addCountdown(3, () => {
        k.go('main', difficulty, true)
      })

      k.destroy(info)
      k.destroyAll('control')
      requestFullscreen()
    })
  }

  function initDesktopControls () {
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

  if (isMobile) {
    initMobileControls()
    initInstallButton()
  } else {
    initDesktopControls()
  }

  k.keyPress('space', () => {
    k.go('main', difficulty, false)
  })

  k.keyPress('up', () => {
    setDifficulty(difficulty + 1)
    updateInfo()
  })

  k.keyPress('down', () => {
    setDifficulty(difficulty - 1)
    updateInfo()
  })

  updateInfo()
}
