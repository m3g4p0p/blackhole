const { prepare, urlsToCache } = require('./shared')

prepare().then(async () => {
  console.log(process.argv)
  return require('esbuild').build({
    entryPoints: ['src/game.js', 'src/sw.js'],
    bundle: true,
    outdir: 'dist',
    minify: true,
    sourcemap: 'external',
    define: {
      DEVELOP: JSON.stringify(false),
      EXPERIMENTAL: JSON.stringify(process.argv.includes('--experimental')),
      VERSION: JSON.stringify(require('../package.json').version),
      URLS_TO_CACHE: JSON.stringify(await urlsToCache())
    }
  })
}).catch(() => process.exit(1))
