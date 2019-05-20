import React, { Component } from 'react'
import axios from 'axios'
import Tone from 'tone'
import CircularProgress from '@material-ui/core/CircularProgress'
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'
import Hidden from '@material-ui/core/Hidden'
import withWidth from '@material-ui/core/withWidth'

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
			latentSpaces: null
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
					console.log(err)
				})
				.finally( () => {
					axios.get(this.props.api + '/sound-spaces/' + this.props.soundSpace + '/files')
						.then((res) => {
							this.setState({latentSpaces: res.data})
						})
						.catch((err) => {
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
		// const selectedSoundSpaceId = this.state.selectedSoundSpaceId
		// const selectedSoundSpace = this.props.data.grids.find(grid => selectedSoundSpaceId === grid.id)
		const selectedSoundSpace = this.state.selectedSoundSpace

		this.setState({latentSpaceLoading: true})

		if (selectedSoundSpace) {
			this.setState({
				labelNW: selectedSoundSpace.labels.NW,
				labelNE: selectedSoundSpace.labels.NE,
				labelSW: selectedSoundSpace.labels.SW,
				labelSE: selectedSoundSpace.labels.SE
				// labelNW: selectedSoundSpace.labels.find(label => label.position === 'NW') || {name: this.state.notConfiguredText},
				// labelNE: selectedSoundSpace.labels.find(label => label.position === 'NE') || {name: this.state.notConfiguredText},
				// labelSW: selectedSoundSpace.labels.find(label => label.position === 'SW') || {name: this.state.notConfiguredText},
				// labelSE: selectedSoundSpace.labels.find(label => label.position === 'SE') || {name: this.state.notConfiguredText},
			}, () => {
				this.downloadSoundFiles()
				this.loadPlayer()
			})
		}	
	}

	downloadSoundFiles() {

		const selectedSoundSpace = this.state.selectedSoundSpace
		const latentSpaces = this.state.latentSpaces
		const baseUrl = 'https://storage.googleapis.com/sound-gen-dev'
		this.soundUrls = {}

		latentSpaces.forEach((latentSpace) => {
			// get urls for each sound
			const name = latentSpace.file
			const fileLocation = `${baseUrl}/${latentSpace.path}/${latentSpace.file}`
			this.soundUrls[name] = fileLocation	
		})

	}

	loadPlayer() {
		// timeout makes initial loading animation smoother
		setTimeout(() => {
			this.players = new Tone.Players(this.soundUrls, () => {
				this.setState({loading:false})
				this.setState({latentSpaceLoading: false})
			}).toMaster()	
		}, 500)
	}

	updatePitch(data) {
		this.setState({ pitch: data.pitch })
	}

	getCurrentSound(pitchValue) {
		const pitch = pitchValue || this.state.pitch
		const latentSpace = `${this.state.latentRatioNW}`
												+ `_${this.state.latentRatioNE}`
												+ `_${this.state.latentRatioSW}`
												+ `_${this.state.latentRatioSE}`
		const currentSound = latentSpace + '_pitch_' + pitch

		return currentSound
	}

	downloadSound() {
		const currentSound = this.getCurrentSound()
		const soundUrl = this.soundUrls[currentSound]
		window.open(soundUrl, '_blank')
	}

	playSound(pitchValue) {
		const currentSound = this.getCurrentSound(pitchValue)

		if (this.players) {
			const player = this.players.get(currentSound)
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

  updateLatentSelector(data) {
    const x = parseFloat(data.x).toFixed(1)
		const y = parseFloat(data.y).toFixed(1)
		// de-activated for now
		// --------------------
		// const hasBeenActivated = data.hasBeenActivated

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
			// de-activated for now
			// --------------------
			// if (hasBeenActivated === true) { this.playSound() }
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
