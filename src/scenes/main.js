import {
  CAM_THRESHOLD,
  DECAY,
  DETUNE,
  FACTOR,
  INITIAL_GRAVITY,
  JUMP_FORCE,
  MOVE,
  SCORE,
  SHAKE,
  SIZE,
  SPIN,
  STARS,
  THROTTLE,
  TIME
} from '../constants.js'

import { k } from '../game.js'
import { capAbs, toggleMouseClass } from '../util.js'

export default function gameScene (
  difficulty,
  mouseControl,
  vibrationEnabled
) {
  const music = k.play('soundtrack')
  let isWrecked = false
  let hasShield = false

  music.loop()

  k.layers([
    'info',
    'background',
    'game'
  ], 'game')

  k.addGUI([
    k.text('G'),
    k.origin('botright'),
    k.layer('info')
  ], -10, -10, 0.5)

  const score = k.addGUI([
    k.text(),
    k.layer('info'),
    { value: 0 }
  ], 10, 10)

  const gravity = k.addGUI([
    k.rect(10, 0),
    k.origin('botright'),
    k.layer('info'),
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

  function addScore (value, extra) {
    if (extra) {
      value *= difficulty
      spawnScore(value)
    }

    score.value += value
    score.text = score.value
  }

  function addGravity (value) {
    gravity.value = Math.max(INITIAL_GRAVITY, gravity.value + value)
    gravity.height = (gravity.value - INITIAL_GRAVITY) / 100
    k.gravity(gravity.value)
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

  function spawnScore (value) {
    k.add([
      k.text(value, 16),
      k.color(1, 1, 0),
      k.scale(1),
      k.decay(DECAY.SCORE),
      k.pos(ship.pos),
      k.origin('center'),
      'fading'
    ])
  }

  function spawnSpark (boost) {
    const { r, g, b } = boost.color
    const center = boost.pos

    const spark = k.add([
      k.rect(boost.width / 2, boost.height / 2),
      k.color(r, g, b),
      k.pos(center),
      k.spin(SPIN.SPARK),
      k.decay(TIME.BOOST * 1000),
      'spark',
      { center }
    ])

    boost.on('destroy', () => {
      k.destroy(spark)
    })
  }

  function spawnBoost () {
    const boost = k.add([
      k.rect(SIZE.BOOST.X, SIZE.BOOST.Y),
      k.pos(
        k.rand(0, k.width() - SIZE.BOOST.X),
        k.rand(0, k.height() - SIZE.BOOST.Y)
      ),
      k.color(0, 1, 0.5),
      k.spin(SPIN.BOOST),
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
    const offset = k.rotateVec(0, ship.height / 2, -ship.angle)
    const direction = k.rotateVec(0, SIZE.FLAME.Y, -ship.angle).x

    k.add([
      k.rect(SIZE.FLAME.X, SIZE.FLAME.Y),
      k.pos(ship.pos.add(offset)),
      k.rotate(ship.angle),
      k.color(...hasShield
        ? [0, 1, 1]
        : [1, 1, 0]
      ),
      k.scale(1),
      k.layer('background'),
      k.origin('center'),
      k.decay(DECAY.FLAME),
      'flame',
      { direction }
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
    const width = k.rand(SIZE.DEBRIS.MIN.X, SIZE.DEBRIS.MAX.X)
    const height = k.rand(SIZE.DEBRIS.MIN.Y, SIZE.DEBRIS.MAX.Y)
    const spin = SPIN.DEBRIS * Math.sign(width - height)

    k.add([
      k.rect(width, height),
      k.pos(posX, -k.height()),
      k.color(1, 1, 1),
      k.body(),
      k.spin(spin),
      'debris',
      { direction }
    ])
  }

  function spawnShield () {
    k.destroyAll('shield')

    k.add([
      k.rect(SIZE.SHIELD.X, SIZE.SHIELD.Y),
      k.color(0, 1, 1),
      k.scale(1),
      k.layer('background'),
      k.decay(DECAY.SHIELD),
      k.sync(ship),
      'shield',
      'fading'
    ])
  }

  function smashDebris (debris) {
    debris.color = k.rgba(1, 0.5, 0)
    debris.direction = debris.direction * -2
    addScore(SCORE.DEBRIS, true)
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

    const delta = capAbs(k.mousePos().sub(ship.pos).x, MOVE.SHIP.X)
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

  function shake (value) {
    k.camShake(value)

    if (vibrationEnabled) {
      navigator.vibrate([value * 10])
    }
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
    const factor = difficulty / 2

    ship.jump(gravity.value * factor)
    k.destroy(boost)
    k.play('booster')
    shake(SHAKE.BOOST)
    addScore(SCORE.BOOST, true)
    addGravity((INITIAL_GRAVITY - gravity.value) * factor)

    if (!isWrecked) {
      spawnShield()
    }
  })

  ship.collides('debris', debris => {
    shake(SHAKE.DEBRIS)

    k.play('crash', {
      volume: hasShield ? 1 : 2
    })

    if (hasShield) {
      return smashDebris(debris)
    }

    isWrecked = true
    ship.jump(INITIAL_GRAVITY)
    ship.use(k.spin(SPIN.DEBRIS))
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
    flame.pos.x += flame.direction
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

  k.action('spark', spark => {
    spark.color.a = spark.decay

    spark.pos = spark.center.add(k
      .rotateVec(SIZE.BOOST.X, SIZE.BOOST.Y, spark.angle)
      .scale(2 - spark.decay * 1.5)
    )
  })

  k.action('debris', debris => {
    if (debris.pos.y > k.height() + debris.height) {
      return k.destroy(debris)
    }

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
    music.detune(DETUNE * shield.decay)
  })

  k.action('fading', fading => {
    fading.color.a = fading.decay
    fading.scale = 1.2 - fading.decay / 5
  })

  k.on('add', 'shield', () => {
    hasShield = true
    music.detune(DETUNE)
  })

  k.on('destroy', 'shield', () => {
    hasShield = false
    music.detune(0)
  })

  k.on('add', 'boost', spawnSpark)
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
