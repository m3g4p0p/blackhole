import { k } from './game.js'

export function cap (value, absMax) {
  return Math.max(absMax, Math.abs(value)) * Math.sign(value)
}

export function rotate (x, y, angle) {
  return k.vec2(
    x * Math.cos(angle) - y * Math.sin(angle),
    x * Math.sin(angle) + y * Math.cos(angle)
  )
}

export function toggleMouseClass (value) {
  document.body.classList.toggle('mouse-control', value)
}

export function hideAddressBar () {
  window.scrollTo(0, 1)
}
