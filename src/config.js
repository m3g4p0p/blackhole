/* global DEVELOP ENDPOINT EXPERIMENTAL VERSION */
export const develop = DEVELOP
export const endpoint = ENDPOINT
export const blackhole = VERSION
export const disabled = EXPERIMENTAL ? {} : { extraBoost: true }
