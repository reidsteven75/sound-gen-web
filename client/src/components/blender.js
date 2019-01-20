import React, { Component } from 'react'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import * as mm from '@magenta/music'

import { MDBIcon } from 'mdbreact'
import { MDBContainer, MDBRow, MDBCol } from 'mdbreact'
import { MDBBtn } from 'mdbreact'

const model = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/trio_4bar')
const player = new mm.Player()

const style = {
  wrapper: {
    border: '1px solid black',
    height: '200px',
    width: 'auto',
    padding: '15px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}

class Blender extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isPlaying: false,
      isBlending: false,
      isBlendCreated: false,
      loading: true
    }
  }

  componentDidMount() {
    model
			.initialize()
			.then(() => {
				this.setState({loading:false})
			})
  }

  dislikeTrack() {

  }

  likeTrack() {

  }

  blendSamples() {
    const inputSequences = toJS(this.props.observable.samples) // must be an array of 2 or 4
    const numInterps = 4
    const temperature = 0.5
    this.setState({isBlending: true})
    setTimeout(() => {
			model.interpolate(inputSequences, numInterps, temperature)
			.then(blendedSamples => {
				this.setState({isBlending:false})
				this.setState({sample:blendedSamples[1]})
				this.setState({isBlendCreated:true})
			})
		}, 200)
  }

  stopTrack() {
    player.stop()
    this.setState({isPlaying: false})
  }

  playTrack() {
    const sample = this.state.sample
    this.setState({isPlaying: true})
    player.start(sample).then(() => {
      this.setState({isPlaying: false})
    })
  }

  render() {

    var canBlend = false
    if (this.props.observable.samples.length === 2) { canBlend = true }

    let loading = <div className="loader fast small"></div>

    let content = 
      <MDBContainer>
        <MDBRow>
          <MDBCol sm="12">
            <MDBBtn 
              outline={this.state.isBlending || !canBlend}
							disabled={this.state.isBlending || !canBlend}
              onClick={this.blendSamples.bind(this)} 
              color="indigo"
            >
              { this.state.isBlending ? 'Blending...' : 'Blend Samples' }	
            </MDBBtn>
          </MDBCol>
        </MDBRow>
        <MDBRow className='mt-3'>
          <MDBCol sm="4">
            <MDBBtn 
                color="danger"
                outline={!this.state.isBlendCreated}
							  disabled={!this.state.isBlendCreated}
                onClick={this.dislikeTrack.bind(this)} 
              >
                <MDBIcon icon="thumbs-o-down" />
            </MDBBtn>
          </MDBCol>
          <MDBCol sm="4">
            {
              this.state.isPlaying
              ? (
                <MDBBtn 
                  color="secondary"
                  onClick={this.stopTrack.bind(this)} 
                >
                  <MDBIcon icon="stop" />
                </MDBBtn>
              )
              // not playing
              : (
                <MDBBtn 
                  color="primary"
                  outline={!this.state.isBlendCreated}
							    disabled={!this.state.isBlendCreated}
                  onClick={this.playTrack.bind(this)} 
                >
                  <MDBIcon icon="play" />
                </MDBBtn>
              )
            }
          </MDBCol>
          <MDBCol sm="4">
            <MDBBtn 
              color="success"
              outline={!this.state.isBlendCreated}
							disabled={!this.state.isBlendCreated}
              onClick={this.likeTrack.bind(this)} 
            >
              <MDBIcon icon="thumbs-o-up" />
            </MDBBtn>
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

export default observer(Blender)
