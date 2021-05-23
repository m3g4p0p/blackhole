/**
 * @param {import('kaboom').KaboomCtx} k
 */
export default function eventsPlugin (k) {
  function touches (callback, once = true) {
    let skip = true
    let done = false

    return {
      add () {
        k.mouseDown(() => {
          if (skip || done) {
            skip = false
            return
          }

          if (this.isHovered()) {
            callback.call(this)
          }

          done = once
        })

        k.mouseRelease(() => {
          skip = true
          done = false
        })
      }
    }
  }

  return { touches }
}
