import React, { Component } from 'react'
import Tone from 'tone'
import chunk from 'lodash/chunk'

import PitchSlider from './components/pitch-slider'
// import VelocitySlider from './components/velocity-slider'
import Keyboard from './components/keyboard'
import LatentSelector from './components/latent-selector'
import CircularProgress from '@material-ui/core/CircularProgress'

const style = {
  content: {
		padding: 20,
		width: '100%'
	}
}

class LatentExplorer extends Component {

	config = {
		loadBatchSize: {
			player: 100
		},
		fileUrl: {
			storagePath: 'https://storage.googleapis.com',
			bucket: 'augmented-music-generation-dev',
			folderPath: '/latent_grids/test',
			gridName: 'cleaned_grid_v3'
		},
		pitches: [
			{key:"A", value:36},
			{key:"W", value:40},
			{key:"S", value:44},
			{key:"E", value:48},
			{key:"D", value:52},
			{key:"R", value:56},
			{key:"F", value:60},
			{key:"T", value:64},
			{key:"G", value:68},
			{key:"Y", value:72},
			{key:"H", value:76},
			{key:"U", value:80},
			{key:"J", value:84}
		]
	}

	handlePlayerReady() {
		console.log('player ready')
		this.setState({loading:false})
	}

	handlePlayerError(err) {
		console.log('player error')
	}

