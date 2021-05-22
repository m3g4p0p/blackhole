/**
 * @param {import('kaboom').KaboomCtx} k
 */
export default function eventsPlugin (k) {
  function initReleaseListeners () {
    const { releaseListeners } = k.sceneData()

    if (releaseListeners) {
      return releaseListeners
    }

    const listeners = new Map()

    k.mouseRelease(() => {
      const pos = k.mousePos()

      k.every('onrelease', control => {
        if (listeners.has(control) && control.hasPt(pos)) {
          listeners.get(control)(control)
        }
      })
    })

    return (k.sceneData().releaseListeners = listeners)
  }

  function onRelease (handler) {
    const listeners = initReleaseListeners()

    return {
      add () {
        this.use('onrelease')
        listeners.set(this, handler)
      }
    }
  }

  return { onRelease }
}
