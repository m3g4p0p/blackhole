import { k, isMobile, textLeft } from '../game.js'

let difficulty = 1
let highscore = 0
let deferredPrompt

window.addEventListener('beforeinstallprompt', event => {
  console.log(event)
  event.preventDefault()
  deferredPrompt = event
})

export default function startScene (score = 0) {
  const info = k.addMessage([], textLeft, 300)

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
      k.origin('topright')
    ], -20, 20).clicks(() => {
      setDificulty(difficulty + 1)
    })

    k.addInfo([
      k.text('-', 32),
      k.origin('topleft')
    ], 20, 20).clicks(() => {
      setDificulty(difficulty - 1)
    })

    k.addInfo([
      k.text('START', 32),
      k.origin('top')
    ], 0.5, 20).clicks(() => {
      k.go('main', difficulty, true)
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
    ], -20, -20)
  }

  if (deferredPrompt) {
    k.addInfo([
      k.text('install', 16),
      k.origin('bot')
    ], 0.5, -20).clicks(() => {
      deferredPrompt.prompt()
      deferredPrompt = null
    })
  }

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
