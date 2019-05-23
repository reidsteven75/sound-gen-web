import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import ReactBreakpoints from 'react-breakpoints'

const breakpoints = {
  mobile: 320,
  mobileLandscape: 480,
  tablet: 768,
  tabletLandscape: 1024,
  desktop: 1200,
  desktopLarge: 1500,
  desktopWide: 1920,
}

console.log('ENV: ' + process.env.NODE_ENV)

ReactDOM.render(
  <ReactBreakpoints breakpoints={breakpoints}>
    <App />
  </ReactBreakpoints>, 
  document.getElementById('root')
)