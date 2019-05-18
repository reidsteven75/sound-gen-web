const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
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
        'SERVER_PORT':    JSON.stringify(process.env.SERVER_PORT),
        'CLIENT_PORT':    JSON.stringify(process.env.CLIENT_PORT)
      }
    })
  ]
}