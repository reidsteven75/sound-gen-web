import React, { Component } from 'react'
import { observable } from 'mobx'
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from 'mdbreact'

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
			serverError: false,
			testAction: false
		}
		
		this.testRef = React.createRef();
  }

  componentDidMount() {
    // App loading animation
    setTimeout(() => {
      this.setState({loading:false})
		}, 1000)
		
		setInterval(() => {
			this.setState({testAction: !this.state.testAction})
			console.log(this.state.testAction)
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
            <MDBCol sm="1"><MDBBtn action={this.state.testAction} size='sm' outline>W</MDBBtn></MDBCol>
						<MDBCol sm="1"><MDBBtn size='sm' outline>E</MDBBtn></MDBCol>
						<MDBCol sm="1"></MDBCol>
						<MDBCol sm="1"><MDBBtn size='sm' outline>T</MDBBtn></MDBCol>
						<MDBCol sm="1"><MDBBtn size='sm' outline>Y</MDBBtn></MDBCol>
						<MDBCol xs="1"><MDBBtn size='sm' outline>J</MDBBtn></MDBCol>
            <MDBCol xs="2"></MDBCol>
          </MDBRow>

					<MDBRow style={style.keyboardBottom}>
						<MDBCol xs="2"></MDBCol>
						<MDBCol xs="1"><MDBBtn size='sm' outline>A</MDBBtn></MDBCol>
						<MDBCol xs="1"><MDBBtn size='sm' outline>S</MDBBtn></MDBCol>
						<MDBCol xs="1"><MDBBtn size='sm' >D</MDBBtn></MDBCol>
						<MDBCol xs="1"><MDBBtn size='sm' outline>F</MDBBtn></MDBCol>
						<MDBCol xs="1"><MDBBtn size='sm' outline>G</MDBBtn></MDBCol>
						<MDBCol xs="1"><MDBBtn size='sm' outline>H</MDBBtn></MDBCol>
						<MDBCol xs="1"><MDBBtn size='sm' outline>K</MDBBtn></MDBCol>
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
