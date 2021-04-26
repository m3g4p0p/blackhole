import { k, isMobile, textLeft } from '../game.js'

let difficulty = 1
let highscore = 0

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
    ], k.width() / 2, 20).clicks(() => {
      k.go('main', difficulty, true)
    })
  } else {
    k.addMessage([
      'Press SPACE to start falling!',
      'Use UP and DOWN to adjust the difficulty.'
    ], textLeft, 200, 2)
  }

  if (window.blackhole) {
    k.addInfo([
      k.text(window.blackhole),
      k.origin('botright')
    ], -20, -20)
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
