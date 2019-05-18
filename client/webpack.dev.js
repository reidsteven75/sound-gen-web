const merge = require('webpack-merge')
const common = require('./webpack.common.js')

const config = {
	env: process.env.NODE_ENV,
	host: process.env.HOST,
	port: process.env.CLIENT_PORT,
}

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    host: config.host,
    port: config.port,
    stats: 'errors-only'
  }
})