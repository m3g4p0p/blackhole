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
