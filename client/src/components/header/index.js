import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import compose from 'recompose/compose'
import withWidth from '@material-ui/core/withWidth'
// import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import NavigateBefore from '@material-ui/icons/NavigateBefore'
import Help from '@material-ui/icons/Help'

const style = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
	},
	helpButton: {
    marginRight: -12,
    marginLeft: 20,
  },
}

class Header extends Component {

	constructor(props) {
		super(props)
		this.state = {
		}
		this.handleBackNav = this.handleBackNav.bind(this)
		this.handleHomeNav = this.handleHomeNav.bind(this)
	}
	
	handleBackNav() {
		this.props.history.push('/dashboard')
	}

	handleHomeNav() {
		this.props.history.push('/dashboard')
	}

  render() {
		const { classes, location } = this.props

		let showBackNav = false
		if (location.pathname.includes('sound-spaces')) {
			showBackNav = true
		}
	
		return (
			<div className={classes.root}>
				<AppBar 
					position='static'
					color='secondary'
				>
					<Toolbar>
							<IconButton 
								className={classes.menuButton} 
								disabled={showBackNav ? false : true}
								color='inherit' 
								aria-label='Menu'
								onClick={this.handleBackNav}
							>
							<NavigateBefore />
						</IconButton>
						<Typography 
							variant='h6' 
							color='white' 
							className={classes.grow}
							onClick={this.handleHomeNav}
						>
								{/* Sound Generation */}
						</Typography>
						<IconButton className={classes.helpButton} color='inherit' aria-label='Menu'>
							{/* <Help /> */}
						</IconButton>
					</Toolbar>
				</AppBar>
			</div>
		)
	} 
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(compose(
  withStyles(style),
  withWidth(),
)(Header))
