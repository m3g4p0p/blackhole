/* global DEVELOP EXPERIMENTAL VERSION */
export const develop = DEVELOP
export const blackhole = VERSION
export const disabled = EXPERIMENTAL ? {} : { extraBoost: true }
