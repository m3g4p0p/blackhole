export const DIFFICULTY = {
  MIN: 1,
  MAX: 3
}

export const MOVE = {
  SHIP: { X: 100, Y: 10 },
  DEBRIS: { X: 100, Y: -100 }
}

export const SIZE = {
  GAME: { X: 800, Y: 800 },
  SHIP: { X: 20, Y: 40 },
  BOOST: { X: 10, Y: 10 },
  FLAME: { X: 20, Y: 5 },
  SHIELD: { X: 25, Y: 45 },
  SAT: { X: 10, Y: 10 },
  STAR: { X: 5, Y: 5 },
  DEBRIS: {
    MIN: { X: 10, Y: 10 },
    MAX: { X: 25, Y: 25 }
  }
}

export const TIME = {
  BOOST: 5,
  DEBRIS: 3
}

export const FACTOR = {
  GRAVITY: 100,
  BOOST: 0.5
}

export const SPIN = {
  BOOST: -1000,
  DEBRIS: 500,
  SAT: 200,
  SPARK: -200
}

export const DECAY = {
  FLAME: 1000,
  FIRE: 500,
  INFO: 500,
  SAT: 1000,
  SHIELD: 4000,
  SPARK: 2000,
  TAIL: 200
}

export const SCORE = {
  BOOST: 10,
  DEBRIS: 50
}

export const SHAKE = {
  BOOST: 6,
  DEBRIS: 12
}

export const THRESH = {
  SAT: 3,
  INFO: 6
}

export const THROTTLE = {
  FLAME: 40
}

export const INITIAL_GRAVITY = 1000
export const STARS = 10
export const CAM_THRESHOLD = 20
export const JUMP_FORCE = 480
export const DETUNE = 100
export const MAX_SCORES = 5
