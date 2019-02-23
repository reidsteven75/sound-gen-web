import React, { Component } from 'react'

import { MDBBtn } from 'mdbreact'

const style = {
    wrapper: {

    }
}

class KeyboardKey extends Component {

  config = {
    defaultSampleSelected: 1
  }

  constructor(props) {
    super(props)
    this.state = {
			isActive: false
    }
  }

  componentDidMount() {
		setInterval(() => {
			this.setState({isActive: !this.state.isActive})
    }, 1000)
  }

  render() {

		let content = <MDBBtn 
										outline={this.state.isActive} 
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
