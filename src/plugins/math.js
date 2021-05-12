export default function mathPlugin (k) {
  function rotateVec (x, y, angle) {
    return k.vec2(
      x * Math.cos(angle) - y * Math.sin(angle),
      x * Math.sin(angle) + y * Math.cos(angle)
    )
  }

  return { rotateVec }
}
