require('dotenv').config({ path: 'build/.env' })
require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss.l' })

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

const { 
	SoundSpaces, 
	Files 
} = require('./models')

const ENVIRONMENT = process.env.NODE_ENV || 'development'
const HTTPS = (process.env.HTTPS === 'true')
const HOST = (HTTPS ? 'https://' : 'http://') + process.env.HOST
const SERVER_PORT = process.env.SERVER_PORT
const MONGO_PORT = process.env.MONGO_PORT
const GOOGLE_STORAGE_SERVICE = 'https://storage.googleapis.com'
const GOOGLE_STORAGE_BUCKET = process.env.GOOGLE_STORAGE_BUCKET
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

const logger = (req, res, next) => {
	console.log(req.originalUrl)
	next()
}

app.use(logger)
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
const bucket = storage.bucket(GOOGLE_STORAGE_BUCKET)

app.get(API_ROUTE + '/test', (req, res) => {
	res.send({test:'works!'})
})

// client
// ------
app.get(CLIENT_ROUTE, (req, res) => {
	res.sendFile(path.resolve(path.join(CLIENT_PATH), 'index.html'))
})

// sound-spaces
// ------------
app.get(API_ROUTE + '/sound-spaces/:id', (req, res) => {
	const id = req.params.id
	SoundSpaces.findById(id, (err, record) => {
		if (err) {
			console.error(err)
			return res.send({err: true})
		}
		res.send(record)
	})
})

app.post(API_ROUTE + '/sound-spaces', (req, res) => {
	const data = req.body
	const record = new SoundSpaces({
		name: data.name,
		user: data.user,
		dimensions: data.dimensions,
		resolution: data.resolution,
		labels: {
			NW: data.labels.NW,
			NE: data.labels.NE,
			SW: data.labels.SW,
			SE: data.labels.SE
		},
		fileLocation: {
			service: GOOGLE_STORAGE_SERVICE,
			bucket: GOOGLE_STORAGE_BUCKET,
			path: data.fileLocation.path
		}
	})
	record.save( (err) => {
		if (err) {
			console.error('save DB error: files')
			console.log(err)
			return res.send({err: true})
		}
		res.send(record)
	})
})

// files
// -----
app.get(API_ROUTE + '/sound-spaces/:id/files', (req, res) => {
	const id = req.params.id
	Files.find({soundSpace:id}, (err, records) => {
		if (err) {
			console.error(err)
			return res.send({err: true})
		}
		res.send(records)
	})
})

app.post(API_ROUTE + '/files', (req, res) => {

	const data = req.body
	const options = {
		destination: data.uploadPath + '/' + data.fileName,
		resumable: true,
	}

	bucket.upload(data.filePath + '/' + data.fileName, options, function(err, file) {
		if (err) {
			console.error('upload Google Storage error: files')
			console.log(err)
			return res.send({err: true})
		}
		
		console.log(data.latentSpace)
		const record = new Files({
			soundSpace: data.soundSpace,
			file: data.fileName,
			path: data.uploadPath,
			latentSpace: data.latentSpace
		})
		record.save( (err) => {
			if (err) {
				console.error('save DB error: files')
				console.log(err)
				return res.send({err: true})
			}
			res.send(record)
		})
	})

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