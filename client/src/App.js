import React, { Component } from 'react'
import { observable } from 'mobx'
// import openSocket from 'socket.io-client'
// import axios from 'axios'
// import _ from 'lodash'
// import * as moment from 'moment'

import { MDBContainer, MDBRow, MDBCol } from 'mdbreact'
import Blender from './components/blender'
import SampleGenerator from './components/sample-generator'

import './App.css'

// const serverUrl = process.env.REACT_APP_SERVER_URL

// const socket = openSocket(serverUrl)
// socket.on('connect', function () { 
//   console.log('[socket]: connected')
// })

const models = {
  generator: [
    'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_16bar_small_q2',
    'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_2bar_hikl_small'
  ],
  blender: [
    'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/trio_4bar'
  ]
}

const style = {
  content: {
    width: '80%',
    padding: 20
  }
}

class App extends Component {

  appState = observable.object({
    samples: [],
    selectedBlendSampleId: null
  })

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      serverError: false
    }
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
      content = <div style={style.content}>
        <MDBContainer>
          <MDBRow>
            <MDBCol sm="6">
              <SampleGenerator 
                id={0}
                modelUrl={models.generator[0]}
                observable={this.appState}
              />
            </MDBCol>
            <MDBCol sm="6">
              <SampleGenerator 
                id={1}
                modelUrl={models.generator[1]}
                observable={this.appState}
              />
            </MDBCol>
          </MDBRow>
          <MDBRow>
            <MDBCol sm="12">
              <Blender 
                observable={this.appState}
                modelUrl={models.blender[0]}
              />
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </div>
    }

    return (
      <div className="App">
        <main className="App-main">
          {content}
        </main>
      </div> 
    )
  }
}

export default App;
