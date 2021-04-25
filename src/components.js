import { k } from './game.js'

export function decay (maxAge) {
  const created = Date.now()

  return {
    life: 1,

    update () {
      this.life = 1 - (Date.now() - created) / maxAge

      if (this.life <= 0) {
        this.use('decayed')
      }
    }
  }
}

export function delta () {
  const lastPos = k.pos()

  return {
    delta: k.vec2(0, 0),

    add () {
      Object.assign(lastPos, this.pos)
    },

    update () {
      this.delta.x = this.pos.x - lastPos.x
      this.delta.y = this.pos.y - lastPos.y
      Object.assign(lastPos, this.pos)
    }
  }
}
