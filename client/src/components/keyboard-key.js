import React, { Component } from 'react'
import { MDBBtn } from 'mdbreact'

const style = {
	wrapper: {

	},
	key: {
		width:'100%',
		paddingLeft: 0,
    paddingRight: 0
	}
}

class KeyboardKey extends Component {

  config = {
    
  }

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
		this.setState({color: 'info'})
	}

	handleMouseOut() {
		this.setState({color: 'default'})
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
			this.setState({color: 'info'})	
		}
	}

	handleKeyUp(e) {
		if (e.key.toLowerCase() === this.props.label.toLowerCase()) {
			this.setState({isActive: false})
			this.setState({color: 'default'})
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

		let content = <MDBBtn 
										style={style.key}
										outline={!this.state.isActive} 
										color={this.state.color}
										onMouseDown={this.handleMouseDown.bind(this)}
										onMouseUp={this.handleMouseUp.bind(this)}
										onMouseEnter={this.handleMouseEnter.bind(this)}
										onMouseOut={this.handleMouseOut.bind(this)}
										size='sm'>
											{this.props.label}
									</MDBBtn>
      
    return (
        <div style={style.wrapper}>
          {content}
        </div>
    )
  }
}

export default KeyboardKey
