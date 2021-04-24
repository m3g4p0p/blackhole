import './vendor/kaboom.js'
import { spawnPlugin, displayPlugin } from './plugins.js'
import { delta } from './components.js'

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
    MIN: { X: 10, Y: 10 },
    MAX: { X: 25, Y: 25 }
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

const DECAY = {
  FLAME: 1000,
  FIRE: 500,
  TAIL: 200
}

const THROTTLE = {
  FLAME: 40
}

const INITIAL_GRAVITY = 1000
const STARS = 10
const CAM_THRESHOLD = 20
const JUMP_FORCE = 480

const isMobile = (
  window.innerWidth < SIZE.GAME.X ||
  window.innerHeight < SIZE.GAME.Y
)

const k = window.k = window.kaboom({
  fullscreen: isMobile,
  width: isMobile ? null : SIZE.GAME.X,
  height: isMobile ? null : SIZE.GAME.Y,
  plugins: [spawnPlugin, displayPlugin]
})

const textLeft = isMobile ? 20 : 200
let difficulty = 1
let highscore = 0

function cap (value, absMax) {
  return Math.max(absMax, Math.abs(value)) * Math.sign(value)
}

function rotate (x, y, angle) {
  return k.vec2(
    x * Math.cos(angle) - y * Math.sin(angle),
    x * Math.sin(angle) + y * Math.cos(angle)
  )
}

function toggleMouseClass (value) {
  document.body.classList.toggle('mouse-control', value)
}

