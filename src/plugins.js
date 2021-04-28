function calcPos (value, size) {
  if (Number.isInteger(value)) {
    return (value + size) % size
  }

  return size * value
}

function join (lines, spacing = 1) {
  return lines.join('\n'.repeat(spacing + 1))
}

export function componentsPlugin (k) {
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

  return { age, decay, delta }
}

export function displayPlugin (k) {
  return {
    addInfo (components, x, y, s = 1) {
      return k.add([
        k.pos(
          calcPos(x, k.width()),
          calcPos(y, k.height())
        ),
        k.color(s, s, s),
        k.layer('info'),
        ...components
      ])
    },

    addMessage (lines, x, y, spacing) {
      return k.add([
        k.text(join(lines, spacing), null, {
          width: k.width() - 2 * x
        }),
        k.pos(x, y),
        {
          setText (lines) {
            this.text = join(lines, spacing)
          }
        }
      ])
    },

    addCountdown (initial, callback) {
      const countdown = k.addInfo([
        k.text(initial, 32),
        k.origin('center')
      ], 0.5, 0.5)

      const handle = window.setInterval(() => {
        const value = countdown.text - 1

        if (value === 0) {
          window.clearInterval(handle)
          callback()
        } else {
          countdown.text = value
        }
      }, 1000)

      return countdown
    }
  }
}
