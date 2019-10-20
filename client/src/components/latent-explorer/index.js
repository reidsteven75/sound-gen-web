import React, { Component } from 'react'
import axios from 'axios'
import Tone from 'tone'
import CircularProgress from '@material-ui/core/CircularProgress'
import compose from 'recompose/compose'
import withWidth from '@material-ui/core/withWidth'
import { withStyles } from '@material-ui/core/styles'
import Hidden from '@material-ui/core/Hidden'

import PitchSlider from './pitch-slider'
import Keyboard from './keyboard'
import GridSelector from './grid-selector'
import LatentSelector from './latent-selector'
import PlaySound from './play-sound'
import DownloadSound from './download-sound'

const style = {
  content: {
		padding: 20,
		width: '100%'
	}
}

class LatentExplorer extends Component {

  constructor(props) {
    super(props)
    this.state = {
			loading: true,
			latentSpaceLoading: false, 
			serverError: false,
			latentRatioNW: 0,
			latentRatioNE: 0,
			latentRatioSW: 0,
			latentRatioSE: 0,
			labelNW: '',
			labelNE: '',
			labelSW: '',
			labelSE: '',
			pitch: null,
			selectedSoundSpace: null,
			sounds: null
		}

		this.loadPlayer = this.loadPlayer.bind(this)
		this.soundUrls = {}

	}

	componentDidMount() {

		if (this.props.soundSpace) {
			axios.get(this.props.api + '/sound-spaces/' + this.props.soundSpace)
				.then((res) => {
					this.setState({selectedSoundSpace: res.data})
				})
				.catch((err) => {
					console.log('error')
					console.log(err)
				})
				.finally( () => {
					axios.get(this.props.api + '/sound-spaces/' + this.props.soundSpace + '/files/mp3')
						.then((res) => {
							this.setState({sounds: res.data})
						})
						.catch((err) => {
							console.log('error')
							console.log(err)
						})
						.finally( () => {
							this.loadGrid()
						})
				})
		}
		else {
			this.loadGrid()
		}
		
	}

	loadGrid() {
		const selectedSoundSpace = this.state.selectedSoundSpace
		this.setState({latentSpaceLoading: true})

		if (selectedSoundSpace) {
			this.setState({
				labelNW: selectedSoundSpace.labels.NW,
				labelNE: selectedSoundSpace.labels.NE,
				labelSW: selectedSoundSpace.labels.SW,
				labelSE: selectedSoundSpace.labels.SE
			}, () => {
				this.loadPlayer()
			})
		}	
	}

	loadPlayer() {

		const { sounds, selectedSoundSpace } = this.state
		// TODO: put this in global config
		const baseUrl = 'https://storage.googleapis.com'

		let latentSpaces = []
		this.soundUrls = {}

		sounds.forEach((sound) => {
			// get urls for each sound
			const fileLocation = `${baseUrl}/${sound.bucket}/${sound.path}/${sound.file}`
			this.soundUrls[sound._id] = fileLocation

			// get latent space arrays for each sound
			const latentSpaceXY = this.convert_LatentSpace_XY(
												sound.latentSpace['NW'],
												sound.latentSpace['NE'],
												sound.latentSpace['SE'],
												sound.latentSpace['SW']
											)

			latentSpaces.push(latentSpaceXY)
			
		})

		// timeout makes initial loading animation smoother
		setTimeout(() => {
			this.players = new Tone.Players(this.soundUrls, () => {
				this.setState({
					loading: false,
					latentSpaceLoading: false,
					latentSpaces: latentSpaces,
					latentResolution: selectedSoundSpace.resolution
				})
			}).toMaster()	
		}, 500)
	}

	updatePitch(data) {
		this.setState({ pitch: data.pitch })
	}

	getCurrentSound() {
		const { sounds, currentSound, latentRatioNW, latentRatioNE, latentRatioSE, latentRatioSW } = this.state
		const soundMatch = sounds.find( (sound) => {
			return (
				sound.latentSpace.NW === parseFloat(latentRatioNW) &&
				sound.latentSpace.NE === parseFloat(latentRatioNE) &&
				sound.latentSpace.SE === parseFloat(latentRatioSE) &&
				sound.latentSpace.SW === parseFloat(latentRatioSW)
			)
		})

		if (soundMatch) {
			this.setState({currentSound: soundMatch})
			return soundMatch	
		}
		else {
			return currentSound
		}
	}

