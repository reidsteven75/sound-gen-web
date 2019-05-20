import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import blue from '@material-ui/core/colors/blue'
import CloudDownload from '@material-ui/icons/CloudDownload'

const style = {
	wrapper: {
    
  },
  button: {
    border: '1px solid ' + blue['A400'],
    height: 60,
    width: 300
	}
}

class DownloadSound extends Component {

  constructor(props) {
    super(props)
    this.state = {
			isActive: false
		}
	}

	handleDownload() {
    this.props.downloadSound()
  }

  render() {

		let content = 
			<Button 
				style={style.button}
				color={"primary"}
				size={"small"}
				onClick={this.handleDownload.bind(this)}
			>
				<CloudDownload/> &nbsp;&nbsp; Download Sound
			</Button>

    return (
      <div style={style.wrapper}>
        {content}
      </div>
    )
  }
}

DownloadSound.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(style)(DownloadSound)
