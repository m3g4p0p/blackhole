import { DIFFICULTY } from '../constants.js'
import { k, isMobile, textLeft } from '../game.js'
import { cap, requestFullscreen, scaleArea } from '../util.js'

let difficulty = DIFFICULTY.MIN
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
      k.text('install'),
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

  function toggleDisabled (control, disabled) {
    control.color.a = disabled ? 0.5 : 1
  }

  function updateInfo () {
    info.setText([
      `Difficulty: ${difficulty}`,
      `Highscore: ${highscore}`
    ])

    k.every('difficulty+', control => {
      toggleDisabled(control, difficulty === DIFFICULTY.MAX)
    })

    k.every('difficulty-', control => {
      toggleDisabled(control, difficulty === DIFFICULTY.MIN)
    })
  }

  function setDifficulty (value) {
    difficulty = cap(value, DIFFICULTY.MIN, DIFFICULTY.MAX)
    updateInfo()
  }

  function initMobileControls () {
    k.addInfo([
      k.text('+', 32),
      k.origin('topright'),
      'control',
      'difficulty+'
    ], -20, 20).clicks(() => {
      setDifficulty(difficulty + 1)
    })

    k.addInfo([
      k.text('-', 32),
      k.origin('topleft'),
      'control',
      'difficulty-'
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

    k.every('control', control => {
      control.area = scaleArea(control.area, 1.4).area
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
