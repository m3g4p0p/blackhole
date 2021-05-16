const copy = require('recursive-copy')
const fs = require('fs/promises')

module.exports.prepare = async function () {
  await fs.rmdir('dist', { recursive: true })
  await fs.mkdir('dist')

  await copy('src', 'dist', {
    filter: filename => !filename.endsWith('.js')
  })
}

module.exports.urlsToCache = async function () {
  const paths = ['icons', 'media'].map(dir => fs
    .readdir('src/' + dir)
    .then(files => files.map(file => `./${dir}/${file}`))
  )

  return (await Promise.all(paths)).flat()
}
