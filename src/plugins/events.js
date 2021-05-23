/**
 * @param {import('kaboom').KaboomCtx} k
 */
export default function eventsPlugin (k) {
  function initReleaseListeners () {
    const listeners = new Map()

    k.mouseRelease(() => {
      const pos = k.mousePos()

      k.every('onrelease', control => {
        if (control.hasPt(pos)) {
          listeners.get(control)(control)
        }
      })
    })

    return listeners
  }

  function getReleaseListeners () {
    const { onRelease = initReleaseListeners() } = k.sceneData()
    return (k.sceneData().onRelease = onRelease)
  }

  function onRelease (handler) {
    const listeners = getReleaseListeners()

    return {
      add () {
        this.use(['onrelease'])
        listeners.set(this, handler)
      }
    }
  }

  return { onRelease }
}
