import { k, develop } from './game.js'

export function cap (value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function capAbs (value, absMax) {
  return Math.max(absMax, Math.abs(value)) * Math.sign(value)
}

export function rotate (x, y, angle) {
  return k.vec2(
    x * Math.cos(angle) - y * Math.sin(angle),
    x * Math.sin(angle) + y * Math.cos(angle)
  )
}

export function scaleArea (area, scale) {
  return k.area(
    area.p1.scale(scale),
    area.p2.scale(scale)
  )
}

export function toggleMouseClass (value) {
  document.body.classList.toggle('mouse-control', value)
}

export function requestFullscreen () {
  if (develop || document.fullscreenElement) {
    return
  }

  const canvas = document.querySelector('canvas')
  canvas.requestFullscreen().catch(console.error)
}
