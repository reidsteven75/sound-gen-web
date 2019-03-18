import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Slider from '@material-ui/lab/Slider'
import Typography from '@material-ui/core/Typography'

const style = {
	wrapper: {
    margin: 'auto',
    maxWidth: 700
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

class VelocitySlider extends Component {

  constructor(props) {
    super(props)
    this.state = {
      value: 50, // TODO: set this from parent component
    }
	}

	handleChange = (event, value) => {
    this.setState({value:value})
		this.props.handleChange({velocity: value})
	}
	
  render() {

		let content = <div>
                    <Typography 
                      id="label"
                      style={style.label}
                    >
                      Velocity
                    </Typography>
                    <Slider
                      style={style.slider}
                      value={this.state.value}
                      min={this.props.min}
                      max={this.props.max}
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

VelocitySlider.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(style)(VelocitySlider)
