require('dotenv').config({ path: 'build/.env' })

const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const mongoose = require('mongoose')
const {Storage} = require('@google-cloud/storage')

const path = require('path')
const bodyParser = require('body-parser')
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
const CLIENT_PATH = 'build/client'

// const MONGO_URL = 'mongodb://mongodb:' + MONGO_PORT + '/test'
const MONGO_URL = process.env.MONGO_URL

const config = {
	storage: {
		projectId: '304734781370'
	}
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(CLIENT_PATH))

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
})

const storage = new Storage({
  projectId: config.storage.projectId,
})
const bucket = storage.bucket('sound-gen-dev')
app.post(API_ROUTE + '/sounds', function(req, res) {
	req.on('readable', function(){
		console.log(req.read())
		
	})
	res.send({test:'works!'})
	
})

app.get(API_ROUTE + '/test', function(req, res) {
	res.send({test:'works!'})
})

app.get(CLIENT_ROUTE, function(req, res) {
	res.sendFile(path.resolve(path.join(CLIENT_PATH), 'index.html'))
})

server.listen(SERVER_PORT, () => {
	console.log('~~~~~~~~~~~~~~~~~~~~~~~~')
	console.log('~= Sound Server Ready =~')
  console.log('')
	console.log('ENV:    ', ENVIRONMENT)
	console.log('API:    ', HOST + ':' + SERVER_PORT + API_ROUTE)

	mongoose.connect(MONGO_URL, { useNewUrlParser: true })

	mongoose.connection.on('error', error => {
		console.log('DB:      error')
		console.log('-----------------')
		console.log(error)
	})

	mongoose.connection.once('open', () => {
		console.log('DB:      connected')
	})

})