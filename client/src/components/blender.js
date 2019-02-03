import React, { Component } from 'react'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import * as mm from '@magenta/music'

import { MDBIcon } from 'mdbreact'
import { MDBContainer, MDBRow, MDBCol } from 'mdbreact'
import { MDBBtn } from 'mdbreact'

import VisualizerLines from './visualizer-lines'

var model
const player = new mm.Player()

const style = {
  wrapper: {
    border: '1px solid black',
    height: '250px',
    width: 'auto',
    padding: '15px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}

class Blender extends Component {

  config = {
    defaultSampleSelected: 1
  }

  constructor(props) {
    super(props)
    this.state = {
      samples: [],
      isPlaying: false,
      isBlending: false,
      isBlendCreated: false,
      loading: true
    }
  }

  componentDidMount() {

    const modelUrl = this.props.modelUrl

    model = new mm.MusicVAE(modelUrl)
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
        this.setState({samples:blendedSamples})
        this.setState({isBlendCreated:true})
        
        if (!this.props.observable.selectedBlendSampleId) {
          this.props.observable.selectedBlendSampleId = this.config.defaultSampleSelected
        }
        
			})
		}, 200)
  }

  stopTrack() {
    player.stop()
    this.setState({isPlaying: false})
  }

  playTrack() {
    const sample = this.state.samples[this.props.observable.selectedBlendSampleId - 1]
    this.setState({isPlaying: true})
    player.start(sample).then(() => {
      this.setState({isPlaying: false})
    })
  }

  render() {

    var canBlend = false
    if (this.props.observable.samples.length === 2) { canBlend = true }

    let loading = <div className="loader border-top-default fast small"></div>

    let content = 
      <MDBContainer>
        <MDBRow>
          <MDBCol sm="12">
            <MDBBtn 
              color={ this.state.isBlending || !canBlend ? 'mdb-color' : 'default'} 
              outline
							disabled={this.state.isBlending || !canBlend}
              onClick={this.blendSamples.bind(this)} 
            >
              { this.state.isBlending ? 'Blending...' : 'Blend Samples' }	
            </MDBBtn>
          </MDBCol>
        </MDBRow>
        <MDBRow className='mt-3'>
          <MDBCol sm="3">
            <VisualizerLines 
              id={1}
              sample={this.state.samples[0]}
              observable={this.props.observable}
            />
          </MDBCol>
          <MDBCol sm="3">
            <VisualizerLines 
              id={2}
              sample={this.state.samples[1]}
              observable={this.props.observable}
            />
          </MDBCol>
          <MDBCol sm="3">
            <VisualizerLines 
              id={3}
              sample={this.state.samples[2]}
              observable={this.props.observable}
            />
          </MDBCol>
          <MDBCol sm="3">
            <VisualizerLines 
              id={4}
              sample={this.state.samples[3]}
              observable={this.props.observable}
            />
          </MDBCol>
        </MDBRow>
        <MDBRow className='mt-3'>
          <MDBCol sm="4">
            <MDBBtn 
                color={ !this.state.isBlendCreated ? 'mdb-color' : 'danger'} 
                outline
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
                  outline
                  onClick={this.stopTrack.bind(this)} 
                >
                  <MDBIcon icon="stop" />
                </MDBBtn>
              )
              // not playing
              : (
                <MDBBtn 
                  color={ !this.state.isBlendCreated ? 'mdb-color' : 'primary'} 
                  outline
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
              color={ !this.state.isBlendCreated ? 'mdb-color' : 'success'} 
              outline
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
