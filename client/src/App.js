import React, { Component } from 'react'
import openSocket from 'socket.io-client'
import axios from 'axios'
import { MoonLoader } from 'react-spinners'
import _ from 'lodash'
// import * as moment from 'moment'

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import cyan from '@material-ui/core/colors/cyan'
import red from '@material-ui/core/colors/red'

// import logo from './logo.svg';
import './App.css';

import ChartPh from './components/chart-ph'
import ValuePh from './components/value-ph'
import Help from './components/help'

const serverUrl = process.env.REACT_APP_SERVER_URL

const theme = createMuiTheme({
  palette: {
    primary: {
      light: cyan[300],
      main: cyan[500],
      dark: cyan[700],
    },
    secondary: {
      light: red[300],
      main: red[500],
      dark: red[700],
    },
  },
  typography: {
    useNextVariants: true,
  }
})

const socket = openSocket(serverUrl)
socket.on('connect', function () { 
  // console.log('[socket]: connected')
})

socket.on('data-update-ph', function (message) { 
  dataRealTime.y = message.value
  dataRealTime.x = message.timestamp
})

const style = {
  content: {
    width: '80%',
    padding: 20
  }
}

const charts = [
  {
    name: 'Last Minute',
    durationMs: 60000,
    sampleRateMs: 500,
    dataHistorical: []
  },
  {
    name: 'Last 2 Hours',
    durationMs: 7200000,
    sampleRateMs: 30000,
    dataHistorical: []
  },
  {
    name: 'Last 24 Hours',
    durationMs: 86400000,
    sampleRateMs: 300000,
    dataHistorical: []
  }
]
var dataRealTime = {}

class App extends Component {

  mapChartData(chart) {
    const keyMap = {
      value: 'y',
      timestamp: 'x'
    }
    // map keys so it can be rendered in chart
    chart.dataHistorical = chart.dataHistorical.map(function(obj) {
      return _.mapKeys(obj, function(value, key) {
        return keyMap[key];
      });
    })
    return chart
  }

  getChartData(chart) {
    const _this = this
    return axios.get(serverUrl + '/historicals/ph?duration=' + chart.durationMs + '&samplerate=' + chart.sampleRateMs)
      .then(function (response) {
        if (!response.data) { }
        else if (response.data.length === 0) { }
        else {
          chart.dataHistorical = response.data
          chart = _this.mapChartData(chart)
        }
        return ({chart:chart})
      })
      .catch(function (error) {
        console.log({err:error})
        return error
      })

  }

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      serverError: false
    }
  }

  componentDidMount() {
    const _this = this

    // App loading animation
    setTimeout(function() {
      _this.setState({loading:false})
      charts.forEach(function(chart) {
        chart.isLoading = true
        _this.getChartData(chart).then(function(res) {
          chart.isLoading = false
          _this.setState({updateData:true})
          if (res.err) { chart.isError = true }
          else { chart = res.chart }
        })
      })
    }, 1000)
  }

  render() {
    let content
    if (this.state.loading === true) {
      content = <div>
                  <MoonLoader
                    color={'#36D7B7'}
                    />
                </div>
    }
    else if (this.state.serverError === true) {
      content = <div>
                  Server Unreachable
                  <br/>
                  <br/>
                  Try Reloading App
                </div>
    }
    else {
      let chartHtml = charts.map((chart) =>
        <div key={chart.name}>
          <ChartPh 
            isLoading={chart.isLoading}
            isError={chart.isError}
            title={chart.name}
            dataHistorical={chart.dataHistorical}
            dataRealTime={dataRealTime} 
            duration={chart.durationMs} 
            refresh={chart.sampleRateMs}/>
        </div>    
      )
      content = <div style={style.content}>
        <h2>PH</h2>
        <ValuePh dataRealTime={dataRealTime}/>
        <br/>
        {chartHtml}
        <br/>
        <Help/>
        <br/>
      </div>
    }

    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <main className="App-main">
            {content}
          </main>
        </div> 
      </MuiThemeProvider>
    )
  }
}

export default App;