k.scene('start', () => {
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

  if (isMobile) {
    k.add([
      k.text('+', 32),
      k.origin('topright'),
      k.pos(k.width() - 20, 20)
    ]).clicks(() => {
      setDificulty(difficulty + 1)
    })

    k.add([
      k.text('-', 32),
      k.origin('topleft'),
      k.pos(20, 20)
    ]).clicks(() => {
      setDificulty(difficulty - 1)
    })

    k.add([
      k.text('START', 32),
      k.origin('top'),
      k.pos(k.width() / 2, 20)
    ]).clicks(() => {
      k.go('main', true)
    })
  } else {
    k.addMessage([
      'Press SPACE to start falling!',
      'Use UP and DOWN to adjust the difficulty.'
    ], textLeft, 200, 2)
  }

  k.keyPress('space', () => {
    k.go('main', false)
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
})

k.scene('main', mouseControl => {
  let isWrecked = false

  k.layers([
    'info',
    'background',
    'game'
  ], 'game')

  k.addInfo([
    k.text('G'),
    k.origin('botright')
  ], -10, -10, 0.5)

  const score = k.addInfo([
    k.text(),
    { value: 0 }
  ], 10, 10)

  const gravity = k.addInfo([
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
    k.origin('center'),
    delta()
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

  function rotateShip () {
    const width = k.width()
    ship.angle = (ship.pos.x - width / 2) / -width
  }

  function ignite () {
    if (ship.pos.y < 0) {
      return
    }

    ship.jump()
    spawnFlame()
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

    boost.on('destroy', () => {
      k.wait(TIME.BOOST, spawnBoost)
    })

    k.wait(TIME.BOOST, () => {
      k.destroy(boost)
    })
  }

  function spawnFlame () {
    const offset = rotate(0, ship.height / 2, -ship.angle)
    const spin = rotate(0, SIZE.FLAME.Y, -ship.angle).x

    k.spawn([
      k.rect(SIZE.FLAME.X, SIZE.FLAME.Y),
      k.pos(ship.pos.add(offset)),
      k.rotate(ship.angle),
      k.color(1, 1, 0),
      k.scale(1),
      k.layer('background'),
      k.origin('center'),
      'flame',
      { spin }
    ])
  }

  function spawnFire () {
    k.spawn([
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
    k.spawn([
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

  function spawnTail (debris) {
    k.spawn([
      k.scale(1),
      k.color(0.5, 0.5, 0.5),
      k.pos(debris.pos),
      k.rect(debris.width, debris.height),
      k.rotate(debris.angle),
      k.origin('center'),
      k.layer('background'),
      'tail'
    ])
  }

  function spawnDebris () {
    const posX = k.rand(0, k.width())
    const direction = k.rand(0, Math.sign(k.width() / 2 - posX))

    k.add([
      k.rect(
        k.rand(SIZE.DEBRIS.MIN.X, SIZE.DEBRIS.MAX.X),
        k.rand(SIZE.DEBRIS.MIN.Y, SIZE.DEBRIS.MAX.Y)
      ),
      k.pos(posX, -k.height()),
      k.color(1, 1, 1),
      k.rotate(0),
      k.origin('center'),
      k.body(),
      'debris',
      { direction }
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

  function sustainFlame () {
    const lastFlame = k.get('flame').pop()

    if (!lastFlame || lastFlame.getAge() > THROTTLE.FLAME) {
      spawnFlame()
    }
  }

  ship.action(() => {
    if (ship.pos.y >= k.height()) {
      return k.go('death', score.value, isWrecked)
    }

    if (isWrecked) {
      addGravitySpin(ship, SPIN.DEBRIS)
      return spawnFire()
    }

    if (mouseControl) {
      followMouse()
    }

    if (ship.delta.y < -1) {
      sustainFlame()
    }

    adjustCam()
    rotateShip()
  })

  ship.on('update', console.log)

  ship.collides('boost', boost => {
    k.destroy(boost)
    ship.jump(gravity.value / 2)
    addScore(difficulty * FACTOR.SCORE)
    addGravity((INITIAL_GRAVITY - gravity.value) / 2)
  })

  ship.collides('debris', debris => {
    isWrecked = true

    ship.jump(INITIAL_GRAVITY)
    k.destroy(debris)
  })

  k.action('star', star => {
    star.pos.y -= star.getAge() / gravity.value * star.color.a

    if (star.pos.y < -star.height) {
      k.destroy(star)
      spawnStar()
    }
  })

  k.withAgeDelta('flame', (flame, delta) => {
    flame.color = k.rgba(1, delta, 0, delta)
    flame.scale = k.vec2(0.5 + delta / 2, 1)
    flame.pos.x += flame.spin
  }, DECAY.FLAME)

  k.withAgeDelta('fire', (fire, delta) => {
    const heat = delta - k.rand(0, delta)

    fire.color = k.rgba(heat, k.rand(0, heat / 2), 0, delta)
    fire.angle += k.dt()
  }, DECAY.FIRE)

  k.withAgeDelta('tail', (tail, delta) => {
    tail.color = k.rgba(0.5, 0.5, 0.5, delta)
    tail.scale = k.vec2(delta, delta)
  }, DECAY.TAIL)

  k.action('boost', boost => {
    addGravitySpin(boost, SPIN.BOOST)
  })

  k.action('debris', debris => {
    if (debris.pos.y > k.height() + debris.height) {
      return k.destroy(debris)
    }

    addGravitySpin(debris, SPIN.DEBRIS * Math.sign(
      debris.width - debris.height
    ))

    debris.move(
      debris.direction *
      MOVE.DEBRIS.X,
      -MOVE.DEBRIS.Y /
      difficulty -
      debris.area.p1.dist(debris.area.p2)
    )

    spawnTail(debris)
  })

  k.gravity(INITIAL_GRAVITY)
  k.camIgnore(['info'])

  k.loop(1 / difficulty, () => {
    addScore(1)
    addGravity(FACTOR.GRAVITY)
  })

  k.mouseClick(unlessWrecked(() => {
    if (!mouseControl) {
      toggleMouseClass(mouseControl = true)
    }

    ignite()
  }))

  k.keyPress('space', unlessWrecked(ignite))

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

  k.loop(TIME.DEBRIS, spawnDebris)
  k.wait(TIME.BOOST, spawnBoost)
  toggleMouseClass(mouseControl)

  for (let i = 0; i < STARS; i++) {
    spawnStar(k.rand(0, k.height()))
  }
})

k.scene('death', (score, gotWrecked) => {
  k.addMessage([
    gotWrecked
      ? 'Wrecked by space debris!'
      : k.choose([
        'Gravity ate you up!',
        'Newton fucked you!',
        'There\'s no light at the end of the wormhole!',
        'You could not resist the force of gravity!'
      ]),
    `Your score was ${score}.`
  ], textLeft, 200, 2)

  highscore = Math.max(score, highscore)
  k.wait(3, () => k.go('start'))
  toggleMouseClass(false)
})

k.start('start')
document.body.classList.toggle('is-fullscreen', isMobile)
