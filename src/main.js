const k = window.kaboom
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

function getVisibleArea () {
  const pos = k.camPos()
  const scale = k.camScale()
  const width = k.width() / scale.x
  const height = k.height() / scale.y

  return k.area(
    pos.sub(width / 2, height / 2),
    pos.add(width / 2, height / 2)
  )
}

function spawn (components) {
  const spawned = Date.now()

  return k.add([...components, {
    getAge: () => Date.now() - spawned
  }])
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
    info.text = `Difficulty: ${difficulty}\n\nHighscore: ${highscore}`
  }

  k.add([
    k.text('Press SPACE to start falling!'),
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

  const score = k.add([
    k.text(''),
    k.pos(10, 10),
    k.layer('info'),
    { value: 0 }
  ])

  const gravity = k.add([
    k.rect(10, 0),
    k.pos(k.width() - 10, k.height() - 10),
    k.origin('botright'),
    k.layer('info'),
    k.color(0.5, 0.5, 0.5),
    { value: INITIAL_GRAVITY }
  ])

  const ship = k.add([
    k.body(),
    k.pos(k.width() / 2, k.height() / 1.5),
    k.rect(SIZE.SHIP.X, SIZE.SHIP.Y),
    k.color(1, 1, 1),
    k.rotate(0)
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

  function ignite () {
    spawn([
      k.rect(SIZE.FLAME.X, SIZE.FLAME.Y),
      k.pos(ship.pos.x, ship.pos.y + ship.areaHeight()),
      k.rotate(ship.angle),
      k.color(1, 1, 0),
      k.layer('background'),
      'flame'
    ])
  }

  function spawnBoost () {
    const boost = k.add([
      k.rect(SIZE.BOOST.X, SIZE.BOOST.Y),
      k.pos(
        k.rand(0, k.width() - SIZE.BOOST.X),
        k.rand(0, k.height() - SIZE.BOOST.Y)
      ),
      k.color(0, 1, 0.5),
      'boost'
    ])

    k.wait(TIME.BOOST, () => k.destroy(boost))
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
    addScore(difficulty * FACTOR.SCORE)
    k.destroy(boost)
    ship.jump(gravity.value / 2)
    addGravity((INITIAL_GRAVITY - gravity.value) / 2)
  })

  k.action('star', star => {
    star.pos.y -= star.getAge() / gravity.value

    if (star.pos.y < star.areaHeight()) {
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
    ignite()
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
    k.text(`Gravity ate you up!\n\nYour score was ${lastScore}.`),
    k.pos(200, 200)
  ])

  highscore = Math.max(lastScore, highscore)
  k.wait(3, () => k.go('start'))
})

k.start('start')
