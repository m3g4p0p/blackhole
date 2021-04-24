export function spawnPlugin (k) {
  return {
    spawn (components) {
      const spawned = Date.now()

      return k.add([...components, {
        getAge: () => Date.now() - spawned
      }])
    },

    withAgeDelta (tag, fn, scale) {
      return k.action(tag, object => {
        const delta = 1 - object.getAge() / scale

        if (delta > 0) {
          return fn(object, delta)
        }

        return k.destroy(object)
      })
    }
  }
}

export function infoPlugin (k) {
  return {
    addInfo (components, x, y, s = 1) {
      const width = k.width()
      const height = k.height()

      return k.add([
        k.pos((width + x) % width, (height + y) % height),
        k.color(s, s, s),
        k.layer('info'),
        ...components
      ])
    }
  }
}
