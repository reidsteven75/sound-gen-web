import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'
import withWidth from '@material-ui/core/withWidth'

const style = {
  content: {
		padding: 20,
		width: '100%'
	}
}

class NotFound extends Component {

  render() {
    return (
			<div style={style.content}>
				Nothing to see here<br/>
        You accessed the wrong URL
			</div>
    )
  }
}

export default withRouter(compose(
  withStyles(style),
  withWidth(),
)(NotFound))
