import React, { Component } from 'react'
import * as mm from '@magenta/music'

import { MDBContainer, MDBRow, MDBCol } from 'mdbreact'
import { MDBBtn } from 'mdbreact'

const model = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/trio_4bar')
const player = new mm.Player()

const style = {
  wrapper: {
    border: '1px solid black',
    height: '240px',
    width: 'auto',
    padding: '15px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}

class MusicGenerator extends Component {

  constructor(props) {
    super(props)
    this.state = {
      samples: null,
      isPlaying: false,
      loading: true
    }
  }

  componentDidMount() {
    model
      .initialize()
      .then(() => model.sample(1))
      .then(samples => {
        this.setState({samples:samples})
        this.setState({loading:false})
      })
  }

  stopTrack() {
    const samples = this.state.samples
    // player.resumeContext()
    player.stop(samples[0])
    this.setState({isPlaying: false})
  }

  playTrack() {
    const samples = this.state.samples
    // player.resumeContext()
    this.setState({isPlaying: true})
    player.start(samples[0]).then(() => {
      this.setState({isPlaying: false})
    })
  }

  render() {

    let loading = <div className="loader fast small"></div>

    let content = 
      <MDBContainer>
        <MDBRow>
          <MDBCol sm="4">
            1
          </MDBCol>
          <MDBCol sm="4">
            {
              this.state.isPlaying
              ? (
                <MDBBtn 
                  outline 
                  color="danger"
                  onClick={this.stopTrack.bind(this)} 
                >
                  Stop
                </MDBBtn>
              )
              : (
                <MDBBtn 
                  outline 
                  color="primary"
                  onClick={this.playTrack.bind(this)} 
                >
                  Play
                </MDBBtn>
              )
            }
          </MDBCol>
          <MDBCol sm="4">
            2
          </MDBCol>
        </MDBRow>
      </MDBContainer>

    return (
        <div style={style.wrapper}>
          {
            this.state.loading
            ? (
              loading
            )
            : (
              content
            )
          }
        </div>
    )
  }
}

export default MusicGenerator;
