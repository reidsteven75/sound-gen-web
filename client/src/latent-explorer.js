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
			serverError: false
		}

		this.synth = new Tone.Synth().toMaster()
	

  }

  componentDidMount() {
    // App loading animation
    setTimeout(() => {
      this.setState({loading:false})
		}, 1000)
		
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
										updateLatentSelector={this.props.updateLatentSelector}
										sounds={this.props.data.sounds}
									/>
									<br/>
									<Keyboard 
										updateKeyPressed={this.props.updateKeyPressed}
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
