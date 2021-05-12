export default function componentsPlugin (k) {
  function age () {
    const created = Date.now()

    return {
      age () {
        return Date.now() - created
      }
    }
  }

  function decay (maxAge) {
    return {
      decay: 1,

      add () {
        this.use(age())
      },

      update () {
        this.decay = 1 - this.age() / maxAge

        if (this.decay <= 0) {
          k.destroy(this)
        }
      }
    }
  }

  function delta () {
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

  function spin (factor) {
    return {
      add () {
        this.use([
          k.rotate(0),
          k.origin('center')
        ])
      },

      update () {
        this.angle += k.dt() * k.gravity() / factor
      }
    }
  }

  function sync (object) {
    return {
      add () {
        this.use([
          k.pos(object.pos),
          k.rotate(object.angle),
          k.origin(object.origin)
        ])

        object.on('destroy', () => {
          k.destroy(this)
        })
      },

      update () {
        this.pos = object.pos
        this.angle = object.angle
      }
    }
  }

  return { age, decay, delta, spin, sync }
}
