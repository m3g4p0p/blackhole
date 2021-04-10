const k = kaboom
let difficulty = 5

const MOVE = {
  X: 100,
  Y: 10
}

const SIZE = {
  SHIP: { X: 20, Y: 40 },
  BOOST: { X: 10, Y: 10 }
}

const TIME = {
  BOOST: 5
}

const FACTOR = {
  GRAVITY: 100,
  SCORE: 10
}

const GRAVITY = 1000

k.init({
  width: 800,
  height: 800
})

k.scene('start', () => {
  const info = k.add([
    k.text(),
    k.pos(200, 300)
  ])

  function updateInfo () {
    info.text = 'Difficulty: ' + difficulty
  }

  k.add([
    k.text('Press SPACE to start falling'),
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
  let gravity = GRAVITY
  let score = 0

  const info = k.add([
    k.text(''),
    k.pos(10, 10)
  ])

  const ship = k.add([
    k.pos(k.width() / 2, k.height() / 1.5),
    k.body(),
    k.rect(SIZE.SHIP.X, SIZE.SHIP.Y),
    k.color(1, 1, 1)
  ])

  function addScore (value) {
    score += value
    info.text = score
  }

  function spawnBoost () {
    const boost = k.add([
      k.rect(SIZE.BOOST.X, SIZE.BOOST.Y),
      k.color(0, 1, 0.5),
      k.pos(
        k.rand(0, k.width() - SIZE.BOOST.X),
        k.rand(0, k.height() - SIZE.BOOST.Y)
      ),
      'boost'
    ])

    k.wait(TIME.BOOST, () => k.destroy(boost))
  }

  ship.action(() => {
    if (
      ship.pos.y >= k.height() ||
      ship.pos.x < 0 ||
      ship.pos.x >= k.width() - SIZE.SHIP.X
    ) {
      k.go('death')
    }
  })

  ship.collides('boost', boost => {
    addScore(difficulty * FACTOR.SCORE)
    k.destroy(boost)
    ship.jump(gravity)
    gravity = Math.min(GRAVITY, gravity - GRAVITY)
  })

  k.gravity(gravity)

  k.loop(1, () => {
    k.gravity(gravity += difficulty * FACTOR.GRAVITY)
  })

  k.loop(1 / difficulty, () => {
    addScore(1)
  })

  k.keyPress('space', () => {
    ship.jump()
  })

  k.keyDown('left', () => {
    ship.move(-MOVE.X, MOVE.Y)
  })

  k.keyDown('right', () => {
    ship.move(MOVE.X, MOVE.Y)
  })

  k.on('destroy', 'boost', () => {
    k.wait(TIME.BOOST, spawnBoost)
  })

  k.wait(TIME.BOOST, spawnBoost)
})

k.scene('death', () => {
  k.add([
    k.text('Gravity ate you up.'),
    k.pos(200, 200)
  ])

  k.wait(3, () => k.go('start'))
})

k.start('start')
