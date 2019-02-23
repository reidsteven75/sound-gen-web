import React, { Component } from 'react'

import { MDBBtn } from 'mdbreact'

const style = {
	wrapper: {

	},
	key: {
		width:'100%'
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
	
	handleMouseEnter() {
		this.setState({color: 'primary'})
	}

	handleMouseOut() {
		this.setState({color: 'default'})
		this.setState({isActive: false})
	}

	handleMouseDown() {
		this.setState({isActive: true})
	}

	handleMouseUp() {
		this.setState({isActive: false})
	}

	handleKeyDown(e) {
		if (e.key.toLowerCase() === this.props.label.toLowerCase()) {
			this.setState({isActive: true})
			this.setState({color: 'primary'})
		}
	}

	handleKeyUp(e) {
		if (e.key.toLowerCase() === this.props.label.toLowerCase()) {
			this.setState({isActive: false})
			this.setState({color: 'default'})
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
