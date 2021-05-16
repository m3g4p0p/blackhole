import { DECAY, SIZE, SPIN, THRESH } from '../constants'
import { findMissing } from '../util'

export default function spawnPlugin (k) {
  function spawnBoost (collected) {
    const extra = collected % THRESH.SAT === THRESH.SAT - 1

    return k.add([
      k.rect(SIZE.BOOST.X, SIZE.BOOST.Y),
      k.pos(
        k.rand(0, k.width() - SIZE.BOOST.X),
        k.rand(0, k.height() - SIZE.BOOST.Y)
      ),
      k.color(0, 1, 0.5),
      k.spin(SPIN.BOOST / Math.sqrt(collected + 1)),
      'boost',
      { extra }
    ])
  }

  function spawnDebris () {
    const posX = k.rand(0, k.width())
    const direction = k.rand(0, Math.sign(k.width() / 2 - posX))
    const width = k.rand(SIZE.DEBRIS.MIN.X, SIZE.DEBRIS.MAX.X)
    const height = k.rand(SIZE.DEBRIS.MIN.Y, SIZE.DEBRIS.MAX.Y)
    const spin = SPIN.DEBRIS * Math.sign(width - height)

    return k.add([
      k.rect(width, height),
      k.pos(posX, -k.height()),
      k.color(1, 1, 1),
      k.body(),
      k.spin(spin),
      'debris',
      { direction }
    ])
  }

  function spawnFire (ship) {
    return k.add([
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

  function spawnFlame (ship, hasShield) {
    const offset = k.rotateVec(0, ship.height / 2, -ship.angle)
    const direction = k.rotateVec(0, SIZE.FLAME.Y, -ship.angle).x

    return k.add([
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

  function spawnInfo (
    text,
    size = 24,
    pos = k.center()
  ) {
    const factor = Math.max(1, text.length / THRESH.INFO)

    return k.add([
      k.text(text, size),
      k.color(1, 1, 0),
      k.scale(1),
      k.decay(DECAY.INFO * factor),
      k.pos(pos),
      k.origin('center'),
      'fading'
    ])
  }

  function spawnPulse (boost) {
    const { r, g, b } = boost.color

    return k.add([
      k.rect(1, k.height()),
      k.color(r, g, b, 0.5),
      k.scale(0),
      k.sync(boost),
      'pulse'
    ])
  }

  function spawnSatellite (ship) {
    const existing = k.get('satellite').map(({ index }) => index)
    const index = findMissing(existing)

    return k.add([
      k.rect(SIZE.SAT.X, SIZE.SAT.Y),
      k.color(0, 1, 1),
      k.spin(SPIN.SAT, Math.PI * 2 / (index + 1)),
      k.orbit(ship, SIZE.SHIP.X * index + SIZE.SHIP.Y * 2),
      'satellite',
      { index }
    ])
  }

  function spawnScore (value, pos) {
    return spawnInfo(`${value}`, 15 + value / 10, pos)
  }

  function spawnShield (ship) {
    return k.add([
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

  function spawnSpark (boost) {
    const { r, g, b } = boost.color
    const center = boost.pos

    return k.add([
      k.rect(boost.width / 2, boost.height / 2),
      k.color(r, g, b),
      k.pos(center),
      k.spin(SPIN.SPARK),
      k.decay(DECAY.SPARK),
      'spark',
      { center }
    ])
  }

  function spawnStar (y = 0) {
    return k.add([
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

  function spawnTail (object) {
    const { r, g, b } = object.color

    return k.add([
      k.scale(1),
      k.color(r / 2, g / 2, b / 2),
      k.pos(object.pos),
      k.rect(object.width, object.height),
      k.rotate(object.angle),
      k.origin('center'),
      k.layer('background'),
      k.decay(DECAY.TAIL),
      'tail'
    ])
  }

  return {
    spawnBoost,
    spawnDebris,
    spawnFire,
    spawnFlame,
    spawnInfo,
    spawnPulse,
    spawnSatellite,
    spawnScore,
    spawnShield,
    spawnSpark,
    spawnStar,
    spawnTail
  }
}
