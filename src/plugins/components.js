export default function componentsPlugin (k) {
  function link (master, slave) {
    if (!master.exists()) {
      return
    }

    master.on('destroy', () => {
      k.destroy(slave)
    })
  }

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
      ...age(),

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

  function orbit (object, distance, escape) {
    return {
      add () {
        this.use([
          k.pos(object.pos),
          k.origin(object.origin)
        ])

        link(object, this)
      },

      update () {
        let rotation = k.rotateVec(distance, this.angle)

        if (escape) {
          rotation = rotation.scale(1 + escape - escape * this.decay)
        }

        this.pos = object.pos.add(rotation)
      }
    }
  }

  function spin (factor, offset = 0) {
    return {
      add () {
        this.use([
          k.rotate(offset),
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

        link(object, this)
      },

      update () {
        this.pos = object.pos
        this.angle = object.angle
      }
    }
  }

  return { age, decay, delta, orbit, spin, sync }
}
