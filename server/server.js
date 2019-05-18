const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const mongoose = require('mongoose')
const {Storage} = require('@google-cloud/storage')

const bodyParser = require('body-parser')
const path = require('path')
const assert = require('assert')
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const size = require('object-sizeof')

const ENVIRONMENT = process.env.NODE_ENV || 'development'
const HTTPS = (process.env.HTTPS === 'true')
const HOST = (HTTPS ? 'https://' : 'http://') + process.env.HOST
const SERVER_PORT = process.env.SERVER_PORT
const MONGO_PORT = process.env.MONGO_PORT
const API_ROUTE = '/api'
const CLIENT_ROUTE = '/app'
const CLIENT_PATH = path.join('./client')

const config = {
	storage: {
		projectId: '304734781370'
	}
}

const storage = new Storage({
  projectId: config.storage.projectId,
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('client'))

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
})

io.on('connection', function (socket) {
	console.log('[socket]: connected')
})

calcResponseSize = function(data) {
	console.log('size (kB): ', size(data)/1000)
}

calcResponseTime = function(endpoint, startTime) {
	const endTime = Date.now()
	var timeDiff = (( endTime - startTime ) / 1000).toFixed(2)
	console.log(endpoint)
	console.log('time (s): ', timeDiff)
}

app.get(API_ROUTE + '/test', function(req, res) {
	res.send({test:'works!'})
})


app.get(CLIENT_ROUTE, function(req, res) {
	res.sendFile(path.resolve(CLIENT_PATH, 'index.html'))
})

server.listen(SERVER_PORT, () => {
	console.log('~~~~~~~~~~~~~~~~~~~~~~~~')
	console.log('~= Sound Server Ready =~')
  console.log('')
	console.log('ENV:    ', ENVIRONMENT)
	console.log('API:    ', HOST + ':' + SERVER_PORT + API_ROUTE)
	console.log('CLIENT: ', HOST + ':' + SERVER_PORT + CLIENT_ROUTE)

	mongoose.connect('mongodb://mongodb:' + MONGO_PORT + '/test', { useNewUrlParser: true })

	mongoose.connection.on('error', error => {
		console.log('DB:      error')
		console.log('-----------------')
		console.log(error)
	})

	mongoose.connection.once('open', () => {
		console.log('DB:      connected')
	})

})