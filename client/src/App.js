import React, { Component } from 'react'

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import blue from '@material-ui/core/colors/blue'
import teal from '@material-ui/core/colors/teal'

import LatentExplorer from './components/latent-explorer/index'

// data
import latentSpaces from './data/latent-spaces.json'
import pitches from './data/pitches.json'
import grids from './data/grids.json'

import './App.css'

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



class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          <main className="App-main">
            <LatentExplorer
              data={data}
            />
          </main>
        </div> 
      </MuiThemeProvider>
    )
  }
}

export default App;
