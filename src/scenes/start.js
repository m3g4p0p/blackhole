import { DIFFICULTY } from '../constants.js'
import { k, blackhole, isMobile, padding } from '../game.js'
import { cap, requestFullscreen, getHighscore } from '../util.js'

let difficulty = DIFFICULTY.MIN
let highscore = getHighscore()
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

  if (!blackhole) {
    return
  }

  k.render(() => {
    if (promptText || !deferredPrompt) {
      return
    }

    promptText = k.addGUI([
      k.text('install'),
      k.origin('bot'),
      'control'
    ], 0.5, -padding)

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
  const sound = k.addGUI([
    k.text('sound', 16),
    k.origin('topleft'),
    'control'
  ], padding, 100)

  const vibration = k.addGUI([
    k.text('shake', 16),
    k.origin('topright'),
    'control'
  ], -padding, 100)

  sound.clicks(() => {
    const volume = k.volume((k.volume() + 1) % 2)
    toggleDisabled(sound, volume === 0)
  })

  vibration.clicks(() => {
    vibrationEnabled = !vibrationEnabled
    toggleDisabled(vibration, !vibrationEnabled)
  })

  toggleDisabled(sound, k.volume() === 0)
  toggleDisabled(vibration, !vibrationEnabled)
}

function addPadding () {
  const height = k.height()

  k.add([
    k.rect(padding, height),
    k.pos(0, 0),
    k.color(0, 0, 0)
  ])

  k.add([
    k.rect(padding, height),
    k.pos(k.width(), 0),
    k.color(0, 0, 0),
    k.origin('right')
  ])
}

export default function startScene (score = 0) {
  const info = k.addMessage([], padding, 200, 1, 12)

  highscore = Math.max(score, highscore)
  localStorage.setItem('highscore', highscore)

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
    k.addGUI([
      k.text('+', 32),
      k.origin('topright'),
      'control',
      'difficulty+'
    ], -padding, padding).clicks(() => {
      setDifficulty(difficulty + 1)
    })

    k.addGUI([
      k.text('-', 32),
      k.origin('topleft'),
      'control',
      'difficulty-'
    ], padding, padding).clicks(() => {
      setDifficulty(difficulty - 1)
    })

    k.addGUI([
      k.text('START', 32),
      k.origin('top'),
      'control'
    ], 0.5, padding).clicks(() => {
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
    ], padding, 300, 2)

    k.mouseClick(() => {
      k.go('main', difficulty, true, false)
    })
  }

  if (blackhole) {
    k.addGUI([
      k.text(blackhole),
      k.origin('botright')
    ], -padding, -padding).clicks(() => {
      window.location.assign('about.html')
    })
  }

  if (isMobile) {
    initMobileControls()
    initInstallButton()
    initInstructions()
    initEffectControls()
  } else {
    initDesktopControls()
  }

  k.every('control', control => {
    const height = k.vec2(0, control.areaHeight())
    control.area.p2 = control.area.p2.add(height)
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
  addPadding()
}
