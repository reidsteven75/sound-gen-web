import React, { Component } from 'react'

class ValuePh extends Component {

  constructor(props) {
    super(props)
    this.state = {
      value: null
    }
  }

  updateValue() {
    this.setState((state, props) => ({
      value: props.dataRealTime.y
    }))
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.updateValue(),
      1000
    )
  }

  render() {

    var value = this.state.value || 'unknown'

    return (
        <div>
          {value}
        </div>
    );
  }
}

export default ValuePh;
