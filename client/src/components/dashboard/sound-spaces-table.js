import React, { Component } from 'react'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import moment from 'moment'
import { withStyles } from '@material-ui/core/styles'
import withWidth from '@material-ui/core/withWidth'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Tooltip from '@material-ui/core/Tooltip'

const style = {
  content: {
		padding: 20,
		width: '100%'
	}
}

class EnhancedTableHead extends Component {

	createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  }
	
	render() {
		const { headers, order, orderBy } = this.props

		return(
			<TableHead>
				<TableRow>
					{headers.map(
						row => (
							<TableCell
								key={row.id}
								align={row.numeric ? 'right' : 'left'}
								padding={row.disablePadding ? 'none' : 'default'}
								sortDirection={orderBy === row.id ? order : false}
							>
								<Tooltip
									title="Sort"
									placement={row.numeric ? 'bottom-end' : 'bottom-start'}
									enterDelay={300}
								>
									<TableSortLabel
										active={orderBy === row.id}
										direction={order}
										onClick={this.createSortHandler(row.id)}
									>
										{row.label}
									</TableSortLabel>
								</Tooltip>
							</TableCell>
						),
						this,
					)}
				</TableRow>
			</TableHead>
		)
	}
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
}

class SoundSpacesTable extends Component {

  constructor(props) {
    super(props)
    this.state = {
			loading: true,
			order: 'desc',
			orderBy: 'createdAt'
		}
  }
  
  handleClick = (event, id) => {
    const url = '/sound-spaces/' + id
    this.props.redirect(url)
  }

	handleRequestSort = (event, property) => {
    const orderBy = property
    let order = 'desc'
    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc'
    }
    this.setState({ order, orderBy })
  }

	createSortHandler = property => event => {
    this.props.onRequestSort(event, property)
  }

	desc(a, b, orderBy) {
		if (b[orderBy] < a[orderBy]) {
			return -1
		}
		if (b[orderBy] > a[orderBy]) {
			return 1
		}
		return 0
	}

	stableSort(array, cmp) {
		const stabilizedThis = array.map((el, index) => [el, index])
		stabilizedThis.sort((a, b) => {
			const order = cmp(a[0], b[0])
			if (order !== 0) return order
			return a[1] - b[1]
		})
		return stabilizedThis.map(el => el[0])
	}

	getSorting(order, orderBy) {
		return order === 'desc' ? (a, b) => this.desc(a, b, orderBy) : (a, b) => -this.desc(a, b, orderBy)
	}

  render() {
    const data = this.props.data
    const headers = this.props.headers
    const { order, orderBy } = this.state

    let content = 
				<React.Fragment>
					<Table aria-labelledby="table-sound-spaces">
					<EnhancedTableHead
							headers={headers}
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
          />
					<TableBody>
						{this.stableSort(data, this.getSorting(order, orderBy))
							.map(n => {
								return (
									<TableRow
										hover
										onClick={event => this.handleClick(event, n._id)}
										role="checkbox"
										tabIndex={-1}
										key={n._id}
									>
										<TableCell align="left">
											{moment(n.createdAt).fromNow()}
										</TableCell>
										<TableCell align="left">{n.name}</TableCell>
										<TableCell align="left">{n.user}</TableCell>
										<TableCell align="right">{n.dimensions}</TableCell>
										<TableCell align="right">{n.resolution}</TableCell>				
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</React.Fragment>
    
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
)(SoundSpacesTable)
