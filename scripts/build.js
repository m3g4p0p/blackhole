require('esbuild').build({
  entryPoints: ['src/game.js'],
  bundle: true,
  outdir: 'dist',
  minify: true,
  sourcemap: 'external'
}).catch(() => process.exit(1))
