import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Slider from '@material-ui/lab/Slider'
import Typography from '@material-ui/core/Typography'

const style = {
	wrapper: {
    margin: 'auto',
    maxWidth: 440
	},
  slider: {
    padding: '22px 0px',
    margin: 'auto',
    maxWidth: 600,
    touchAction: 'none'
  },
  label: {
    color: 'white'
  }
}

class PitchSlider extends Component {

  constructor(props) {
    super(props)
    this.state = {
      value: 0 // can override by setting 'defaultValue'
    }
  }
  
  componentDidMount() {
    const defaultValue = this.props.defaultValue
    this.setState({value: defaultValue})
  }

	handleChange = (event, value) => {
    this.setState({value:value})
		this.props.handleChange({pitch: value})
	}
	
  render() {

		let content = 
      <div>
        <Typography 
          id="label"
          style={style.label}
        >
          Pitch
        </Typography>
        <Slider
          style={style.slider}
          value={this.state.value}
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          onChange={this.handleChange}
        />
      </div>

    return (
        <div style={style.wrapper}>
          {content}
        </div>
    )
  }
}

PitchSlider.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(style)(PitchSlider)
