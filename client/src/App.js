import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import './App.css'

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import blue from '@material-ui/core/colors/blue'
import teal from '@material-ui/core/colors/teal'

import LatentExplorer from './components/latent-explorer'
import Dashboard from './components/dashboard'

// data
import latentSpaces from './data/latent-spaces.json'
import pitches from './data/pitches.json'
import grids from './data/grids.json'

const HTTPS = (process.env.HTTPS === 'true')
const API = (HTTPS ? 'https://' : 'http://') + process.env.HOST + ':' + process.env.SERVER_PORT + '/api'

const features = {
  keyboardPlayer: false,
  pitchSelector: false,
  gridSelector: false
}

var data = {
  latentSpaces: latentSpaces,
  pitches: pitches,
  grids: grids,
  default: {
    selectedGridId: 'grid_1',
    pitch: {
      value: 40,
      min: 36,
      max: 84,
      stepSize: 4
    }
  }
}

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      light: blue[300],
      main: blue[500],
      dark: blue[700],
    },
    secondary: {
      light: teal['A200'],
      main: teal['A400'],
      dark: teal['A700'],
    },
  },
  typography: {
    useNextVariants: true,
  },
})

const latentExplorer = ({ match }) => {
  return (
    <LatentExplorer
      api={API}
      data={data}
      features={features}
      soundSpace={match.params.id}
    />
  )
}

const dashboard = () => {
  return (
    <Dashboard
      api={API}
      data={data}
      features={features}
    />
  )
}

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <div className='App'>
          <main className='App-main'>
            <Router>
              <Route path='/' exact component={dashboard} />
              <Route path='/dashboard/' component={dashboard} />
              <Route path='/sound-spaces/:id' component={latentExplorer} />      
            </Router>
          </main>
        </div> 
      </MuiThemeProvider>
    )
  }
}

export default (App)
