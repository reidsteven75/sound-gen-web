const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')

const config = {
	env: process.env.NODE_ENV,
	host: process.env.HOST,
	port: process.env.CLIENT_PORT,
  progressBar: {
    enabled: false,
    lastMessage: null,
    hooks: [
      'compiling',
      'building',
      'sealing',
      'dependencies optimization',
      'emitting'
    ]
  }
}

const progressBar = (percentage, message) => {

  // Start
  if (percentage === 0) {
    
  }

  // Progress
  if (config.progressBar.enabled) {
    // Message Update
    if (message !== config.progressBar.lastMessage) {
      config.progressBar.lastMessage = message

      // Different Message
      if (config.progressBar.hooks.includes(message)) {
        console.log(message)
      }
    }
  }
  
  // Done
  if (percentage >= 1) {
    console.log('')
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~')
    console.log('~= Sound Client Ready =~')
    console.log('')
		console.log('URL: http://' + config.host + ':' + config.port)
    console.log('ENV: ' + config.env)
  }

}

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval',
  devServer: {
    host: config.host,
    port: config.port,
    contentBase: './dist',
    stats: 'none'
  },
  plugins: [
    new webpack.ProgressPlugin(progressBar)
  ]
})