import React, { Component } from 'react'
import { MDBContainer, MDBRow, MDBCol } from 'mdbreact'
import KeyboardKey from './keyboard-key'

const style = {
	wrapper: {

	},
	keyboardTop: {
		position: 'relative',
		left: 48 + 40
	},
	keyboardBottom: {
		position: 'relative',
		left: 40
	}
}

class Keyboard extends Component {

  config = {
    
  }

  constructor(props) {
    super(props)
    this.state = {
			isActive: false,
			color: 'default'
    }
	}


  componentDidMount() {

  }

  render() {

		let content = <MDBContainer>
										<MDBRow style={style.keyboardTop}>
											<MDBCol xs="2"></MDBCol>
											<MDBCol sm="1"><KeyboardKey label='W' pitch={30} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol sm="1"><KeyboardKey label='E' pitch={31} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol sm="1"></MDBCol>
											<MDBCol sm="1"><KeyboardKey label='T' pitch={32} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol sm="1"><KeyboardKey label='Y' pitch={33} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='U' pitch={34} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="2"></MDBCol>
										</MDBRow>

										<MDBRow style={style.keyboardBottom}>
											<MDBCol xs="2"></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='A' pitch={34} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='S' pitch={35} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='D' pitch={36} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='F' pitch={37} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='G' pitch={38} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='H' pitch={39} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='J' pitch={40} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="2"></MDBCol>
										</MDBRow>
									</MDBContainer>
      
    return (
        <div style={style.wrapper}>
          {content}
        </div>
    )
  }
}

export default Keyboard
