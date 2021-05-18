const copy = require('recursive-copy')
const fs = require('fs/promises')
const { version } = require('../package.json')

function cleanDist () {
  return fs.rmdir('dist', { recursive: true })
}

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

async function prepare () {
  await cleanDist()
  await fs.mkdir('dist')

  await copy('src', 'dist', {
    filter: filename => !filename.endsWith('.js')
  })

  return cleanDist
}

async function urlsToCache () {
  const paths = ['icons', 'media'].map(dir => fs
    .readdir('src/' + dir)
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
