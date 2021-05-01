import { DIFFICULTY } from '../constants.js'
import { k, isMobile, textLeft } from '../game.js'
import { cap, requestFullscreen, scaleArea } from '../util.js'

let difficulty = DIFFICULTY.MIN
let highscore = 0
let deferredPrompt = null
let vibrationEnabled = true

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault()
  deferredPrompt = event
})

function toggleDisabled (control, disabled) {
  control.color.a = disabled ? 0.5 : 1
}

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

function initInstructions () {
  const instructionText = document
    .getElementById('instructions')
    .textContent
    .replace(/\s+/g, ' ')
    .trim()

  const instructions = k.add([
    k.text(instructionText),
    k.pos(k.width(), 300),
    'instructions'
  ])

  instructions.action(() => {
    instructions.pos.x -= k.dt() * 100

    if (instructions.pos.x < -instructions.areaWidth()) {
      instructions.pos.x = k.width()
    }
  })
}

function initEffectControls () {
  const sound = k.addInfo([
    k.text('sound', 16),
    k.origin('topleft'),
    'control'
  ], 20, 100)

  const vibration = k.addInfo([
    k.text('shake', 16),
    k.origin('topright'),
    'control'
  ], -20, 100)

  sound.clicks(() => {
    toggleDisabled(sound, k.volume((k.volume() + 1) % 2) === 0)
  })

  vibration.clicks(() => {
    vibrationEnabled = !vibrationEnabled
    toggleDisabled(vibration, !vibrationEnabled)
  })

  toggleDisabled(sound, k.volume() === 0)
  toggleDisabled(vibration, !vibrationEnabled)
}

export default function startScene (score = 0) {
  const info = k.addMessage([], textLeft, 200, 1, 12)

  highscore = Math.max(score, highscore)

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
        k.go('main', difficulty, true, vibrationEnabled)
      })

      k.destroy(info)
      k.destroyAll('control')
      k.destroyAll('instructions')
      requestFullscreen()
    })
  }

  function initDesktopControls () {
    k.addMessage([
      'Press SPACE to start falling!',
      'Use UP and DOWN to adjust the difficulty.'
    ], textLeft, 300, 2)

    k.mouseClick(() => {
      k.go('main', difficulty, true, false)
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
    initEffectControls()
    initInstallButton()
    initInstructions()
  } else {
    initDesktopControls()
  }

  k.every('control', control => {
    control.area = scaleArea(control.area, 1.2).area
  })

  k.keyPress('space', () => {
    k.go('main', difficulty, false, false)
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
