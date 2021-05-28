import { k, padding } from '../game'

export default function creditsScene () {
  k.addMessage([
    'code by m3g4p0p',
    'sound by robo',
    '',
    'copyright 2021'
  ], padding, padding)

  k.mouseClick(() => {
    k.go('start')
  })
}
