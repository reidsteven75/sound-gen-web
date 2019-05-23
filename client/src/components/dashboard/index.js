import React, { Component } from 'react'
import axios from 'axios'
import { Redirect } from 'react-router-dom'
import CircularProgress from '@material-ui/core/CircularProgress'
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'
import withWidth from '@material-ui/core/withWidth'

import SoundSpacesTable from './sound-spaces-table'

const style = {
  content: {
		padding: 20,
		width: '100%'
	}
}

class Dashboard extends Component {

  constructor(props) {
    super(props)
    this.state = {
			loading: true,
			redirect: null,
			order: 'desc',
			orderBy: 'createdAt'
		}
		this.tableHeaders = [
			{ id: 'createdAt', numeric: false, disablePadding: false, label: 'Created' },
			{ id: 'name', numeric: false, disablePadding: false, label: 'Name' },
			{ id: 'user', numeric: false, disablePadding: false, label: 'User' },
			{ id: 'dimensions', numeric: true, disablePadding: false, label: 'Dim.' },
			{ id: 'resolution', numeric: true, disablePadding: false, label: 'Res.' },
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
    this.setState({redirect: url})
  }

  render() {
		const { redirect } = this.state
		
    let content
    if (this.state.loading === true) {
			content = <CircularProgress/>
		}
		else if (redirect) {
      return <Redirect to={redirect}/>
    }
    else {
      content = 
				<React.Fragment>
					<SoundSpacesTable 
						headers={this.tableHeaders}
						redirect={this.routeTo}
						data={this.soundSpaces}
					/>
				</React.Fragment>
    }
    return (
			<div style={style.content}>
				{content}
			</div>
    )
  }
}

export default compose(
  withStyles(style),
  withWidth(),
)(Dashboard)
