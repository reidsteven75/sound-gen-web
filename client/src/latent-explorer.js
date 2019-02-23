import React, { Component } from 'react'
import { observable } from 'mobx'


import Keyboard from './components/keyboard'

const style = {
  content: {
		padding: 20,
		width: '100%'
	}
}

class LatentExplorer extends Component {

  appState = observable.object({

  })

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
			serverError: false
		}
		
		this.testRef = React.createRef();
  }

  componentDidMount() {
    // App loading animation
    setTimeout(() => {
      this.setState({loading:false})
		}, 1000)
		
  }

  render() {
    let content
    if (this.state.loading === true) {
      content = <div className="loader border-top-default medium fast"></div>
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
      content = <Keyboard/>
    }

    return (
			<div style={style.content}>
				{content}
			</div>
    )
  }
}

export default LatentExplorer;
