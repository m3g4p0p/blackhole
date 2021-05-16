const ip = require('ip')
const { prepare } = require('./shared')

prepare().then(async () => {
  return require('esbuild').serve({
    port: 5500,
    servedir: 'dist'
  }, {
    entryPoints: ['src/game.js'],
    bundle: true,
    outdir: 'dist',
    sourcemap: 'inline',
    define: {
      DEVELOP: JSON.stringify(true),
      EXPERIMENTAL: JSON.stringify(true),
      VERSION: JSON.stringify(require('../package.json').version)
    }
  }).then(server => {
    console.log(`Serving from http://${ip.address()}:${server.port}`)
  })
}).catch(error => {
  console.error(error)
  process.exit(1)
})
