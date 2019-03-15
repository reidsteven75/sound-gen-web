import React, { Component } from 'react'
import Tone from 'tone'

import PitchSlider from './components/pitch-slider'
import VelocitySlider from './components/velocity-slider'
import Keyboard from './components/keyboard'
import LatentSelector from './components/latent-selector'

const style = {
  content: {
		padding: 20,
		width: '100%'
	}
}

class LatentExplorer extends Component {

	config = {
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
	
	handleSamplerReady() {
		console.log('sampler ready')
	}

	handleSamplerError(err) {
		// console.log('sampler error')
	}

	handleBuffersReady() {
		console.log('buffer ready')
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

		this.handleSamplerError = this.handleSamplerError.bind(this) 
		this.handleSamplerReady = this.handleSamplerReady.bind(this) 
		this.handleBuffersReady = this.handleBuffersReady.bind(this) 

	}

  componentDidMount() {
		const latentSpaces = this.props.data.latentSpaces
		const baseUrl = `${this.config.fileUrl.storagePath}/${this.config.fileUrl.bucket}`
		
		// this.sampler = {}

		// latentSpaces.forEach((latentSpace) => {
		// 	this.soundUrls = {}
		// 	// get urls for each sound
		// 	this.config.pitches.forEach((pitch) => {
		// 		const sound = `${latentSpace}_pitch_${pitch.value}`
		// 		const fileUrl = `${this.config.fileUrl.folderPath}/${this.config.fileUrl.gridName}_${sound}_vel_127.mp3`
		// 		const note = new Tone.Frequency(pitch.value, 'midi').toNote()
		// 		this.soundUrls[note] = fileUrl
		// 		// console.log(sound)
		// 		// console.log(baseUrl + fileUrl)
		// 	})
		// 	// create samplers that play sounds for each latent space
		// 	this.sampler[latentSpace] = new Tone.Sampler(this.soundUrls, {
		// 		release: 1,
		// 		volume: 15,
		// 		baseUrl: baseUrl,
		// 		onload: this.handleSamplerReady(),
		// 		onError: this.handleSamplerError()
		// 	}).toMaster()
		// })

		this.soundUrls = {}

		latentSpaces.forEach((latentSpace) => {
			// get urls for each sound
			this.config.pitches.forEach((pitch) => {
				const sound = `${latentSpace}_pitch_${pitch.value}`
				const fileUrl = `${baseUrl}${this.config.fileUrl.folderPath}/${this.config.fileUrl.gridName}_${sound}_vel_127.mp3`
				// const note = new Tone.Frequency(pitch.value, 'midi').toNote()
				this.soundUrls[sound] = fileUrl
				// console.log(sound)
				// console.log(baseUrl + fileUrl)
			})	
		})
		this.players = new Tone.Players(this.soundUrls, {
			onload: this.handlePlayerReady(),
			onError: this.handlePlayerError()
		}).toMaster()

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

		// console.log(latentSpace + '_pitch_' + pitch)
		// const note = new Tone.Frequency(pitch, 'midi').toNote()
		// if (latentSpace + '_pitch_' + pitch in this.soundUrls) { console.log('exists') }
		// if (this.sampler[latentSpace]) {
		// 	try {
		// 		// this.sampler[latentSpace].triggerAttackRelease(note, 3, 1, velocity) 
		// 		this.sampler[latentSpace].triggerAttack(note) 
		// 	}
		// 	catch(err) {
		// 		console.log('error playing sound: ' + latentSpace + '_pitch_' + pitch)
		// 	}
		// }
		// else {
		// 	console.log('does not exist: ' + latentSpace + '_pitch_' + pitch)
		// }

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
      content = <div className="loader border-top-default medium fast"></div>
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
