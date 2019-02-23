import React, { Component } from 'react'
// import GenerateBlend from './generate-blend'
import LatentExplorer from './latent-explorer'

import './App.css'

class App extends Component {

  render() {
    return (
      <div className="App">
        <main className="App-main">
          <LatentExplorer/>
        </main>
      </div> 
    )
  }
}

export default App;
