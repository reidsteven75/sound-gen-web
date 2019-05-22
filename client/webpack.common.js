const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: __dirname + '/src/index.js',
  output: {
    path: __dirname + '/build',
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env',
							'@babel/preset-react'
						],
						plugins: [
							'@babel/plugin-proposal-class-properties'
						]
					}
				}
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
	},
  plugins: [
		new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      PUBLIC_URL: '',
      inject: false,
      template: './src/index.html'
    }),
    new CopyPlugin([
      { from: 'public', to: '' }
		]),
    new webpack.DefinePlugin({
      'process.env':{
				'NODE_ENV':       JSON.stringify(process.env.NODE_ENV),
				'HTTPS':       		JSON.stringify(process.env.HTTPS),
        'HOST': 					JSON.stringify(process.env.HOST),
				'SERVER_PORT': 		JSON.stringify(process.env.SERVER_PORT),
        'CLIENT_PORT':    JSON.stringify(process.env.CLIENT_PORT)
      }
		}),
		
  ]
}