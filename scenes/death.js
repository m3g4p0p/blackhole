import { k, textLeft } from '../game.js'
import { toggleFullscreen, toggleMouseClass } from '../util.js'

export default function deathScene (score, gotWrecked) {
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
  ], textLeft, 200, 2)

  k.wait(3, () => k.go('start', score))
  toggleFullscreen(false)
  toggleMouseClass(false)
}