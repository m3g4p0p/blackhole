/**
 * @param {import('kaboom').KaboomCtx} k
 */
export default function mathPlugin (k) {
  function center () {
    return k.vec2(k.width() / 2, k.height() / 2)
  }

  function rotateVec (vec, angle) {
    const { x, y } = k.vec2(vec)

    return k.vec2(
      x * Math.cos(angle) - y * Math.sin(angle),
      x * Math.sin(angle) + y * Math.cos(angle)
    )
  }

  return { center, rotateVec }
}
