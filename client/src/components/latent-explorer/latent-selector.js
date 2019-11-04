import React, { Component } from 'react'
import * as p5 from 'p5'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'

const style = {
	wrapper: {
		padding: 5,
		maxWidth: 700,
		margin: 'auto'
	},
	loading: {
		position: 'relative',
		top: -220
	},
	sketchArea: {
		border: '1px solid white',
		maxWidth: 600,
		height: 300,
		margin: 'auto'
	},
	sketchAreaLoading: {
		border: '1px dashed black',
		maxWidth: 600,
		height: 300,
		margin: 'auto'
	},
	soundLeft: {
		fontSize: 16,
		textAlign: 'left',
		padding: 10
	},
	soundRight: {
		fontSize: 16,
		textAlign: 'right',
		padding: 10
	}
}

class LatentSelector extends Component {

  constructor(props) {
    super(props)
    this.state = {
			updateInterval: 500,
			notConfiguredText: 'Not Configured',
			currentPosX: 0,
			currentPosY: 0,
			targetPosX: 0,
			targetPosY: 0,
			currentPercentX: 0,
			currentPercentY: 0,
			canvasWidth: 0,
			canvasHeight: 0,
			easing: 0.06,
			circleRadius: 30,
			isMoving: false,
			sentLastPos: false,
			isActive: false,								// when mouse is down or touch is happening
			hasBeenActivated: false 				// prevents initial sounds until user initiates sound 
		}

		this.sketchRef = React.createRef()
		
	}

	updateLatentSelector() {
		// only send if moving, and also send last position upon stopping
		if (this.state.isMoving === true || this.state.isActive === true) {
			this.setState({
				sentLastPos: false
			})
		}
	  if (this.state.sentLastPos !== true) {
			this.props.changeHandler({
				x: this.state.currentPercentX,
				y: this.state.currentPercentY,
				hasBeenActivated: this.state.hasBeenActivated
			})
			this.setState({
				sentLastPos: true
			})
		}
	}

	calcPercent() {
		var percentX = this.state.currentPosX/this.state.canvasWidth
		var percentY = this.state.currentPosY/this.state.canvasHeight
		if (percentX > 1) percentX = 1
		if (percentX < 0) percentX = 0
		if (percentY > 1) percentY = 1
		if (percentY < 0) percentY = 0
		this.setState({
			currentPercentX: percentX,
			currentPercentY: percentY,
		})
	}

	updateCanvasSize() {
		const height = this.sketchRef.current.offsetHeight
		const width = this.sketchRef.current.offsetWidth
		this.setState({
			canvasWidth: width,
			canvasHeight: height
		})
	}

	redrawCanvas() {
		const heightPrev = this.state.canvasHeight
		const widthPrev = this.state.canvasWidth
		this.updateCanvasSize()
		const heightNow = this.state.canvasHeight
		const widthNow = this.state.canvasWidth

		const diffX = (widthNow - widthPrev)/2
		const diffY = (heightNow - heightPrev)/2

		// TODO: this isn't perfect
		// - it will be responsive; however the position of the selector may appear off upon initial resizing
		// - if this becomes a UX issue, to fix use percentage of overall element size
		this.setState({
			currentPosX: this.state.currentPosX + diffX,
			currentPosY: this.state.currentPosY + diffY,
			targetX: this.state.targetX + diffX,
			targetY: this.state.targetY + diffY
		})

		this.p5.resizeCanvas(this.state.canvasWidth, this.state.canvasHeight)
		this.p5.redraw()
	}