	downloadSound() {
		const currentSound = this.getCurrentSound()
		if (currentSound) {
			const soundUrl = this.soundUrls[currentSound['_id']]
			window.open(soundUrl, '_blank')
		}
	}

	playSound(pitchValue) {
		const currentSound = this.getCurrentSound()

		if (this.players && currentSound) {
			const player = this.players.get(currentSound['_id'])
			if (player) {
				try { player.start() }
				catch(err) { console.log('error playing sound: ' + currentSound) }
			}
			else { console.log('does not exist: ' + currentSound) }
		}
	}
	
	updateKeyPressed(data) {
    const pitch = data.pitch
    const active = data.active
		// console.log("key:"+data.key, "pitch:"+pitch, active)

		if (active === true) { 
			this.playSound(pitch)
		}
	}
	
	updateGridSelector(data) {
		this.setState({
			selectedSoundSpaceId: data.value
		}, () => {
			this.loadGrid()
		})
	}

	convert_XY_LatentSpace(x,y) {
		// x,y are values between [0.00, 1.00]
		// NW = [0,0]
		// NE = [1,0]
		// SE = [1,1]
		// SW = [0,1]
		return [
			Math.round( 10 * (1-x)*(1-y) ) / 10,
			Math.round( 10 * (x)*(1-y) ) / 10,
			Math.round( 10 * (x)*(y) ) / 10,
			Math.round( 10 * (1-x)*(y) ) / 10
		]
	}

	convert_LatentSpace_XY(NW, NE, SE, SW) {
		// input values between [0.00, 1.00]
		// NW = [0,0]
		// NE = [1,0]
		// SE = [1,1]
		// SW = [0,1]

		let x = Math.round( 10 * ( 0.5 + (NE + SE)/2 - (NW + SW)/2 )) / 10
		let y = Math.round( 10 * ( 0.5 + (SE + SW)/2 - (NW + NE)/2 )) / 10

		// console.log('------------')
		// console.log(NW, NE, SE, SW)
		// console.log( x , y )

		return [ x , y ]
	}


  updateLatentSelector(data) {
    const x = parseFloat(data.x).toFixed(1)
		const y = parseFloat(data.y).toFixed(1)
		// de-activated for now
		// --------------------
		// const hasBeenActivated = data.hasBeenActivated

		var latentSpace = this.convert_XY_LatentSpace(x,y)

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
		})
    
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
      content = 
				<div>
					<DownloadSound 
						downloadSound={this.downloadSound.bind(this)}
					/>
					<br/>
					{
						this.props.features.gridSelector ?
						<Hidden xsDown>
							<GridSelector 
								changeHandler={this.updateGridSelector.bind(this)}
								defaultValue={this.props.data.default.selectedSoundSpaceId}
								options={this.props.data.grids}
							/>
							<br/>
						</Hidden>
						:
						null
					}
					<br/>
					
					<LatentSelector 
						changeHandler={this.updateLatentSelector.bind(this)}
						loading={this.state.latentSpaceLoading}
						labelNW={this.state.labelNW}
						labelNE={this.state.labelNE}
						labelSE={this.state.labelSE}
						labelSW={this.state.labelSW}
						latentSpaces={this.state.latentSpaces}
						latentResolution={this.state.latentResolution}
					/>
					<br/>
					{
						this.props.features.pitchSelector ?
						<PitchSlider
							min={this.props.data.default.pitch.min}
							max={this.props.data.default.pitch.max}
							step={this.props.data.default.pitch.stepSize}
							defaultValue={this.state.pitch}
							handleChange={this.updatePitch.bind(this)}
						/>
						:
						null
					}
					<br/>
					<PlaySound 
						playSound={this.playSound.bind(this)}
						playTimeout={500}
					/>
					<br/>
					{
						this.props.features.keyboardPlayer ?
						<Hidden xsDown>
							<Keyboard 
								updateKeyPressed={this.updateKeyPressed.bind(this)}
							/>
						</Hidden>
						:
						null
					}
				</div>
    }

    return (
			<div style={style.content}>
				{content}
			</div>
    )
  }
}

export default compose(
  withStyles(style),
  withWidth(),
)(LatentExplorer)
