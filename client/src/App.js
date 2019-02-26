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

  updateKeyPressed(data) {
    const key = data.key
    const pitch = data.pitch
    const active = data.active

    console.log(key, pitch, active)
  }

  updateLatentSelector(data) {
    const x = data.x
    const y = data.y

    console.log(x, y)
  }

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
            updateKeyPressed={this.updateKeyPressed}
            updateLatentSelector={this.updateLatentSelector}
            data={data}
          />
        </main>
      </div> 
    )
  }
}

export default App;
