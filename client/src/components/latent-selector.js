import React, { Component } from 'react'
import * as p5 from 'p5'

const style = {
	wrapper: {

	},
	sketchArea: {
		border: '1px solid white',
		maxWidth: 600,
		height: 400,
		margin: 'auto'
	}
}

class LatentSelector extends Component {

  constructor(props) {
    super(props)
    this.state = {
			currentPosX: 0,
			currentPosY: 0,
			targetPosX: 0,
			targetPosY: 0,
			currentPercentX: 0,
			currentPercentY: 0,
			canvasWidth: 0,
			canvasHeight: 0
		}

		this.sketchRef = React.createRef()
		
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

		this.sk.resizeCanvas(this.state.canvasWidth, this.state.canvasHeight)
		this.sk.redraw()
	}

  componentDidMount() {

		this.s = (sk) => {  

			this.sk = sk

			window.addEventListener("resize", this.redrawCanvas.bind(this))
			this.updateCanvasSize()
			
			var height = this.sketchRef.current.offsetHeight
			var width = this.sketchRef.current.offsetWidth

			var	easing = 0.05
			var circleRadius = 30
			var	dx
			var dy

			this.setState({
				targetX: width/2,
				targetY: height/2
			})

			this.sk.setup = () => {

				var canvas = this.sk.createCanvas(this.state.canvasWidth, this.state.canvasHeight)
				sk.noStroke()

				canvas.parent(this.sketchRef.current.id)
			}
	
			this.sk.draw = () => {

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
					currentPosX: this.state.currentPosX + dx * easing,
					currentPosY: this.state.currentPosY + dy * easing
				})
				this.sk.ellipse(this.state.currentPosX,this.state.currentPosY,circleRadius,circleRadius)

				if (Math.abs(dy) > 0.5 || Math.abs(dx) > 0.5) {
					this.calcPercent()
				}			
						
			}
		}
		this.p5 = new p5(this.s)
	}
	
	componentWillUnmount() {
		// window.removeEventListener("resize", this.redrawCanvas);
	}	

  render() {

		let content = <div 
										id='sketch-area' 
										ref={this.sketchRef}
										style={style.sketchArea}>
									</div>

      
    return (
        <div style={style.wrapper}>
					{Math.round(this.state.currentPercentX * 100) / 100 },
					{Math.round(this.state.currentPercentY * 100) / 100 }
          {content}
        </div>
    )
  }
}

export default LatentSelector
