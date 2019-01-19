import React, { Component } from 'react'

import { Line } from 'react-chartjs-2'
import 'chartjs-plugin-streaming'
import { MoonLoader } from 'react-spinners'

const style = {
  title: {
    color: 'white',
    fontSize: '16px',
    marginBottom: '15px'
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  wrapper: {
    border: '1px solid black',
    height: '240px',
    width: 'auto',
    position: 'relative',
    padding: '15px',
    paddingBottom: '40px',
    marginBottom: '20px'
  }
}

class ChartPh extends Component {

  checkLoaded() {
    if (this.props.isLoading === false) {
      this.setState({loading:false})
    }
  }
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      error: false
    }

    const _this = this  
    setInterval(function() {
      _this.checkLoaded()
    }, 1000)
  }

  render() {
    const _this = this
    const duration = this.props.duration
    const refresh = this.props.refresh
    const dataHistorical = this.props.dataHistorical

    var getLatestData = function() {
      var data = {
        x: _this.props.dataRealTime.x,
        y: _this.props.dataRealTime.y
      }
      return data
    }

    let loading = 
        <div style={style.loader}>
          <MoonLoader
            size={30}
            color={'#36D7B7'}
            />
        </div>
      
    let chart = 
      <Line
        data={{
          datasets: [{
            data: dataHistorical,
            label: 'PH',
            pointRadius: 1,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            lineTension: 0,
            // borderDash: [8, 4]
          }]
        }}
        options={{
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          scales: {
            yAxes: [{
              ticks: {
                // suggestedMin: 4,
                // suggestedMax: 10
              }
            }],
            xAxes: [{
              type: 'realtime',
              realtime: {
                duration: duration,
                delay: 2000,
                refresh: refresh,
                pause: false,
                onRefresh: function(chart) {
                  var data = getLatestData()
                  chart.data.datasets.forEach(function(dataset) {
                    dataset.data.push(data)
                  })
                },
                
              }
            }]
          }
        }}
      />

    return (
      <div style={style.wrapper}>
        <div style={style.title}>{this.props.title}</div>
        {
          this.state.loading
          ? (
            loading
          )
          : (
            chart
          )
          
        }
      </div>
          
    );
  }
}

export default ChartPh;
