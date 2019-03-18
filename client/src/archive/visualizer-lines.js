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
		overflow: 'hidden'
	},
	wrapperSelected: {
		border: '1px solid #B0FBA2',
		height: '80px',
		width: 'auto',
		margin: 'auto',
		padding: '15px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden'
  }
}

class VisualizerLines extends Component {

	visualizer: null

  constructor(props) {
		super(props)
		this.state = {
			loading: true
		}
	}

	selectSample() {
		if (this.props.id) {
			this.props.observable.selectedBlendSampleId = this.props.id
		}
	}

	initVisualization(sample) {
		const sequence = sample
		const canvas = this.refs.canvas
		const config = {
			noteHeight: 1,
			noteSpacing: 1,
			pixelsPerTimeStep: 2,
			noteRGB: '152, 255, 152'
			// activeNoteRGB: '220, 20, 60'
		}
		this.visualizer = new mm.Visualizer(sequence, canvas, config)
	}

	componentDidUpdate() {
		if (this.props.sample) {
			this.initVisualization(this.props.sample)
		}
	}

  componentDidMount() {

	}

  render() {

		let isSelected
		if (this.props.observable.selectedBlendSampleId) {
			isSelected = ( this.props.id === this.props.observable.selectedBlendSampleId )
		}

		return (
				<div 
					style={isSelected ? style.wrapperSelected : style.wrapper}
					onClick={this.selectSample.bind(this)} 
				>
					<canvas ref="canvas" width={'100%'} height={'100%'} />
				</div>
		)
  }
}

export default observer(VisualizerLines)
