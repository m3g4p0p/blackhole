import { fetchHighscores } from '../util'
import { k } from '../game'

export default function highscoreSecene (score) {
  const form = document.createElement('form')
  const input = document.createElement('input')
  let handle = null

  const name = k.addGUI([
    k.text('DUDE!', 48),
    k.origin('bot')
  ], 0.5, 0.5)

  const info = k.addGUI([
    k.text('Highscore!'),
    k.origin('top')
  ], 0.5, 0.6)

  function nextFrame (callback) {
    window.cancelAnimationFrame(handle)
    handle = window.requestAnimationFrame(callback)
  }

  function updateName () {
    name.text = input.value.padEnd(3, '_').split('').join(' ')
  }

  function focusName () {
    input.blur()

    nextFrame(() => {
      input.focus({ preventScroll: true })
    })
  }

  function submit () {
    input.blur()
    document.body.removeChild(form)

    if (!input.value) {
      return k.go('start', score)
    }

    fetchHighscores({
      name: input.value,
      score
    }).finally(() => {
      k.go('start', score)
    })
  }

  input.maxLength = 3
  form.appendChild(input)
  document.body.appendChild(form)
  k.mouseRelease(focusName)

  input.addEventListener('input', () => {
    input.value = input.value
      .slice(0, input.maxLength)
      .toUpperCase()

    updateName()
  })

  form.addEventListener('submit', event => {
    event.preventDefault()
    submit()
  })

  k.wait(1, () => {
    focusName()
  })

  k.wait(2, () => {
    info.text = 'Enter your name!'
    updateName()
  })
}
