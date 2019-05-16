const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {Storage} = require('@google-cloud/storage')

const bodyParser = require('body-parser')
const path = require('path')
const assert = require('assert')
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const size = require('object-sizeof')

const PORT = process.env.PORT || 81
const ENVIRONMENT = process.env.NODE_ENV || 'development'

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
app.use(express.static('client/build'))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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

app.get('/test', function(req, res) {
	res.send({test:'works'})
})


app.get('/app', function(req, res) {
	res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

server.listen(PORT, () => {

	console.log('=============')
  console.log('SOUND SERVER')
	console.log('-------------')
	console.log('PORT:', PORT)
	console.log('ENV:', ENVIRONMENT)
	console.log('====================')

})