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
} from '../constants'

import { k } from '../game'
import { develop } from '../config'
import { capAbs, toggleMouseClass } from '../util'

export default function gameScene (
  difficulty,
  mouseControl,
  vibrationEnabled
) {
  const music = k.play('soundtrack')
  let isWrecked = false
  let hasShield = false
  let collected = 0
  let smashed = 0

  music.loop()

  k.layers([
    'gui',
    'background',
    'game'
  ], 'game')

  k.addGUI([
    k.text('G'),
    k.origin('botright')
  ], -10, -10, 0.5)

  const score = k.addGUI([
    k.text(),
    { value: 0 }
  ], 10, 10)

  const gravity = k.addGUI([
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

  function addScore (value, extra, pos = ship.pos) {
    if (extra) {
      value *= difficulty
      k.spawnScore(value, pos)
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

  function smashDebris (debris) {
    smashed++
    debris.color = k.rgba(1, 0.5, 0)
    debris.direction = debris.direction * -2

    k.play('crash')
    debris.use(k.layer('background'))
    addScore(SCORE.DEBRIS * smashed, true, debris.pos)
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

  function destroySatellites () {
    k.every('satellite', satellite => {
      satellite.use([
        k.layer('background'),
        k.decay(DECAY.SAT),
        'fading'
      ])
    })
  }

  function sustainFlame () {
    const lastFlame = k.get('flame').pop()

    if (!lastFlame || lastFlame.age() > THROTTLE.FLAME) {
      k.spawnFlame(ship, hasShield)
    }
  }

  function ignite () {
    if (ship.pos.y < 0) {
      return
    }

    ship.jump()
    k.spawnFlame(ship, hasShield)
  }

  function shake (value) {
    k.camShake(value)

    if (vibrationEnabled) {
      navigator.vibrate([value * 10])
    }
  }

  ship.action(() => {
    if (ship.pos.y >= k.height()) {
      return k.destroy(ship)
    }

    if (isWrecked) {
      return k.spawnFire(ship)
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
    collected++
    ship.jump(gravity.value * FACTOR.BOOST)
    k.destroy(boost)
    k.destroyAll('shield')
    k.play('booster')
    k.spawnSpark(boost)
    shake(SHAKE.BOOST)
    addScore(SCORE.BOOST * collected, true)
    addGravity(
      (INITIAL_GRAVITY - gravity.value) *
      difficulty * FACTOR.BOOST
    )

    if (isWrecked) {
      return
    }

    k.spawnShield(ship)

    if (boost.extra) {
      k.spawnSatellite(ship)
    }
  })

  ship.collides('debris', debris => {
    shake(SHAKE.DEBRIS)

    if (hasShield) {
      return smashDebris(debris)
    }

    isWrecked = true
    ship.jump(INITIAL_GRAVITY)
    ship.use(k.spin(SPIN.DEBRIS))
    k.spawnInfo('FUCK', 32)
    k.play('crash', { volume: 2 })
    k.destroy(debris)
    destroySatellites()
  })

  ship.on('destroy', () => {
    music.stop()
    k.play('gameover')
    k.go('death', score.value, isWrecked)
  })

  k.collides('debris', 'satellite', (debris, satellite) => {
    smashDebris(debris)
    k.destroy(satellite)
  })

  k.action('star', star => {
    star.pos.y -= star.age() / gravity.value * star.color.a

    if (star.pos.y < -star.height) {
      k.destroy(star)
      k.spawnStar()
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
    fire.scale = heat
  })

  k.action('tail', tail => {
    const { r, g, b } = tail.color

    tail.color = k.rgba(r, g, b, tail.decay)
    tail.scale = k.vec2(tail.decay, tail.decay)
  })

  k.action('pulse', pulse => {
    pulse.scale = Math.cos(pulse.angle)
  })

  k.action('spark', spark => {
    spark.color.a = spark.decay
  })

  k.action('fading', fading => {
    fading.color.a = fading.decay
    fading.scale = 1.2 - fading.decay / 5
  })

  k.action('debris', debris => {
    if (debris.pos.y > k.height() + debris.height) {
      smashed = 0
      return k.destroy(debris)
    }

    debris.move(
      MOVE.DEBRIS.X *
      debris.direction,
      MOVE.DEBRIS.Y /
      difficulty -
      k.diagonal(debris.area)
    )

    k.spawnTail(debris)
  })

  k.action('shield', shield => {
    music.detune(DETUNE * shield.decay)
  })

  k.action('satellite', satellite => {
    if (!satellite.is('fading')) {
      k.spawnTail(satellite)
    }
  })

  k.on('add', 'boost', boost => {
    k.wait(TIME.BOOST, () => {
      if (!boost.exists()) {
        return
      }

      collected = 0
      k.destroy(boost)
      destroySatellites()
    })

    if (boost.extra) {
      k.spawnPulse(boost)
    }
  })

  k.on('destroy', 'boost', () => {
    k.wait(TIME.BOOST, () => {
      k.spawnBoost(collected)
    })
  })

  k.on('add', 'shield', () => {
    hasShield = true
    music.detune(DETUNE)
  })

  k.on('destroy', 'shield', () => {
    hasShield = false
    music.detune(0)
  })

  k.gravity(INITIAL_GRAVITY)
  k.camIgnore(['gui'])

  k.loop(1 / difficulty, unlessWrecked(() => {
    addScore(1)
    addGravity(FACTOR.GRAVITY)
  }))

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

  k.wait(TIME.BOOST, () => {
    k.spawnBoost(collected)
  })

  k.loop(TIME.DEBRIS, k.spawnDebris)
  toggleMouseClass(mouseControl)

  for (let i = 0; i < STARS; i++) {
    k.spawnStar(k.rand(0, k.height()))
  }

  if (!develop) {
    return
  }

  for (let i = 0; i < 10; i++) {
    k.keyPress(`${i}`, () => {
      collected = i
    })
  }

  k.keyPress('k', () => {
    isWrecked = true
    ship.jump(INITIAL_GRAVITY)
    ship.use(k.spin(SPIN.DEBRIS))
  })
}
