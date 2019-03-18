import React, { Component } from 'react'
import { MDBBtn } from 'mdbreact'

const style = {
	wrapper: {

  },
  input: {
		width:'100%',
		height: '60px'
	}
}

class LatentSelectorInput extends Component {

  constructor(props) {
    super(props)
    this.state = {
			isActive: false,
			color: 'secondary'
    }
	}
	
	handleMouseEnter() {
		this.setState({color: 'danger'})
	}

	handleMouseOut() {
		this.setState({color: 'secondary'})
		this.setState({isActive: false})
	}

	handleMouseDown() {
		this.setState({isActive: true})
	}

	handleMouseUp() {
		this.setState({isActive: false})
	}

  render() {

		let content = 
			<MDBBtn 
				style={style.input}
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

export default LatentSelectorInput
