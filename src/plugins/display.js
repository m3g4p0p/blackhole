function calcPos (value, size) {
  if (Number.isInteger(value)) {
    return (value + size) % size
  }

  return size * value
}

function join (lines, spacing = 1) {
  return lines.join('\n'.repeat(spacing + 1))
}

/**
 * @param {import('kaboom').KaboomCtx} k
 */
export default function displayPlugin (k) {
  function addGUI (components, x, y, s = 1) {
    return k.add([
      k.pos(
        calcPos(x, k.width()),
        calcPos(y, k.height())
      ),
      k.color(s, s, s),
      k.layer('gui'),
      ...components
    ])
  }

  function addMessage (lines, x, y, spacing, size) {
    return k.add([
      k.text(join(lines, spacing), size, {
        width: k.width() - 2 * x
      }),
      k.pos(x, y),
      {
        setText (lines) {
          this.text = join(lines, spacing)
        }
      }
    ])
  }

  function addCountdown (initial, callback) {
    const countdown = k.addGUI([
      k.text(initial + 1, 32),
      k.origin('center')
    ], 0.5, 0.5)

    k.loop(1, () => {
      const value = countdown.text - 1

      if (value === 0) {
        callback()
      } else {
        countdown.text = value
      }
    })

    return countdown
  }

  function addTextShadow (object, alpha, scale, offset = 0) {
    const { r, g, b } = object.color

    return k.add([
      k.color(r, g, b, alpha),
      k.scale(scale),
      k.text(object.text, object.textSize),
      k.pos(object.pos.add(offset)),
      k.origin(object.origin),
      'shadow'
    ])
  }

  return { addGUI, addMessage, addCountdown, addTextShadow }
}
