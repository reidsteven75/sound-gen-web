import React, { Component } from 'react'
import Tone from 'tone'
import CircularProgress from '@material-ui/core/CircularProgress'
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'
import Hidden from '@material-ui/core/Hidden'
import withWidth from '@material-ui/core/withWidth'

import PitchSlider from './pitch-slider'
import Keyboard from './keyboard'
import LatentSelector from './latent-selector'

const style = {
  content: {
		padding: 20,
		width: '100%'
	}
}

class LatentExplorer extends Component {

	initPlayer() {
		// timeout makes initial loading animation smoother
		setTimeout(() => {
			this.players = new Tone.Players(this.soundUrls, () => {
				this.setState({loading:false})
			}).toMaster()	
		}, 500)
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
			pitch: 0,
		}

		this.initPlayer = this.initPlayer.bind(this)

		this.soundUrls = {}
	}
	

  componentDidMount() {
		const latentSpaces = this.props.data.latentSpaces
		const baseUrl = `${this.props.data.fileUrl.storagePath}/${this.props.data.fileUrl.bucket}`

		this.setState({pitch: this.props.data.default.pitch.value})

		latentSpaces.forEach((latentSpace) => {
			// get urls for each sound
			this.props.data.pitches.forEach((pitch) => {
				const name = `${latentSpace}_pitch_${pitch.value}`
				const fileUrl = `${baseUrl}${this.props.data.fileUrl.folderPath}/${this.props.data.fileUrl.gridName}_${name}_vel_127.mp3`
				this.soundUrls[name] = fileUrl	
			})	
		})

		this.initPlayer()
	}

	updatePitch(data) {
		this.setState(
			{ pitch: data.pitch }, 
		() => {
			this.playSound()
		})
	}

	playSound() {
		const pitch = this.state.pitch
		const latentSpace = `${this.state.latentRatioNW}`
													+ `_${this.state.latentRatioNE}`
													+ `_${this.state.latentRatioSW}`
													+ `_${this.state.latentRatioSE}`

		if (this.players) {
			const playerName = latentSpace + '_pitch_' + pitch
			const player = this.players.get(playerName)
			if (player) {
				try { player.start() }
				catch(err) { console.log('error playing sound: ' + playerName) }
			}
			else { console.log('does not exist: ' + playerName) }
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
      content = 
				<div>
					<LatentSelector 
						updateLatentSelector={this.updateLatentSelector.bind(this)}
						sounds={this.props.data.sounds}
					/>
					<br/>
					<PitchSlider
						min={this.props.data.default.pitch.min}
						max={this.props.data.default.pitch.max}
						step={this.props.data.default.pitch.stepSize}
						defaultValue={this.state.pitch}
						handleChange={this.updatePitch.bind(this)}
					/>
					<br/>
					<Hidden xsDown>
						<Keyboard 
							updateKeyPressed={this.updateKeyPressed.bind(this)}
						/>
					</Hidden>
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
