import React, { Component } from 'react'
import axios from 'axios'
import { withRouter } from 'react-router-dom'
import CircularProgress from '@material-ui/core/CircularProgress'
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'
import withWidth from '@material-ui/core/withWidth'

import SoundSpacesTable from './sound-spaces-table'

const style = {
  content: {
		padding: 20,
		width: '100%',
	},
	maxHeight: {
		height: '100vh'
	}
}

class Dashboard extends Component {

  constructor(props) {
    super(props)
    this.state = {
			loading: true,
			redirect: null,
			order: 'desc',
			orderBy: 'name'
		}
		this.tableHeaders = [
			{ id: 'name', numeric: false, disablePadding: false, label: 'Name' },
			{ id: 'dimensions', numeric: true, disablePadding: false, label: 'Dim.' },
			{ id: 'resolution', numeric: true, disablePadding: false, label: 'Res.' },
			{ id: 'createdAt', numeric: false, disablePadding: false, label: 'Created' },
			{ id: 'user', numeric: false, disablePadding: false, label: 'User' }
		]
		this.soundSpaces = []
	}

	componentDidMount() {
		axios.get(this.props.api + '/sound-spaces')
			.then((res) => {
				this.soundSpaces = res.data
			})
			.catch((err) => {
				console.error('error')
				console.error(err)
			})
			.finally( () => {
				this.setState({loading:false})
			})
	}

	routeTo = (url) => {
    this.props.history.push(url)
  }

  render() {
		
    let content
    if (this.state.loading === true) {
			content = <CircularProgress/>
		}
    else {
      content = 
				<div
					style={style.maxHeight}
				>
					<SoundSpacesTable 
						headers={this.tableHeaders}
						redirect={this.routeTo}
						data={this.soundSpaces}
					/>
				</div>
    }
    return (
			<div style={style.content}>
				{content}
			</div>
    )
  }
}

export default withRouter(compose(
  withStyles(style),
  withWidth(),
)(Dashboard))
