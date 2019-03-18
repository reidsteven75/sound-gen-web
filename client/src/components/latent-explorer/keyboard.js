import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

import KeyboardKey from './keyboard-key'

const style = {
	wrapper: {
		maxWidth: 700,
		margin: 'auto'
	},
	keyboardTop: {

	},
	keyboardBottom: {
		marginTop:5
	},
	keyWrapper: {
		marginRight:10,
		marginLeft:10,
	}
}

class Keyboard extends Component {

  constructor(props) {
    super(props)
    this.state = {
			isActive: false,
			color: 'default'
    }
	}

  render() {

		let content = 
			<div>
				<Grid 
					container 
					spacing={8} 
					style={style.keyboardTop}
					justify="center"
					alignItems="center"
				>
					<Grid item xs={1} style={style.keyWrapper}><KeyboardKey label='W' pitch={40} updateKeyPressed={this.props.updateKeyPressed}/></Grid>
					<Grid item xs={1} style={style.keyWrapper}><KeyboardKey label='E' pitch={48} updateKeyPressed={this.props.updateKeyPressed}/></Grid>
					<Grid item xs={1} style={style.keyWrapper}><KeyboardKey label='R' pitch={56} updateKeyPressed={this.props.updateKeyPressed}/></Grid>
					<Grid item xs={1} style={style.keyWrapper}><KeyboardKey label='T' pitch={64} updateKeyPressed={this.props.updateKeyPressed}/></Grid>
					<Grid item xs={1} style={style.keyWrapper}><KeyboardKey label='Y' pitch={72} updateKeyPressed={this.props.updateKeyPressed}/></Grid>
					<Grid item xs={1} style={style.keyWrapper}><KeyboardKey label='U' pitch={80} updateKeyPressed={this.props.updateKeyPressed}/></Grid>
				</Grid>

				<Grid 
					container 
					spacing={8} 
					style={style.keyboardBottom}
					justify="center"
					alignItems="stretch"
				>
					<Grid item xs={1} style={style.keyWrapper}><KeyboardKey label='A' pitch={36} updateKeyPressed={this.props.updateKeyPressed}/></Grid>
					<Grid item xs={1} style={style.keyWrapper}><KeyboardKey label='S' pitch={44} updateKeyPressed={this.props.updateKeyPressed}/></Grid>
					<Grid item xs={1} style={style.keyWrapper}><KeyboardKey label='D' pitch={52} updateKeyPressed={this.props.updateKeyPressed}/></Grid>
					<Grid item xs={1} style={style.keyWrapper}><KeyboardKey label='F' pitch={60} updateKeyPressed={this.props.updateKeyPressed}/></Grid>
					<Grid item xs={1} style={style.keyWrapper}><KeyboardKey label='G' pitch={68} updateKeyPressed={this.props.updateKeyPressed}/></Grid>
					<Grid item xs={1} style={style.keyWrapper}><KeyboardKey label='H' pitch={76} updateKeyPressed={this.props.updateKeyPressed}/></Grid>
					<Grid item xs={1} style={style.keyWrapper}><KeyboardKey label='J' pitch={84} updateKeyPressed={this.props.updateKeyPressed}/></Grid>
				</Grid>
			</div>
				
    return (
        <div style={style.wrapper}>
          {content}
        </div>
    )
  }
}

Keyboard.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(style)(Keyboard)