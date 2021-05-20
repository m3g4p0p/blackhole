const copy = require('recursive-copy')
const fs = require('fs/promises')
const path = require('path')
const { version } = require('../package.json')

function define (entries) {
  const define = Object
    .entries(entries)
    .reduce((result, [key, value]) => ({
      ...result,
      [key.toUpperCase()]: JSON.stringify(value)
    }), {})

  return { define }
}

function handleError (error) {
  console.error(error)
  process.exit(1)
}

async function prepare (src, dist) {
  await fs.rmdir(dist, { recursive: true })
  await fs.mkdir(dist)

  await copy(src, dist, {
    filter: filename => !filename.endsWith('.js')
  })

  return path.resolve(dist)
}

async function urlsToCache (src) {
  const paths = ['icons', 'media'].map(dir => fs
    .readdir(path.join(src, dir))
    .then(files => files.map(file => `./${dir}/${file}`))
  )

  return (await Promise.all(paths)).flat()
}

module.exports = {
  define,
  handleError,
  prepare,
  urlsToCache,
  version
}
