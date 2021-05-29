import { MAX_SCORES } from '../constants'
import { k, padding } from '../game'
import { toggleMouseClass, fetchHighscores } from '../util'

export default function deathScene (score, gotWrecked) {
  function next (scene) {
    k.wait(3, () => k.go(scene, score))
  }

  k.addMessage([
    gotWrecked
      ? 'Wrecked by space debris!'
      : k.choose([
        'Gravity ate you up!',
        'Newton fucked you!',
        'There\'s no light at the end of the wormhole!',
        'You could not resist the force of gravity!'
      ]),
    `Your score was ${score}.`
  ], padding, 200, 2)

  fetchHighscores().then(data => {
    if (
      data.length < MAX_SCORES ||
      score > data.pop().score
    ) {
      return next('highscore')
    }

    next('start', score)
  }).catch(() => next('start', score))

  toggleMouseClass(false)
}
