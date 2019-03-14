import React, { Component } from 'react'
// import GenerateBlend from './generate-blend'
import LatentExplorer from './latent-explorer'
import { observable } from 'mobx'
import latentSpaces from './data/latent-spaces.json'

import './App.css'

var data = {
  latentSpaces: latentSpaces,
  sounds: [
    {
      name: 'Strings Ensemble',
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
      name: 'Electric Guitar',
      position: 'SE'
    }
  ]
}

class App extends Component {

  appState = observable.object({
 
  })

  componentDidMount(){
		// document.addEventListener("keydown", this.handleKeyDown.bind(this), false)
		// document.addEventListener("keyup", this.handleKeyUp.bind(this), false)
  }
  componentWillUnmount(){
		// document.removeEventListener("keydown", this.handleKeyDown.bind(this), false)
		// document.removeEventListener("key", this.handleKeyUp.bind(this), false)
  }

  render() {
    return (
      <div className="App">
        <main className="App-main">
          <LatentExplorer
            data={data}
          />
        </main>
      </div> 
    )
  }
}

export default App;
