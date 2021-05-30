import { MAX_SCORES } from '../constants'
import { k, padding, isMobile } from '../game'
import { toggleMouseClass, fetchHighscores } from '../util'

export default function deathScene (score, gotWrecked) {
  function goNext (scene) {
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

  toggleMouseClass(false)

  if (!isMobile) {
    return goNext('start')
  }

  fetchHighscores().then(data => {
    if (data && (
      data.length < MAX_SCORES ||
      score > data.pop().score
    )) {
      return goNext('highscore')
    }

    goNext('start')
  }).catch(() => goNext('start'))
}
