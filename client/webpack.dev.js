const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')

const config = {
  logs: {
    section: ('--------------'),
    soundWaveGraphic: ('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  },
  host: '0.0.0.0',
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
  if (percentage == 0) {

    console.log('web-packing...')
    console.log(config.logs.section)
    
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
    console.log(config.logs.soundWaveGraphic)
    console.log('~= Sound Client Ready =~')
    console.log('')
    console.log('URL: http://' + config.host + ':' + process.env.CLIENT_PORT)
    console.log('ENV: ' + process.env.NODE_ENV)
    console.log(config.logs.soundWaveGraphic)
  }

}

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval',
  devServer: {
    host: config.host,
    port: process.env.CLIENT_PORT,
    contentBase: './dist',
    stats: 'none'
  },
  plugins: [
    new webpack.ProgressPlugin(progressBar)
  ]
})