const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = env => ({
  entry: './src/game.js',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin({
    template: './src/index.html'
  })],
  mode: env.production ? 'production' : 'development'
})