	initPlayer() {
		console.log('init player')
		const batchSize = this.config.loadBatchSize.player
		const chunkedSounds = chunk(this.soundUrls, batchSize)

		chunkedSounds.forEach((sounds) => {

			var soundUrlsChunk = {}

			sounds.forEach((sound) => {
				soundUrlsChunk[sound.name] = sound.fileUrl
				// const buffer = this.buffers.get(sound.name)
				// console.log(buffer)
				// this.players.add(sound.name, sound.fileUrl, () => {
				// 	console.log('player initialized')
				// })
			})

			// console.log('chunk init')
			// console.log(soundUrlsChunk)
			// const test = new Tone.Players(soundUrlsChunk, () => {
			// 	console.log('chunk done')
			// })

		})

		console.log('done')

		// const player = new Tone.Players(this.soundUrls, () => {
		// 	console.log('players:done')
		// }).toMaster()
	}

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
			serverError: false,
			latentRatioNW: 0,
			latentRatioNE: 0,
			latentRatioSW: 0,
			latentRatioSE: 0,
			pitch: 60,
			velocity: 0.5
		}

		this.handlePlayerError = this.handlePlayerError.bind(this) 
		this.handlePlayerReady = this.handlePlayerReady.bind(this)
		this.initPlayer = this.initPlayer.bind(this)

		this.soundUrls = []
		this.buffers = new Tone.Buffers()
		this.players = new Tone.Players().toMaster()

	}
	

  componentDidMount() {
		const latentSpaces = this.props.data.latentSpaces
		const baseUrl = `${this.config.fileUrl.storagePath}/${this.config.fileUrl.bucket}`
		const numSounds = latentSpaces.length * this.config.pitches.length
		var numSoundsBuffered = 0

		console.log('num sounds: ', numSounds)

		latentSpaces.forEach((latentSpace) => {
			// get urls for each sound
			this.config.pitches.forEach((pitch) => {
				const name = `${latentSpace}_pitch_${pitch.value}`
				const fileUrl = `${baseUrl}${this.config.fileUrl.folderPath}/${this.config.fileUrl.gridName}_${name}_vel_127.mp3`
				// const note = new Tone.Frequency(pitch.value, 'midi').toNote()
				this.soundUrls.push({
					name: name,
					fileUrl: fileUrl	
				})
				// console.log(sound)
				// console.log(baseUrl + fileUrl)
				this.initPlayer()
				// const buffer = new Tone.Buffer(fileUrl, () => {
				// 	this.buffers.add(name, buffer, () => {
				// 		numSoundsBuffered ++
				// 		if (numSoundsBuffered === numSounds) {
				// 			this.initPlayer()
				// 		}
				// 	})
				// })
			})	
		})

		

		this.setState({loading:false})
		// this.players = new Tone.Players(this.soundUrls, {
		// 	onload: this.handlePlayerReady(),
		// 	onError: this.handlePlayerError()
		// }).toMaster()
		// this.setState({loading:false})

		// Tone.Buffer.on('load', this.handleBuffersReady())s
	}

	updatePitch(data) {
		this.setState(
			{ pitch: data.pitch }, 
		() => {
			this.playSound()
		})
	}

	updateVelocity(data) {
		this.setState(
			{ velocity: data.velocity / 100 }, 
		() => {
			this.playSound()
		})
	}

	playSound() {
		const pitch = this.state.pitch
		// const velocity = this.state.velocity
		const latentSpace = `${this.state.latentRatioNW}`
													+ `_${this.state.latentRatioNE}`
													+ `_${this.state.latentRatioSW}`
													+ `_${this.state.latentRatioSE}`

		if (this.players) {
			const playerName = latentSpace + '_pitch_' + pitch
			const player = this.players.get(playerName)
			if (player) {
				try {
					player.start()
				}
				catch(err) {
					console.log('error playing sound: ' + playerName)
				}
			}
			else {
				console.log('does not exist: ' + playerName)
			}
		}
	}
	
	updateKeyPressed(data) {
    const pitch = data.pitch
    const active = data.active
		// console.log("key:"+data.key, "pitch:"+pitch, active)

		if (active === true) { 
			this.setState(
				{ pitch: pitch }, 
			() => {
				this.playSound()
			})
		}
  }

  updateLatentSelector(data) {
    const x = parseFloat(data.x).toFixed(1)
		const y = parseFloat(data.y).toFixed(1)
		const hasBeenActivated = data.hasBeenActivated

		var latentSpace = [
			Math.round( 10 * (1-x)*(1-y) ) / 10,
			Math.round( 10 * (x)*(1-y) ) / 10,
			Math.round( 10 * (1-x)*(y) ) / 10,
			Math.round( 10 * (x)*(y) ) / 10
		]

		// latent space should add up to 1
		var sum = latentSpace.reduce((partial_sum, a) => partial_sum + a)
		var iterCurrent = 0
		var iterMax = 10
		while (sum !== 1 && iterMax !== iterCurrent) {
			if (sum < 1) {
				const indexOfMaxValue = latentSpace.indexOf(Math.max(...latentSpace))
				latentSpace[indexOfMaxValue] += 0.1
			}
			if (sum > 1) {
				const indexOfMaxValue = latentSpace.indexOf(Math.max(...latentSpace))
				latentSpace[indexOfMaxValue] -= 0.1
			}
			sum = latentSpace.reduce((partial_sum, a) => partial_sum + a)
			iterCurrent ++
		}

		// ensure values can be mapped to names of sound files
		latentSpace = latentSpace.map(function(value) { 
			return parseFloat(value).toFixed(1)
		})

		this.setState(
			{
				latentRatioNW: latentSpace[0],
				latentRatioNE: latentSpace[1],
				latentRatioSW: latentSpace[2],
				latentRatioSE: latentSpace[3]
			}, () => {
			if (hasBeenActivated === true) { this.playSound() }
		})

		// console.log(
		// 		"NW:"+this.state.latentRatioNW, 
		// 		"NE:"+this.state.latentRatioNE, 
		// 		"SW:"+this.state.latentRatioSW, 
		// 		"SE:"+this.state.latentRatioSE
		// 		)
    
  }

  render() {
		
    let content
    if (this.state.loading === true) {
			content = <CircularProgress/>
    }
    else if (this.state.serverError === true) {
      content = <div>
                  Server Unreachable
                  <br/>
                  <br/>
                  Try Reloading App
                </div>
    }
    else {
      content = <div>
									<LatentSelector 
										updateLatentSelector={this.updateLatentSelector.bind(this)}
										sounds={this.props.data.sounds}
									/>
									<br/>
									<PitchSlider
										min={36}
										max={84}
										step={4}
										handleChange={this.updatePitch.bind(this)}
									/>
									{/* <br/>
									<VelocitySlider
										min={0}
										max={100}
										handleChange={this.updateVelocity.bind(this)}
									/> */}
									<br/>
									<div className={'d-none d-lg-block'}>
									<Keyboard 
										updateKeyPressed={this.updateKeyPressed.bind(this)}
									/>
									</div>
								</div>
    }

    return (
			<div style={style.content}>
				{content}
			</div>
    )
  }
}

export default LatentExplorer;
