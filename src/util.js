import { MAX_SCORES } from './constants'
import { develop, endpoint } from './config'

export const logError = develop
  ? console.error
  : console.debug

export function cap (value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function capAbs (value, absMax) {
  return Math.max(absMax, Math.abs(value)) * Math.sign(value)
}

export function hasOwn (object, key) {
  return Object.prototype.hasOwnProperty.call(object, key)
}

export function toggleMouseClass (value) {
  document.body.classList.toggle('mouse-control', value)
}

export function requestFullscreen () {
  if (develop || document.fullscreenElement) {
    return
  }

  const canvas = document.querySelector('canvas')
  canvas.requestFullscreen().catch(logError)
}

export function exitFullscreen () {
  if (!document.fullscreenElement) {
    return
  }

  document.exitFullscreen().catch(logError)
}

export function getLocalHighscore () {
  const highscore = localStorage.getItem('highscore')
  return highscore ? parseInt(highscore, 10) : 0
}

export function findMissing (numbers) {
  const max = Math.max(-1, ...numbers)

  for (let i = 0; i < max; i++) {
    if (!numbers.includes(i)) {
      return i
    }
  }

  return max + 1
}

export async function fetchHighscores (data = null) {
  if (!endpoint) {
    return null
  }

  const url = new URL(endpoint, window.location.href)

  url.search = new URLSearchParams({
    slice: MAX_SCORES
  }).toString()

  const response = await fetch(url, {
    method: data ? 'post' : 'get',
    body: data && JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return response.json()
}
