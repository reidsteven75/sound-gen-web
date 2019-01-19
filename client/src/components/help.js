import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

const style = {
	buttonClose: {
		margin: 'auto',
		padding: '15px'
	}
}

class Help extends Component {

  constructor(props) {
    super(props)
    this.state = {
			open: false,
			scroll: 'paper'
    }
	}
	
	handleClickOpen = function() {
    this.setState({ open: true });
  }

  handleClose = function() {
    this.setState({ open: false });
  }

  render() {
    return (
      <div>
				<Button 
					variant="contained" 
					color="primary"
					onClick={this.handleClickOpen.bind(this)}
				>
					Help
				</Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose.bind(this)}
          scroll={this.state.scroll}
          aria-labelledby="scroll-dialog-title"
        >
          <DialogTitle id="scroll-dialog-title">Help</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <h4>Connecting to Wifi</h4>
								<ol>
									<li>On mobile device or computer connect to wifi “Wifi Connect”</li>
									<li>You should be auto-redirected to wifi setup</li>
									<li>Choose wifi network and enter password</li>
									<li>Device will try to connect. If it’s successful you won’t see the “Wifi Connect” network anymore, and the device will be ready to use</li>
								</ol>
							<h4>Readings Are Innacurate and Jumping All Over The Place</h4>
							Disconnect & reconnect the usb cable that's accessable from the top of the larger computer
							<h4>Ensuring Accurate Readings</h4>
								<ul>
									<li>READINGS WILL BE SUPER RANDOM IF THE SENSOR BOX IS MOVED</li>
									<li>Electrode reference solution is the 3NKCL solution</li>
									<li>The electrode used for the first or long set without re-use, the electrode bulb and the sand core, immersed in the 3NKCL solution activated eight hours</li>
									<li>The electrode plug should be kept clean and dry</li>
									<li>Measurement should be avoided staggered pollution between solutions, so as not to affect the accuracy of measurement</li>
									<li>The electrode should not be long-term immersed in acid chloride solution</li>
									<li>Electrode when in use, the ceramic sand core and liquid outlet rubber ring should be removed, in order to make salt bridge solution to maintain a certain velocity</li>
								</ul>
							<h4>PH Sensor</h4>
							<ul>
								<li>Model: SEN0169</li>
								<li>Measuring Range: 0-14PH</li>	
								<li>Measuring Temperature: 0-60 C</li>	
								<li>Accuracy: ± 0.2pH @ 25 C</li>	
							</ul>

            </DialogContentText>
          </DialogContent>
          <DialogActions style={style.buttonClose}>
							<Button
								variant="contained" 
								color="secondary"
								onClick={this.handleClose.bind(this)} 
							>
								Close
							</Button>
          </DialogActions>
        </Dialog>
      </div>
		)
	}
}

export default Help
