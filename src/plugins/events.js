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
          if (!this.layer && skip) {
            skip = false
            done = false
            return
          }

          if (this.isHovered()) {
            if (done) {
              return
            }

            callback.call(this)
            done = once
          } else {
            done = false
          }
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
