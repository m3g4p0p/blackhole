const { prepare, urlsToCache } = require('./shared')

prepare().then(async () => {
  return require('esbuild').build({
    entryPoints: ['src/game.js', 'src/sw.js'],
    bundle: true,
    outdir: 'dist',
    minify: true,
    sourcemap: 'external',
    watch: process.argv.includes('--watch'),
    define: {
      DEVELOP: JSON.stringify(false),
      EXPERIMENTAL: JSON.stringify(process.argv.includes('--experimental')),
      VERSION: JSON.stringify(require('../package.json').version),
      URLS_TO_CACHE: JSON.stringify(await urlsToCache())
    }
  })
}).catch(() => process.exit(1))
