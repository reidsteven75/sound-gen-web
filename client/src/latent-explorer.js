import React, { Component } from 'react'
import Tone from 'tone'

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
			storagePath: 'http://storage.googleapis.com',
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
		],
		latentSpaces: [
			[1.0, 0.0, 0.0, 0.0],
		],
		velocity: 127
	}
	
	handleSamplerReady() {
		console.log('sampler ready')
	}

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
			serverError: false,
			latentRatioNW: 0,
			latentRatioNE: 0,
			latentRatioSW: 0,
			latentRatioSE: 0
		}

		var latentSpaces = []
		var space = [1.0, 0.0, 0.0, 0.0]
		var backup = 0
		var n = 1
		var x = 0
		var dim = 4
		while (x < dim - 1) {
			if (backup === 1500) { return x = dim }
			backup ++

			space[x] -= 0.1
			space[n] += 0.1
			space[x] = Math.round(space[x]*10) / 10
			space[n] = Math.round(space[n]*10) / 10

			// console.log(x, n)
			latentSpaces.push(space)
			// console.log(latentSpaces)

			if (space[n] === 1) {
				space[x] = 0.0
				space[n] = 0.0
				if (n === dim - 1) {
					x ++
					n = x + 1
				}
				else {
					n ++
				}
				space[x] = 1.0
				space[n] = 0.0
			}
		}
		console.log(latentSpaces)

		this.handleSamplerReady = this.handleSamplerReady.bind(this)  

		const baseUrl = `${this.config.fileUrl.storagePath}/${this.config.fileUrl.bucket}`
		var soundUrls = {}

		latentSpaces.forEach((ls) => {
			// console.log(ls)
			this.config.pitches.forEach((pitch) => {
				const sound = `${ls[0]}_${ls[1]}_${ls[2]}_${ls[3]}_pitch_${pitch.value}`
				const fileUrl = `${this.config.fileUrl.folderPath}/${this.config.fileUrl.gridName}_${sound}_vel_${this.config.velocity}.mp3`
				soundUrls[sound] = fileUrl
				// console.log(sound)
				// console.log(baseUrl + fileUrl)
			})
		})

		this.sampler = new Tone.Sampler(soundUrls, {
			release: 1,
			volume: 15,
			baseUrl: baseUrl,
			onload: this.handleSamplerReady()
		}).toMaster()
	
	}

  componentDidMount() {
    // App loading animation
    setTimeout(() => {
			this.setState({loading:false})
		}, 1000)

	}

	playSound(pitch) {
		const note = new Tone.Frequency(pitch, 'midi').toNote()
		this.sampler.triggerAttack(note) 
	}
	
	updateKeyPressed(data) {
    const key = data.key
    const pitch = data.pitch
    const active = data.active

		// console.log("key:"+key, "pitch:"+pitch, active)

		if (active === true) { 
			const sound = `${this.state.latentRatioNW}_${this.state.latentRatioNE}_${this.state.latentRatioSW}_${this.state.latentRatioSE}_pitch_${pitch}`
			console.log(sound)
			this.playSound(sound)
		}
  }

  updateLatentSelector(data) {
    const x = data.x
		const y = data.y

		this.setState({
			latentRatioNW: Math.round( 10 * (1-x)*(1-y) ) / 10,
			latentRatioNE: Math.round( 10 * (x)*(1-y) ) / 10,
			latentRatioSW: Math.round( 10 * (1-x)*(y) ) / 10,
			latentRatioSE: Math.round( 10 * (x)*(y) ) / 10
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
									<Keyboard 
										updateKeyPressed={this.updateKeyPressed.bind(this)}
									/>
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
