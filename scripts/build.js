const { build } = require('esbuild')
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
  develop = false,
  experimental = false,
  watch = false
} = yargs.parse(hideBin(process.argv))

prepare('src', 'dist').then(async dist => {
  return build({
    entryPoints: ['src/game.js', 'src/sw.js'],
    outdir: dist,
    bundle: true,
    minify: true,
    sourcemap: true,
    watch,
    ...define({
      develop,
      experimental,
      version,
      URLS_TO_CACHE: await urlsToCache(dist)
    })
  })
}).catch(handleError)
