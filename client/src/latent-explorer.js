import React, { Component } from 'react'
import { observable } from 'mobx'
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from 'mdbreact'

import KeyboardKey from './components/keyboard-key'

const style = {
  content: {
		padding: 20,
		width: '100%'
	},
	keyboardTop: {
		position: 'relative',
		left: 40
	},
	keyboardBottom: {
		position: 'relative'
	}
}

class LatentExplorer extends Component {

  appState = observable.object({

  })

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
			serverError: false
		}
		
		this.testRef = React.createRef();
  }

  componentDidMount() {
    // App loading animation
    setTimeout(() => {
      this.setState({loading:false})
		}, 1000)
		
  }

  render() {
    let content
    if (this.state.loading === true) {
      content = <div className="loader border-top-default medium fast"></div>
    }
    else if (this.state.serverError === true) {
      content = <div>
                  Server Unreachable
                  <br/>
                  <br/>
                  Try Reloading App
                </div>
    }
    else {
      content = <div>
        <MDBContainer>
					<MDBRow style={style.keyboardTop}>
						<MDBCol xs="2"></MDBCol>
            <MDBCol sm="1"><KeyboardKey label='W'/></MDBCol>
						<MDBCol sm="1"><KeyboardKey label='E'/></MDBCol>
						<MDBCol sm="1"></MDBCol>
						<MDBCol sm="1"><KeyboardKey label='T'/></MDBCol>
						<MDBCol sm="1"><KeyboardKey label='Y'/></MDBCol>
						<MDBCol xs="1"><KeyboardKey label='J'/></MDBCol>
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
						<MDBCol xs="1"><KeyboardKey label='K'/></MDBCol>
						<MDBCol xs="2"></MDBCol>
					</MDBRow>
        </MDBContainer>
      </div>
    }

    return (
			<div style={style.content}>
				{content}
			</div>
    )
  }
}

export default LatentExplorer;
