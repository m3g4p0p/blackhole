const k = kaboom

// https://stackoverflow.com/questions/21294302/converting-milliseconds-to-minutes-and-seconds-with-javascript
function displayTime (millis) {
  const minutes = Math.floor(millis / 60000)
  const seconds = ((millis % 60000) / 1000).toFixed(0)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}

let difficulty = 5

k.init({
  width: 800,
  height: 800
})

k.scene('start', () => {
  const info = k.add([
    k.text(),
    k.pos(200, 300)
  ])

  function updateInfo () {
    info.text = 'Difficulty: ' + difficulty
  }

  k.add([
    k.text('Press ENTER to start falling'),
    k.pos(200, 200)
  ])

  k.keyPress('space', () => {
    k.go('main')
  })

  k.keyPress('up', () => {
    difficulty = Math.min(10, difficulty + 1)
    updateInfo()
  })

  k.keyPress('down', () => {
    difficulty = Math.max(1, difficulty - 1)
    updateInfo()
  })

  updateInfo()
})

k.scene('main', () => {
  const start = Date.now()
  let gravity = 1000

  const info = k.add([
    k.text(''),
    k.pos(10, 10)
  ])

  const ship = k.add([
    k.pos(k.width() / 2, k.height() / 1.5),
    k.body(),
    k.rect(20, 40),
    k.color(1, 1, 1)
  ])

  ship.action(() => {
    if (
      ship.pos.y >= k.height() ||
      ship.pos.x < 0 ||
      ship.pos.x >= k.width()
    ) {
      k.go('death')
    }
  })

  k.gravity(gravity)

  k.loop(1, () => {
    info.text = displayTime(Date.now() - start)
    k.gravity(gravity += difficulty * 100)
  })

  k.keyPress('space', () => {
    ship.jump()
  })

  k.keyDown('left', () => {
    ship.move(-100, 0)
  })

  k.keyDown('right', () => {
    ship.move(100, 0)
  })
})

k.scene('death', () => {
  k.add([
    k.text('Gravity ate you up.'),
    k.pos(200, 200)
  ])

  k.wait(3, () => k.go('start'))
})

k.start('start')
