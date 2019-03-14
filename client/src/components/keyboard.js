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
											<MDBCol sm="1"><KeyboardKey label='W' pitch={40} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol sm="1"><KeyboardKey label='E' pitch={48} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol sm="1"><KeyboardKey label='R' pitch={56} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol sm="1"><KeyboardKey label='T' pitch={64} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol sm="1"><KeyboardKey label='Y' pitch={72} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='U' pitch={80} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="2"></MDBCol>
										</MDBRow>

										<MDBRow style={style.keyboardBottom}>
											<MDBCol xs="2"></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='A' pitch={36} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='S' pitch={44} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='D' pitch={52} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='F' pitch={60} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='G' pitch={68} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='H' pitch={76} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='J' pitch={84} updateKeyPressed={this.props.updateKeyPressed}/></MDBCol>
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
