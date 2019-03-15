import React, { Component } from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'

// import GenerateBlend from './generate-blend'
import LatentExplorer from './latent-explorer'
import { observable } from 'mobx'
import latentSpaces from './data/latent-spaces.json'

import './App.css'

var data = {
  latentSpaces: latentSpaces,
  sounds: [
    {
      name: 'Strings',
      position: 'NW'
    },
    {
      name: 'Bells',
      position: 'NE'
    },
    {
      name: 'Synth',
      position: 'SW'
    },
    {
      name: 'Guitar',
      position: 'SE'
    }
  ]
}

class App extends Component {

  appState = observable.object({
 
  })

  componentDidMount(){

  }
  componentWillUnmount(){

  }

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
