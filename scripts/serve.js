const { serve } = require('esbuild')
const ip = require('ip')
const { define, handleError, prepare, version } = require('./shared')

prepare().then(async cleanDist => {
  const server = await serve({
    port: 5500,
    servedir: 'dist'
  }, {
    entryPoints: ['src/game.js'],
    bundle: true,
    outdir: 'dist',
    sourcemap: 'inline',
    ...define({
      version,
      DEVELOP: true,
      EXPERIMENTAL: true
    })
  })

  console.log(`Serving from http://${ip.address()}:${server.port}`)

  process.on('SIGINT', async () => {
    server.stop()
    // await cleanDist()
    process.exit(1)
  })
}).catch(handleError)