	initP5(sk) {

		const { latentSpaces, latentResolution } = this.props

		this.setState({
			targetX: this.sketchRef.current.offsetWidth/2,
			targetY: this.sketchRef.current.offsetHeight/2
		})

		this.sk.setup = () => {
			var canvas = this.sk.createCanvas(this.state.canvasWidth, this.state.canvasHeight)
			this.sk.noStroke()
			canvas.parent(this.sketchRef.current.id)
		}

		this.sk.draw = () => {
			var	dx
			var dy
			var colorIntensity = 0
			var colorIncrement = 1
			this.sk.clear()
			if (
				this.sk.mouseIsPressed &&
				this.sk.mouseX >=0 && this.sk.mouseX <=this.state.canvasWidth &&
				this.sk.mouseY >=0 && this.sk.mouseY <=this.state.canvasHeight
					)
			{
				this.setState({
					targetX: this.sk.mouseX,
					targetY: this.sk.mouseY
				})
			}
			dy = this.state.targetY - this.state.currentPosY
			dx = this.state.targetX - this.state.currentPosX
			this.setState({
				currentPosX: this.state.currentPosX + dx * this.state.easing,
				currentPosY: this.state.currentPosY + dy * this.state.easing
			})

			// draw latent spaces
			if (process.env.NODE_ENV !== 'production') {
				this.sk.stroke(220,20,60)
				this.sk.strokeWeight(1)
				latentSpaces.forEach( (_xy) => {
					this.sk.circle(
						_xy[0] * this.state.canvasWidth,
						_xy[1] * this.state.canvasHeight,
						10
					)
				})
			}

			// determine if moving
			if (Math.abs(dy) > 0.5 || Math.abs(dx) > 0.5) {
				this.setState({isMoving: true})
			}
			else this.setState({isMoving: false})

			// calc percent
			if (this.state.isMoving === true) {
				this.calcPercent()
			}	

			// animate circle
			for (var i = 0; i <this.state.circleRadius; i += colorIncrement ) {
				if (this.state.isMoving === true) { 
					colorIntensity = Math.floor(Math.random() * 5 * Math.max(Math.abs(dx),Math.abs(dy))) 
					colorIncrement = 2
					this.sk.stroke(37 + colorIntensity, 175 + colorIntensity, 180 + colorIntensity)
					this.sk.strokeWeight(1)
				}
				else { 
					colorIncrement = 5
					this.sk.stroke(37 + colorIntensity, 175 + colorIntensity, 180 + colorIntensity)
					this.sk.strokeWeight(3)
				}
			
				this.sk.noFill()
				if (this.props.loading !== true) {
					this.sk.ellipse(
						this.state.currentPosX,
						this.state.currentPosY,
						i,
						i
					)
				}
			
			}		
		}
	}

	handleMouseDown() {
		this.setState({isActive: true})
		this.setState({hasBeenActivated: true})
	}

	handleMouseUp() {
		this.setState({isActive: false})
	}

	handleTouchStart() {
		this.setState({isActive: true})
		this.setState({hasBeenActivated: true})
	}

	handleMouseEnd() {
		this.setState({isActive: false})
	}

  componentDidMount() {

		window.addEventListener("resize", this.redrawCanvas.bind(this))
		window.addEventListener("touchend", this.handleMouseUp.bind(this))
		window.addEventListener("mouseup", this.handleMouseUp.bind(this))

		setInterval(this.updateLatentSelector.bind(this), this.state.updateInterval)

		// timeout needed to ensure ref canvas mounted
		setTimeout(() => {
			this.s = (sk) => {  
				this.sk = sk
				this.updateCanvasSize()
				this.initP5()
			}
			this.p5 = new p5(this.s)
		}, 500)
		
	}
	
	componentWillUnmount() {
		window.removeEventListener("resize", this.redrawCanvas)
		window.removeEventListener("touchend", this.handleMouseUp)
		window.removeEventListener("mouseup", this.handleMouseUp)
	}	

  render() {

		let loading
    if (this.props.loading === true) {
			loading = <CircularProgress style={style.loading} />
    }

		let content = 
			<div>
				<Grid container spacing={24} >
					<Grid item xs={6} style={style.soundLeft}>{this.props.loading ? '-' : this.props.labelNW}</Grid>
					<Grid item xs={6} style={style.soundRight}>{this.props.loading ? '-' : this.props.labelNE}</Grid>
				</Grid>
				<Grid container spacing={24} >
					<Grid item xs={12}>
						<div 
							id='sketch-area' 
							ref={this.sketchRef}
							style={this.props.loading ? style.sketchAreaLoading : style.sketchArea}
							onMouseDown={this.handleMouseDown.bind(this)}
							onMouseUp={this.handleMouseUp.bind(this)}
						>
							{loading}
						</div>
					</Grid>	
				</Grid>
				<Grid container spacing={24} >
					<Grid item xs={6} style={style.soundLeft}>{this.props.loading ? '-' : this.props.labelSW}</Grid>
					<Grid item xs={6} style={style.soundRight}>{this.props.loading ? '-' : this.props.labelSE}</Grid>
				</Grid>
			</div>

      
    return (
        <div style={style.wrapper}>
					{content}
        </div>
    )
  }
}

LatentSelector.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(style)(LatentSelector)