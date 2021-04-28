import {
  CAM_THRESHOLD,
  FACTOR,
  INITIAL_GRAVITY,
  JUMP_FORCE,
  DECAY,
  MOVE,
  SHAKE,
  SIZE,
  SPIN,
  STARS,
  THROTTLE,
  TIME
} from '../constants.js'

import { k } from '../game.js'
import { cap, rotate, toggleMouseClass } from '../util.js'

export default function gameScene (difficulty, mouseControl) {
  const music = k.play('soundtrack')
  let isWrecked = false
  let hasShield = false

  music.loop()

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
    k.delta()
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

    k.add([
      k.rect(SIZE.FLAME.X, SIZE.FLAME.Y),
      k.pos(ship.pos.add(offset)),
      k.rotate(ship.angle),
      k.color(
        hasShield ? 0 : 1,
        1,
        hasShield ? 1 : 0
      ),
      k.scale(1),
      k.layer('background'),
      k.origin('center'),
      k.decay(DECAY.FLAME),
      'flame',
      { spin }
    ])
  }

  function spawnFire () {
    k.add([
      k.rect(ship.width, ship.width),
      k.pos(ship.pos.x, ship.pos.y),
      k.rotate(0),
      k.color(1, 0, 0),
      k.layer('background'),
      k.origin('center'),
      k.decay(DECAY.FIRE),
      'fire'
    ])
  }

  function spawnStar (y = 0) {
    k.add([
      k.rect(SIZE.STAR.X, SIZE.STAR.Y),
      k.pos(
        k.rand(0, k.width() - SIZE.STAR.X),
        k.height() * 1.5 - k.camPos().y - y
      ),
      k.color(1, 1, 1, k.rand(0.1, 0.9)),
      k.layer('background'),
      k.age(),
      'star'
    ])
  }

  function spawnTail (debris) {
    k.add([
      k.scale(1),
      k.color(0.5, 0.5, 0.5),
      k.pos(debris.pos),
      k.rect(debris.width, debris.height),
      k.rotate(debris.angle),
      k.origin('center'),
      k.layer('background'),
      k.decay(DECAY.TAIL),
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

  function spawnShield () {
    k.destroyAll('shield')

    hasShield = true
    music.detune(100)

    const shield = k.add([
      k.rect(SIZE.SHIELD.X, SIZE.SHIELD.Y),
      k.pos(ship.pos),
      k.color(0, 1, 1),
      k.rotate(ship.angle),
      k.origin('center'),
      k.layer('background'),
      k.decay(DECAY.SHIELD),
      'shield'
    ])

    shield.on('destroy', () => {
      hasShield = false
      music.detune(0)
    })
  }

  function smashDebris (debris) {
    debris.color = k.rgba(1, 0.5, 0)
    debris.direction = debris.direction * -2
    addScore(difficulty * FACTOR.SCORE.DEBRIS)
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

    if (!lastFlame || lastFlame.age() > THROTTLE.FLAME) {
      spawnFlame()
    }
  }

  function ignite () {
    if (ship.pos.y < 0) {
      return
    }

    ship.jump()
    spawnFlame()
  }

  function die () {
    music.stop()
    k.play('gameover')
    k.go('death', score.value, isWrecked)
  }

  ship.action(() => {
    if (ship.pos.y >= k.height()) {
      return die()
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

  ship.collides('boost', boost => {
    ship.jump(gravity.value / 2)
    k.destroy(boost)
    k.camShake(SHAKE.BOOST)
    addScore(difficulty * FACTOR.SCORE.BOOST)
    addGravity((INITIAL_GRAVITY - gravity.value) / 2)

    if (!isWrecked) {
      spawnShield()
    }
  })

  ship.collides('debris', debris => {
    k.camShake(SHAKE.DEBRIS)

    if (hasShield) {
      return smashDebris(debris)
    }

    isWrecked = true
    ship.jump(INITIAL_GRAVITY)
    k.destroy(debris)
  })

  k.action('star', star => {
    star.pos.y -= star.age() / gravity.value * star.color.a

    if (star.pos.y < -star.height) {
      k.destroy(star)
      spawnStar()
    }
  })

  k.action('flame', flame => {
    const { r, b } = flame.color

    flame.color = k.rgba(r, flame.decay, b, flame.decay)
    flame.scale = k.vec2(0.5 + flame.decay / 2, 1)
    flame.pos.x += flame.spin
  })

  k.action('fire', fire => {
    const heat = fire.decay - k.rand(0, fire.decay)

    fire.color = k.rgba(heat, k.rand(0, heat / 2), 0, fire.decay)
    fire.angle += k.dt()
  })

  k.action('tail', tail => {
    tail.color = k.rgba(0.5, 0.5, 0.5, tail.decay)
    tail.scale = k.vec2(tail.decay, tail.decay)
  })

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

  k.action('shield', shield => {
    shield.pos = ship.pos
    shield.angle = ship.angle
    shield.color.a = shield.decay
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
}
