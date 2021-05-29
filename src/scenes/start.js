import { DIFFICULTY, MAX_SCORES } from '../constants'
import { blackhole } from '../config'
import { k, isMobile, padding } from '../game'

import {
  cap,
  logError,
  requestFullscreen,
  getLocalHighscore,
  fetchHighscores
} from '../util'

let difficulty = DIFFICULTY.MIN
let highscore = getLocalHighscore()
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
      k.touches(() => {
        deferredPrompt.prompt()

        deferredPrompt.userChoice.then(({ outcome }) => {
          if (outcome === 'accepted') {
            k.destroy(promptText)
            deferredPrompt = null
          }
        })
      }),
      'control'
    ], 0.5, -padding)
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
    k.touches(() => {
      const volume = k.volume((k.volume() + 1) % 2)
      toggleDisabled(sound, volume === 0)
    }),
    'control'
  ], padding, 100)

  const vibration = k.addGUI([
    k.text('shake', 16),
    k.origin('topright'),
    k.touches(() => {
      vibrationEnabled = !vibrationEnabled
      toggleDisabled(vibration, !vibrationEnabled)
    }),
    'control'
  ], -padding, 100)

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

function showHighscores (data) {
  data
    .slice(0, MAX_SCORES)
    .forEach(({ name, score }, index) => {
      k.addGUI([
        k.text(`${name.padEnd(10, ' ')} ${score}`),
        'highscore'
      ], padding, 360 + index * 32)
    })
}

function loadHighscores () {
  fetchHighscores()
    .then(showHighscores)
    .catch(logError)
}

export default function startScene (score = 0, highscores) {
  const info = k.addMessage([], padding, 200, 1, 12)

  highscore = Math.max(score, highscore)
  localStorage.setItem('highscore', highscore)

  function updateInfo () {
    info.setText([
      `Difficulty:     ${difficulty}`,
      `Your highscore: ${highscore}`
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
      k.touches(() => {
        setDifficulty(difficulty + 1)
      }),
      'control',
      'difficulty+'
    ], -padding, padding)

    k.addGUI([
      k.text('-', 32),
      k.origin('topleft'),
      k.touches(() => {
        setDifficulty(difficulty - 1)
      }),
      'control',
      'difficulty-'
    ], padding, padding)

    k.addGUI([
      k.text('START', 32),
      k.origin('top'),
      k.touches(() => {
        k.addCountdown(3, () => {
          k.go('main', difficulty, true, vibrationEnabled)
        })

        k.destroy(info)
        k.destroyAll('control')
        k.destroyAll('instructions')
        k.destroyAll('highscore')
        requestFullscreen()
      }),
      'control'
    ], 0.5, padding)
  }

  function initDesktopControls () {
    k.addMessage([
      'Press SPACE to start falling!',
      'Use UP and DOWN to adjust the difficulty.',
      'Better played on your phone though.'
    ], padding, 300, 2)

    k.mouseClick(() => {
      k.go('main', difficulty, true, false)
    })
  }

  k.layers(['gui'])
  k.camIgnore(['gui'])

  if (isMobile) {
    initMobileControls()
    initInstallButton()
    initInstructions()
    initEffectControls()
  } else {
    initDesktopControls()
  }

  if (blackhole) {
    k.addGUI([
      k.text(blackhole),
      k.origin('botright'),
      k.touches(() => {
        k.go('credits')
      }),
      'control'
    ], -padding, -padding)
  }

  if (highscores) {
    showHighscores(highscores)
  } else {
    loadHighscores()
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
