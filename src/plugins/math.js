export default function mathPlugin (k) {
  function center () {
    return k.vec2(k.width() / 2, k.height() / 2)
  }

  function rotateVec (x, y, angle) {
    return k.vec2(
      x * Math.cos(angle) - y * Math.sin(angle),
      x * Math.sin(angle) + y * Math.cos(angle)
    )
  }

  return { center, rotateVec }
}
