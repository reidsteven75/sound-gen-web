const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    host: process.env.HOST,
    port: process.env.CLIENT_PORT,
    historyApiFallback: true,
    stats: 'errors-only'
  }
})