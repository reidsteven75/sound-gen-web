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
											<MDBCol sm="1"><KeyboardKey label='W'/></MDBCol>
											<MDBCol sm="1"><KeyboardKey label='E'/></MDBCol>
											<MDBCol sm="1"></MDBCol>
											<MDBCol sm="1"><KeyboardKey label='T'/></MDBCol>
											<MDBCol sm="1"><KeyboardKey label='Y'/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='U'/></MDBCol>
											<MDBCol xs="2"></MDBCol>
										</MDBRow>

										<MDBRow style={style.keyboardBottom}>
											<MDBCol xs="2"></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='A'/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='S'/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='D'/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='F'/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='G'/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='H'/></MDBCol>
											<MDBCol xs="1"><KeyboardKey label='J'/></MDBCol>
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
