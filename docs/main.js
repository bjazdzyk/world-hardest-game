var c = document.getElementById("Canvas");
var ctx = c.getContext("2d");

const screenWidth = 800
const screenHeight = 600

const crd2str =(x, y)=>{
	return x.toString() + ":" + y.toString()
}

class level{
	constructor(width, height, startPoint, template){
		this.width = width
		this.height = height
		this.template = template
		this.startPoint = startPoint
		this.L = {}
		if(this.width > this.height){
			this.renderSize = {x:screenWidth-100, y:(screenWidth-100)/this.width*this.height}
		}else{
			this.renderSize = {x:(screenHeight-100)/this.height*this.width, y:screenHeigh-100}
		}
		this.renderAnchor = {x: (screenWidth-this.renderSize.x)/2, y: (screenHeight-this.renderSize.y)/2}
		this.cellSize = {x: this.renderSize.x/this.width, y:this.renderSize.y/this.height}
		if(this.template === "empty"){
			for(let i=0; i<this.width; i++){
				for(let j=0; j<this.height; j++){
					this.L[crd2str(i, j)] = 0
				}
			}
		}
	}
	editSquare(x, y, type){
		this.L[crd2str(x, y)] = type
	}
	render(){
		ctx.fillStyle = "white"
		ctx.fillRect(this.renderAnchor.x, this.renderAnchor.y, this.renderSize.x, this.renderSize.y)
		for(let i=0; i<this.width; i++){
			for(let j=0; j<this.height; j++){
				if(this.L[crd2str(i, j)] === 1){
					ctx.fillStyle = "skyblue"
					ctx.fillRect(this.renderAnchor.x+i*this.cellSize.x, this.renderAnchor.y+i*this.cellSize.y)
				}
			}
		}
	}

}

let levels = {}
levels[1] = new level(16, 7, {x:1.5, y:3.5}, "empty")



const loop =()=>{
	requestAnimationFrame(loop)
	ctx.fillStyle = "skyblue"
	ctx.fillRect(0, 0, 800, 600)

	levels[1].render()
}

loop()