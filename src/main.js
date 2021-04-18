const k = window.k = window.kaboom
let difficulty = 1
let highscore = 0
let mouseControl = false

const MOVE = {
  SHIP: { X: 100, Y: 10 },
  DEBRIS: { X: 100, Y: 100 }
}

const SIZE = {
  GAME: { X: 800, Y: 800 },
  SHIP: { X: 20, Y: 40 },
  BOOST: { X: 10, Y: 10 },
  FLAME: { X: 20, Y: 5 },
  STAR: { X: 5, Y: 5 },
  DEBRIS: {
    MIN: { X: 15, Y: 15 },
    MAX: { X: 30, Y: 30 }
  }
}

const TIME = {
  BOOST: 5,
  DEBRIS: 3
}

const FACTOR = {
  GRAVITY: 100,
  SCORE: 20
}

const SPIN = {
  BOOST: -1000,
  DEBRIS: 500
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

function withAgeDelta (fn, scale) {
  return (object) => {
    const delta = 1 - object.getAge() / scale

    if (delta > 0) {
      return fn(object, delta)
    }

    return k.destroy(object)
  }
}

function join (lines, spacing = 1) {
  return lines.join('\n'.repeat(spacing + 1))
}

function cap (value, absMax) {
  return Math.max(absMax, Math.abs(value)) * Math.sign(value)
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
  let isWrecked = false

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

  function addGravitySpin (object, scale) {
    object.angle += k.dt() * gravity.value / scale
  }

  function unlessWrecked (fn) {
    return (...args) => !isWrecked && fn(...args)
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
      k.pos(ship.pos.x, ship.pos.y + ship.height),
      k.rotate(ship.angle),
      k.color(1, 1, 0),
      k.layer('background'),
      k.origin('center'),
      'flame'
    ])
  }

  function spanFire () {
    spawn([
      k.rect(ship.width, ship.width),
      k.pos(ship.pos.x, ship.pos.y),
      k.rotate(0),
      k.color(1, 0, 0),
      k.layer('background'),
      k.origin('center'),
      'fire'
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

  function spawnDebris () {
    k.add([
      k.rect(
        k.rand(SIZE.DEBRIS.MIN.X, SIZE.DEBRIS.MAX.X),
        k.rand(SIZE.DEBRIS.MIN.Y, SIZE.DEBRIS.MAX.Y)
      ),
      k.pos(k.rand(0, k.width()), -k.height()),
      // k.pos(ship.pos.x, -k.height()),
      k.color(1, 1, 1),
      k.rotate(0),
      k.origin('center'),
      k.body(),
      'debris',
      { direction: k.rand(-1, 1) }
      // { direction: 0 }
    ])
  }

  function followMouse () {
    const mousePos = k.mousePos()
    const width = k.width()

    if ((
      mousePos.x < 0 &&
      ship.pos.x < ship.width
    ) || (
      mousePos.x > width &&
      ship.pos.x > width - ship.width
    )) return

    const delta = cap(k.mousePos().sub(ship.pos).x, MOVE.SHIP.X)
    ship.move(delta, MOVE.SHIP.Y * Math.abs(delta) / MOVE.SHIP.X)
  }

  ship.action(() => {
    if (ship.pos.y >= k.height()) {
      return k.go('death', score.value)
    }

    if (isWrecked) {
      addGravitySpin(ship, SPIN.DEBRIS)
      return spanFire()
    }

    if (mouseControl) {
      followMouse()
    }

    rotate()
    adjustCam()
  })

  ship.collides('boost', boost => {
    k.destroy(boost)
    ship.jump(gravity.value / 2)
    addScore(difficulty * FACTOR.SCORE)
    addGravity((INITIAL_GRAVITY - gravity.value) / 2)
  })

  ship.collides('debris', debris => {
    isWrecked = true
    k.destroy(debris)
  })

  k.action('star', star => {
    star.pos.y -= star.getAge() / gravity.value * star.color.a

    if (star.pos.y < -star.height) {
      k.destroy(star)
      spawnStar()
    }
  })

  k.action('flame', withAgeDelta((flame, delta) => {
    flame.color = k.rgba(1, delta, 0, delta)
  }, 1000))

  k.action('fire', withAgeDelta((fire, delta) => {
    fire.color = k.rgba(delta, 0, 0, delta)
    fire.angle += k.dt()
  }, 500))

  k.action('boost', boost => {
    addGravitySpin(boost, SPIN.BOOST)
  })

  k.on('destroy', 'boost', () => {
    k.wait(TIME.BOOST, spawnBoost)
  })

  k.action('debris', debris => {
    if (debris.pos.y > k.height() + debris.height) {
      return k.destroy(debris)
    }

    addGravitySpin(debris, SPIN.DEBRIS * Math.sign(
      debris.width - debris.height
    ))

    debris.move(
      debris.direction * MOVE.DEBRIS.X,
      -MOVE.DEBRIS.Y / difficulty - debris.area.p1.dist(debris.area.p2)
    )
  })

  k.gravity(INITIAL_GRAVITY)
  k.camIgnore(['info'])

  k.loop(1 / difficulty, () => {
    addScore(1)
    addGravity(FACTOR.GRAVITY)
  })

  k.keyPress('space', unlessWrecked(() => {
    if (ship.pos.y < 0) {
      return
    }

    ship.jump()
    spawnFlame()
  }))

  k.keyDown('left', unlessWrecked(() => {
    if (ship.pos.x - ship.width > 0) {
      ship.move(-MOVE.SHIP.X, MOVE.SHIP.Y)
    }
  }))

  k.keyDown('right', unlessWrecked(() => {
    if (ship.pos.x + ship.width < k.width()) {
      ship.move(MOVE.SHIP.X, MOVE.SHIP.Y)
    }
  }))

  k.mouseClick(() => {
    document.body.classList.toggle(
      'mouse-control',
      mouseControl = !mouseControl
    )
  })

  k.loop(TIME.DEBRIS, spawnDebris)
  k.wait(TIME.BOOST, spawnBoost)

  for (let i = 0; i < STARS; i++) {
    spawnStar(k.rand(0, k.height()))
  }
})

k.scene('death', score => {
  k.add([
    k.text(join([
      'Gravity ate you up!',
      `Your score was ${score}.`
    ], 2)),
    k.pos(200, 200)
  ])

  highscore = Math.max(score, highscore)
  k.wait(3, () => k.go('start'))
})

k.start('start')
