import React, { Component } from 'react'
import openSocket from 'socket.io-client'
import { MoonLoader } from 'react-spinners'
// import axios from 'axios'
// import _ from 'lodash'
// import * as moment from 'moment'

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import cyan from '@material-ui/core/colors/cyan'
import red from '@material-ui/core/colors/red'

import './App.css';

const serverUrl = process.env.REACT_APP_SERVER_URL

const theme = createMuiTheme({
  palette: {
    primary: {
      light: cyan[300],
      main: cyan[500],
      dark: cyan[700],
    },
    secondary: {
      light: red[300],
      main: red[500],
      dark: red[700],
    },
  },
  typography: {
    useNextVariants: true,
  }
})

const socket = openSocket(serverUrl)
socket.on('connect', function () { 
  // console.log('[socket]: connected')
})
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
      content = <div>
                  <MoonLoader
                    color={'#36D7B7'}
                    />
                </div>
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
      </div>
    }

    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <main className="App-main">
            {content}
          </main>
        </div> 
      </MuiThemeProvider>
    )
  }
}

export default App;
