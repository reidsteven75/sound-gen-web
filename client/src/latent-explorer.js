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

		this.synth = new Tone.Synth().toMaster()
	

  }

  componentDidMount() {
    // App loading animation
    setTimeout(() => {
      this.setState({loading:false})
		}, 1000)
		
	}
	
	updateKeyPressed(data) {
    const key = data.key
    const pitch = data.pitch
    const active = data.active

    console.log(key, pitch, active)
  }

  updateLatentSelector(data) {
    const x = data.x
		const y = data.y

		console.log(x, y)
		
		// this.setState({
		// 	latentRatioNW: Math.round( 10 * Math.sqrt(Math.pow((1-x), 2) + Math.pow((1-y), 2))) / 10,
		// 	latentRatioNE: Math.round( 10 * Math.sqrt(Math.pow((x), 2) + Math.pow((1-y), 2))) / 10,
		// 	latentRatioSW: Math.round( 10 * Math.sqrt(Math.pow((1-x), 2) + Math.pow((y), 2))) / 10,
		// 	latentRatioSE: Math.round( 10 * Math.sqrt(Math.pow((x), 2) + Math.pow((y), 2))) / 10
		// })

		this.setState({
			latentRatioNW: Math.round( 10 * (1-x)*(1-y) ) / 10,
			latentRatioNE: Math.round( 10 * (x)*(1-y) ) / 10,
			latentRatioSW: Math.round( 10 * (1-x)*(y) ) / 10,
			latentRatioSE: Math.round( 10 * (x)*(y) ) / 10
		})
    
  }

  render() {
		console.log(this.state.latentRatioNW, this.state.latentRatioNE, this.state.latentRatioSW, this.state.latentRatioSE)
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
