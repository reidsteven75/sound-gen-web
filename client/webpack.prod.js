const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')

const config = {
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
    console.log('Build: client/dist/')
  }

}

module.exports = merge(common, {
	 mode: 'production',
   plugins: [
    	new webpack.ProgressPlugin(progressBar)
   ]
})