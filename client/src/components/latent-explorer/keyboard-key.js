import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import teal from '@material-ui/core/colors/teal'

const style = {
	wrapper: {

	},
	key: {
		width:'100%',
		paddingLeft: 0,
		paddingRight: 0,
		border: '1px solid ' + teal['A400']
	},
	keyActive: {
		width:'100%',
		paddingLeft: 0,
		paddingRight: 0,
		background: teal['A700'],
		border: '1px solid ' + teal['A400']
	},
}

class KeyboardKey extends Component {

  constructor(props) {
    super(props)
    this.state = {
			isActive: false,
			color: 'default'
		}
	}

	updateKeyPressed(active) {
		this.props.updateKeyPressed({
			key: this.props.label,
			pitch: this.props.pitch,
			active: active
		})
	}
	
	handleMouseEnter() {

	}

	handleMouseOut() {
		this.setState({isActive: false})
	}

	handleMouseDown() {
		this.setState({isActive: true})
		this.updateKeyPressed(true)
	}

	handleMouseUp() {
		this.setState({isActive: false})
		this.updateKeyPressed(false)
	}

	handleKeyDown(e) {
		if (e.key.toLowerCase() === this.props.label.toLowerCase()) {
			if (this.state.isActive !== true) {
				this.updateKeyPressed(true)
			}
			this.setState({isActive: true})	
		}
	}

	handleKeyUp(e) {
		if (e.key.toLowerCase() === this.props.label.toLowerCase()) {
			this.setState({isActive: false})
			this.updateKeyPressed(false)
		}
	}

  componentDidMount(){
		document.addEventListener("keydown", this.handleKeyDown.bind(this), false)
		document.addEventListener("keyup", this.handleKeyUp.bind(this), false)

  }
  componentWillUnmount(){
		document.removeEventListener("keydown", this.handleKeyDown.bind(this), false)
		document.removeEventListener("key", this.handleKeyUp.bind(this), false)
  }

  render() {

		let content = 
			<Button 
				style={this.state.isActive ? style.keyActive : style.key}
				color={"secondary"}
				size={"small"}
				onMouseDown={this.handleMouseDown.bind(this)}
				onMouseUp={this.handleMouseUp.bind(this)}
				onMouseEnter={this.handleMouseEnter.bind(this)}
				onMouseOut={this.handleMouseOut.bind(this)}
			>
					{this.props.label}
			</Button>

    return (
        <div style={style.wrapper}>
          {content}
        </div>
    )
  }
}

KeyboardKey.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(style)(KeyboardKey)
