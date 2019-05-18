import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import OutlinedInput from '@material-ui/core/OutlinedInput'

const style = {
	wrapper: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  formControl: {
    margin: 'auto',
    padding: 5,
    width: 350,
  },
  select: {
    color:'white',
  },
  selectEmpty: {
    marginTop: 5 * 2,
  }
}

class GridSelector extends Component {

  constructor(props) {
    super(props)
    this.state = {
			value: 0,
      label: 'Default',
      labelWidth: 0,
		}
  }
  
  handleChange = event => {
    const value = event.target.value
    this.setState({ value: value })
    this.props.changeHandler({
      value: value
    })
  }

  componentDidMount() {
    if (this.props.defaultValue) {
      this.setState({value:this.props.defaultValue})
    }
  }

  render() {
    let optionsData = this.props.options
    let optionsElement = <div></div>
    if (optionsData) {
      optionsElement = optionsData.map((option) =>
        <MenuItem key={option.name} value={option.id}>{option.name}</MenuItem>
      )
    }

		let content = 
      <FormControl style={style.formControl}>
        <Select
          style={style.select}
          value={this.state.value}
          onChange={this.handleChange}
          input={
            <OutlinedInput
              labelWidth={this.state.labelWidth}
              id="grid-selector"
            />
          }
        >
          {optionsElement}
        </Select>
      </FormControl>

    return (
        <div style={style.wrapper}>
          {content}
        </div>
    )
  }
}

GridSelector.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(style)(GridSelector)
