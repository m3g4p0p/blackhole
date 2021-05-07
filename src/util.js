import { develop } from './game.js'

export function cap (value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function capAbs (value, absMax) {
  return Math.max(absMax, Math.abs(value)) * Math.sign(value)
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

export function getHighscore () {
  const highscore = localStorage.getItem('highscore')
  return highscore ? parseInt(highscore, 10) : 0
}
