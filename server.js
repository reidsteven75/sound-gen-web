const express = require('express')
const app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
const bodyParser = require('body-parser')
const path = require('path')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const request = require('request')
const favicon = require('serve-favicon')
const _ = require('lodash')
const moment = require('moment')
const size = require('object-sizeof')

const PORT = process.env.PORT || 3001
const MOCK_DATA = process.env.MOCK_DATA || false

// TODO
// better env config - yaml config file

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('client/build'))

// app.use(favicon(path.join(__dirname, 'client', 'build', 'icons', 'favicon.ico')))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

// DB
const dbUrl = process.env.MONGODB_URI || 'mongodb://heroku_rmsh84q1:lv0193fj7bcfgonotsdq73aj43@ds155614.mlab.com:55614/heroku_rmsh84q1'
const dbClient = new MongoClient(dbUrl, { useNewUrlParser: true })
const dbName = process.env.MONGODB_NAME || 'heroku_rmsh84q1'
var db
const dbCollection = {
	expireAfterSeconds: 86400,
	expiryInterval: 60000
}

// Sensor Calibration
const phOffset = -0.11
const phDecimals = 2

io.on('connection', function (socket) {
	console.log('[socket]: connected')
})

mockDataStreamPh = function() {

	var value = 7
	setInterval(function() {
		value += Math.random() - 0.5
		handlePhData(value.toFixed(phDecimals))
	}, 2000)

}

handlePhData = function(value) {
	const parsed = (parseFloat(value) + phOffset).toFixed(phDecimals)
	if (isNaN(parsed)) {
		return console.log('invalid PH data')
	}
	console.log('PH: ' + parsed)
	const data = {
		value: parsed,
		timestamp: Date.now()
	}

	// save data in db
	db.collection('sensor_data').insertOne(data, function(err, r) {
		assert.equal(null, err)
		assert.equal(1, r.insertedCount)
	})

	// update clients in real-time
	io.sockets.emit('data-update-ph', data)
}

calcResponseSize = function(data) {
	console.log('size (kB): ', size(data)/1000)
}

calcResponseTime = function(endpoint, startTime) {
	const endTime = Date.now()
	var timeDiff = (( endTime - startTime ) / 1000).toFixed(2)
	console.log(endpoint)
	console.log('time (s): ', timeDiff)
}

app.get('/app', function(req, res) {
	res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

// PARAMS
// sampleRate: seconds
// duration: seconds
app.get('/historicals/ph', (req, res) => {
	const responseStarted = Date.now()
	const dbQuery = {}
	const sampleRateMs = parseInt(req.query.samplerate)
	if (req.query.duration) { 
		const cutoffMs = Date.now() - (parseInt(req.query.duration))
		dbQuery.timestamp = { $gte: cutoffMs }
	}
	try {
		db.collection('sensor_data').find( dbQuery , { 
			projection: {
					'_id':0, 
					'value':1,
					'timestamp':1 
			}}).toArray(function(err, docs) {
				if (err) {
					console.error(err.stack)
					return res.status(500).send({error:err})
				}
				// sample
				if (sampleRateMs) {
					var docs = _.sortBy(docs, ['timestamp'])
					var sampleTimestamp = docs[0].timestamp
					docs = _.filter(docs, function(n) {
						if (moment(n.timestamp).isSameOrAfter(moment(sampleTimestamp))) {
							sampleTimestamp += sampleRateMs
							return true
						}
						else return false
					})
				}
				// send response
				calcResponseTime(req.url, responseStarted)
				calcResponseSize(docs)
				return res.send(docs)
			})
	}
	catch (err) {
		res.status(500).send({error:err})
	}
})

app.post('/sensorPh', (req, res, next) => {
	if (MOCK_DATA === 'true') { return; }
	if (req.body) {
		if (req.body.data) {
			handlePhData(req.body.data)
			return res.send({res:true})
		}
	}
	return res.send({res:true})
})

server.listen(PORT, () => {

	console.log('====================')
  console.log('BEER TECH: web server')
	console.log('--------------------')
	console.log('PORT: ', PORT)
	console.log('MOCK_DATA: ', MOCK_DATA)
	console.log('====================')

	dbClient.connect(function(err, client) {
		db = client.db(dbName)
		console.log('[mongodb] connected')

		setInterval(function() {
			console.log('[mongodb] removing old data...')
			try {
				const expireTimestamp = Date.now() - ( dbCollection.expireAfterSeconds * 1000 )
				db.collection('sensor_data').deleteMany({timestamp: {$lt: expireTimestamp}}, function(err, r) {
					assert.equal(null, err)
					console.log('[mongodb] success removing old data')
				})
			}
			catch (err) {
				console.log('[mongodb] error removing old data')
				console.log(err)
			}
		}, dbCollection.expiryInterval)
	})

	if (MOCK_DATA === 'true') { mockDataStreamPh() }

	// prevents heroku sleep
	setInterval(function() {
    request.get("https://beer-tech-web-prod.herokuapp.com/app")
	}, 300000)

})