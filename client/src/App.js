import React, { Component } from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'

import LatentExplorer from './latent-explorer'

// data
import latentSpaces from './data/latent-spaces.json'
import pitches from './data/pitches.json'
import sounds from './data/sounds.json'

import './App.css'

var data = {
  latentSpaces: latentSpaces,
  pitches: pitches,
  sounds: sounds,
  fileUrl: {
    storagePath: 'https://storage.googleapis.com',
    bucket: 'augmented-music-generation-dev',
    folderPath: '/latent_grids/test',
    gridName: 'cleaned_grid_v3'
  },
  default: {
    pitch: {
      value: 72,
      min: 36,
      max: 84,
      stepSize: 4
    }
  }
}

class App extends Component {

  render() {
    return (
      <React.Fragment>
        <CssBaseline />
        <div className="App">
          <main className="App-main">
            <LatentExplorer
              data={data}
            />
          </main>
        </div> 
      </React.Fragment>
    )
  }
}

export default App;
