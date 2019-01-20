import React, { Component } from 'react'
import { observer } from 'mobx-react'
import * as mm from '@magenta/music'

const style = {
  wrapper: {
		border: '1px solid black',
		height: '80px',
		width: 'auto',
		margin: 'auto',
		padding: '15px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'scroll'
  }
}

class VisualizerLines extends Component {

  constructor(props) {
		super(props)
		this.state = {
			loading: true
		}
	}

	visualizeSample(sample) {
		const sequence = sample
		const canvas = this.refs.canvas
		const config = {
			noteHeight: 1,
			noteSpacing: 1,
			pixelsPerTimeStep: 1,
			noteRGB: '152, 255, 152',
			activeNoteRGB: '220, 20, 60'
		}
		new mm.Visualizer(sequence, canvas, config)
	}

	componentDidUpdate() {
		if (this.props.sample) {
			this.visualizeSample(this.props.sample)
		}
	}

  componentDidMount() {

	}

  render() {

	return (
		<div style={style.wrapper}>
		  <canvas ref="canvas" width={'100%'} height={'100%'} />
		</div>
	)
  }
}

export default observer(VisualizerLines)
