import React, { Component } from 'react'
// import GenerateBlend from './generate-blend'
import LatentExplorer from './latent-explorer'
import { observable } from 'mobx'

import './App.css'

var data = {
  sounds: [
    {
      name: 'Distorted Guitar',
      position: 'NW'
    },
    {
      name: 'Electro Kick',
      position: 'NE'
    },
    {
      name: 'Synth Bass',
      position: 'SW'
    },
    {
      name: 'Voxhit',
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
