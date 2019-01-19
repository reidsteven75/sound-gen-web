import React, { Component } from 'react'
// import openSocket from 'socket.io-client'
// import axios from 'axios'
// import _ from 'lodash'
// import * as moment from 'moment'

import MusicGenerator from './components/music-generator'

import './App.css';

// const serverUrl = process.env.REACT_APP_SERVER_URL

// const socket = openSocket(serverUrl)
// socket.on('connect', function () { 
//   console.log('[socket]: connected')
// })

const style = {
  content: {
    width: '80%',
    padding: 20
  }
}

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      serverError: false
    }
  }

  componentDidMount() {
    const _this = this

    // App loading animation
    setTimeout(function() {
      _this.setState({loading:false})
    }, 1000)
  }

  render() {
    let content
    if (this.state.loading === true) {
      content = <div className="loader medium fast"></div>
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
        <h2>Augmented Music Generation</h2>
        <MusicGenerator
        
        />
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
