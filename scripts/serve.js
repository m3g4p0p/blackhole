const { serve } = require('esbuild')
const ip = require('ip')
const { define, handleError, version } = require('./shared')

serve({
  port: 5500,
  servedir: 'src'
}, {
  entryPoints: ['src/game.js'],
  bundle: true,
  write: false,
  sourcemap: 'inline',
  ...define({
    version,
    DEVELOP: true,
    ENDPOINT: null,
    EXPERIMENTAL: true
  })
}).then(server => {
  console.log(`Serving from http://${ip.address()}:${server.port}`)

  process.on('SIGINT', () => {
    server.stop()
  })
}).catch(handleError)
