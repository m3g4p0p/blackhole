import {
  fetchHighscores,
  exitFullscreen,
  requestFullscreen,
  logError
} from '../util'

import { k } from '../game'

export default function highscoreSecene (score) {
  const form = document.createElement('form')
  const input = document.createElement('input')

  const name = k.addGUI([
    k.text('DUDE!', 48),
    k.origin('bot')
  ], 0.5, 0.5)

  const info = k.addGUI([
    k.text('Highscore!'),
    k.origin('top')
  ], 0.5, 0.6)

  function updateName () {
    name.text = input.value
      .toUpperCase()
      .padEnd(3, '_')
      .split('')
      .join(' ')
  }

  function focusName () {
    input.focus({ preventScroll: true })
  }

  function goStart (...args) {
    requestFullscreen()
    k.go('start', score, ...args)
  }

  input.maxLength = 3
  form.appendChild(input)
  document.body.appendChild(form)
  k.mouseRelease(focusName)
  exitFullscreen()

  input.addEventListener('input', () => {
    input.value = input.value
      .slice(0, input.maxLength)

    updateName()
  })

  form.addEventListener('submit', event => {
    input.blur()
    document.body.removeChild(form)
    event.preventDefault()

    if (!input.value) {
      return goStart()
    }

    fetchHighscores({
      name: input.value,
      score
    }).then(goStart).catch((error) => {
      logError(error)
      goStart()
    })
  })

  k.wait(1, () => {
    focusName()
  })

  k.wait(2, () => {
    info.text = 'Enter your name!'
    updateName()
  })
}
