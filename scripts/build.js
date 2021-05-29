const { build } = require('esbuild')
const liveServer = require('live-server')
const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')

const {
  define,
  handleError,
  prepare,
  urlsToCache,
  version
} = require('./shared')

const {
  port = 5500,
  open = false,
  serve = false,
  watch = serve,
  develop = watch,
  experimental = develop,
  endpoint = null
} = yargs.parse(hideBin(process.argv))

prepare('src', 'dist').then(async root => {
  await build({
    entryPoints: ['src/game.js', 'src/sw.js'],
    outdir: root,
    bundle: true,
    minify: !develop,
    sourcemap: !develop || 'inline',
    watch,
    ...define({
      develop,
      endpoint,
      experimental,
      version,
      URLS_TO_CACHE: develop ? [] : await urlsToCache(root)
    })
  })

  if (serve) {
    liveServer.start({ open, port, root })
  }
}).catch(handleError)
