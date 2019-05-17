import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

if (process.env.NODE_ENV !== 'production') {
  console.log('ENV:dev')
}

ReactDOM.render(<App />, document.getElementById('root'))