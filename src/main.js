const k = window.k = window.kaboom
let difficulty = 1
let lastScore = 0
let highscore = 0

const MOVE = {
  X: 100,
  Y: 10
}

const SIZE = {
  GAME: { X: 800, Y: 800 },
  SHIP: { X: 20, Y: 40 },
  BOOST: { X: 10, Y: 10 },
  FLAME: { X: 20, Y: 5 },
  STAR: { X: 5, Y: 5 }
}

const TIME = {
  BOOST: 5
}

const FACTOR = {
  GRAVITY: 100,
  SCORE: 20
}

const INITIAL_GRAVITY = 1000
const STARS = 10
const CAM_THRESHOLD = 20
const JUMP_FORCE = 480

function spawn (components) {
  const spawned = Date.now()

  return k.add([...components, {
    getAge: () => Date.now() - spawned
  }])
}

function join (lines, spacing = 1) {
  return lines.join('\n'.repeat(spacing + 1))
}

function addInfo (components, x, y, s = 1) {
  const width = k.width()
  const height = k.height()

  return k.add([
    k.pos((width + x) % width, (height + y) % height),
    k.color(s, s, s),
    k.layer('info'),
    ...components
  ])
}

k.init({
  width: SIZE.GAME.X,
  height: SIZE.GAME.Y
})

k.scene('start', () => {
  const info = k.add([
    k.text(),
    k.pos(200, 300)
  ])

  function updateInfo () {
    info.text = join([
      `Difficulty: ${difficulty}`,
      `Highscore: ${highscore}`
    ])
  }

  k.add([
    k.text(join([
      'Press SPACE to start falling!',
      'Use UP and DOWN to adjust the difficulty.'
    ], 2)),
    k.pos(200, 200)
  ])

  k.keyPress('space', () => {
    k.go('main')
  })

  k.keyPress('up', () => {
    difficulty = Math.min(10, difficulty + 1)
    updateInfo()
  })

  k.keyPress('down', () => {
    difficulty = Math.max(1, difficulty - 1)
    updateInfo()
  })

  updateInfo()
})

k.scene('main', () => {
  lastScore = 0

  k.layers([
    'info',
    'background',
    'game'
  ], 'game')

  addInfo([
    k.text('G'),
    k.origin('botright')
  ], -10, -10, 0.5)

  const score = addInfo([
    k.text(),
    { value: 0 }
  ], 10, 10)

  const gravity = addInfo([
    k.rect(10, 0),
    k.origin('botright'),
    { value: INITIAL_GRAVITY }
  ], -10, -25, 0.5)

  const ship = k.add([
    k.body({ jumpForce: JUMP_FORCE }),
    k.pos(k.width() / 2, k.height() / 1.5),
    k.rect(SIZE.SHIP.X, SIZE.SHIP.Y),
    k.color(1, 1, 1),
    k.rotate(0),
    k.origin('center')
  ])

  function addScore (value) {
    score.value += value
    score.text = score.value
  }

  function addGravity (value) {
    gravity.value = Math.max(INITIAL_GRAVITY, gravity.value + value)
    gravity.height = (gravity.value - INITIAL_GRAVITY) / 100
    k.gravity(gravity.value)
  }

  function rotate () {
    const width = k.width()
    ship.angle = (ship.pos.x - width / 2) / -width
  }

  function adjustCam () {
    const delta = Math.min(0, ship.pos.y - CAM_THRESHOLD)
    k.camPos(k.camPos().x, k.height() / 2 + delta)
  }

  function spawnBoost () {
    const boost = k.add([
      k.rect(SIZE.BOOST.X, SIZE.BOOST.Y),
      k.pos(
        k.rand(0, k.width() - SIZE.BOOST.X),
        k.rand(0, k.height() - SIZE.BOOST.Y)
      ),
      k.color(0, 1, 0.5),
      k.rotate(0),
      k.origin('center'),
      'boost'
    ])

    k.wait(TIME.BOOST, () => k.destroy(boost))
  }

  function spawnFlame () {
    spawn([
      k.rect(SIZE.FLAME.X, SIZE.FLAME.Y),
      k.pos(ship.pos.x, ship.pos.y + ship.areaHeight()),
      k.rotate(ship.angle),
      k.color(1, 1, 0),
      k.layer('background'),
      k.origin('center'),
      'flame'
    ])
  }

  function spawnStar (y = 0) {
    spawn([
      k.rect(SIZE.STAR.X, SIZE.STAR.Y),
      k.pos(
        k.rand(0, k.width() - SIZE.STAR.X),
        k.height() * 1.5 - k.camPos().y - y
      ),
      k.color(1, 1, 1, k.rand(0.1, 0.9)),
      k.layer('background'),
      'star'
    ])
  }

  ship.action(() => {
    if (ship.pos.y >= k.height()) {
      lastScore = score.value
      k.go('death')
    } else {
      rotate()
      adjustCam()
    }
  })

  ship.collides('boost', boost => {
    k.destroy(boost)
    ship.jump(gravity.value / 2)
    addScore(difficulty * FACTOR.SCORE)
    addGravity((INITIAL_GRAVITY - gravity.value) / 2)
  })

  k.action('star', star => {
    star.pos.y -= star.getAge() / gravity.value * star.color.a

    if (star.pos.y < -star.areaHeight()) {
      k.destroy(star)
      spawnStar()
    }
  })

  k.action('flame', flame => {
    const delta = 1 - flame.getAge() / 1000
    flame.color = k.rgba(1, delta, 0, delta)

    if (delta <= 0) {
      k.destroy(flame)
    }
  })

  k.action('boost', boost => {
    boost.angle -= k.dt() * gravity.value / 1000
  })

  k.gravity(INITIAL_GRAVITY)
  k.camIgnore(['info'])

  k.loop(1 / difficulty, () => {
    addScore(1)
    addGravity(FACTOR.GRAVITY)
  })

  k.keyPress('space', () => {
    if (ship.pos.y < 0) {
      return
    }

    ship.jump()
    spawnFlame()
  })

  k.keyDown('left', () => {
    if (ship.pos.x > 0) {
      ship.move(-MOVE.X, MOVE.Y)
    }
  })

  k.keyDown('right', () => {
    if (ship.pos.x < k.width()) {
      ship.move(MOVE.X, MOVE.Y)
    }
  })

  k.on('destroy', 'boost', () => {
    k.wait(TIME.BOOST, spawnBoost)
  })

  k.wait(TIME.BOOST, spawnBoost)

  for (let i = 0; i < STARS; i++) {
    spawnStar(k.rand(0, k.height()))
  }
})

k.scene('death', () => {
  k.add([
    k.text(join([
      'Gravity ate you up!',
      `Your score was ${lastScore}.`
    ], 2)),
    k.pos(200, 200)
  ])

  highscore = Math.max(lastScore, highscore)
  k.wait(3, () => k.go('start'))
})

k.start('start')
