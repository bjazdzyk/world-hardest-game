var c = document.getElementById("Canvas");
var ctx = c.getContext("2d");

const screenWidth = 800
const screenHeight = 600

const crd2str =(x, y)=>{
	return x.toString() + ":" + y.toString()
}

class Level{
	constructor(width, height, startPoint, template){
		this.tick = 0
		this.width = width
		this.height = height
		this.template = template
		this.startPoint = startPoint
		this.L = {}
		this.enemies = {}
		this.enemyIds = []
		this.players = {}
		this.playerIds =[ ]
		this.targets = [{minX:this.width+1, minY:this.height+1, maxX:-1, maxY:-1}]

		if(this.width > this.height){
			this.renderSize = {x:screenWidth-100, y:(screenWidth-100)/this.width*this.height}
		}else{
			this.renderSize = {x:(screenHeight-100)/this.height*this.width, y:screenHeight-100}
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
	fill(x, y, w, h, type){
		for(let i=x; i<x+w; i++){
			for(let j=y; j<y+h; j++){
				this.editSquare(i, j, type)
			}
		}
	}
	addEnemy(id, path, ticksBetween, sizeScale = 0.22){
		const radius = Math.min(this.cellSize.x, this.cellSize.y)*sizeScale
		this.enemies[id] = {path: path, x:path[0][0], y:path[0][1], radius: radius}
		this.enemyIds.push(id)

		if(path.length > 1){
			this.enemies[id].static = false
			this.enemies[id].lastPoint = 0
			this.enemies[id].destination = 1
			const delta = {x: path[1][0]-path[0][0], y: path[1][1]-path[0][1]}
			this.enemies[id].step = {}
			this.enemies[id].step.x = delta.x/ticksBetween
			this.enemies[id].step.y = delta.y/ticksBetween
			this.enemies[id].ticksBetween = ticksBetween

		}else{
			this.enemies[id].static = true
		}
	}

	newPlayer(player){
		this.players[player.id] = player
		this.playerIds.push(player.id)
		this.players[player.id].x = this.startPoint.x
		this.players[player.id].y = this.startPoint.y
	}

	addTarget(target){
		this.targets.push(target)
	}

	update(){
		for(let i=0; i<this.enemyIds.length; i++){
			const enemy = this.enemies[this.enemyIds[i]]
			const destinationDelta = Math.sqrt((enemy.path[enemy.destination][0]-enemy.x)*(enemy.path[enemy.destination][0]-enemy.x)+(enemy.path[enemy.destination][1]-enemy.y)*(enemy.path[enemy.destination][1]-enemy.y))
			if(Math.abs(destinationDelta*this.cellSize.x) < 1){

				this.enemies[this.enemyIds[i]].lastPoint = enemy.destination
				this.enemies[this.enemyIds[i]].destination = (enemy.destination+1)%enemy.path.length
				const delta = {x: enemy.path[this.enemies[this.enemyIds[i]].destination][0]-enemy.path[this.enemies[this.enemyIds[i]].lastPoint][0], y: enemy.path[this.enemies[this.enemyIds[i]].destination][1]-enemy.path[this.enemies[this.enemyIds[i]].lastPoint][1]}
				this.enemies[this.enemyIds[i]].step = {}
				this.enemies[this.enemyIds[i]].step.x = delta.x/enemy.ticksBetween
				this.enemies[this.enemyIds[i]].step.y = delta.y/enemy.ticksBetween
			}
			this.enemies[this.enemyIds[i]].x += this.enemies[this.enemyIds[i]].step.x
			this.enemies[this.enemyIds[i]].y += this.enemies[this.enemyIds[i]].step.y
		}
		for(let i=0; i<this.playerIds.length; i++){
			for(let j=0; j<this.enemyIds.length; j++){
				const pX = this.players[this.playerIds[i]].x
				const pY = this.players[this.playerIds[i]].y
				const eX = this.enemies[this.enemyIds[j]].x
				const eY = this.enemies[this.enemyIds[j]].y
				const delta = Math.sqrt((eX-pX)*(eX-pX) + (eY-pY)*(eY-pY))
				const permissibleDelta = this.enemies[this.enemyIds[j]].radius + this.cellSize.x*this.players[this.playerIds[i]].scale/2

				for(const target of this.targets){
					if(pX>=target.minX && pX<=target.maxX && pY>=target.minY && pY<=target.maxY){
						this.players[this.playerIds[i]].color = "green"
						this.players[this.playerIds[i]].levelUp()
						console.log("lol")
					}else{
						this.players[this.playerIds[i]].color = "red"
					}

				}

				if(delta*this.cellSize.x < permissibleDelta){
					this.players[this.playerIds[i]].isDead = true
					this.players[this.playerIds[i]].respawn()

				}

			}
		}
	}
	render(){
		ctx.fillStyle = "white"
		ctx.fillRect(this.renderAnchor.x, this.renderAnchor.y, this.renderSize.x, this.renderSize.y)
		//wals
		for(let i=0; i<this.width; i++){
			for(let j=0; j<this.height; j++){
				if(this.L[crd2str(i, j)] === 1){
					ctx.fillStyle = "#70bfe0"
					ctx.fillRect(this.renderAnchor.x+i*this.cellSize.x-1, this.renderAnchor.y+j*this.cellSize.y-1, this.cellSize.x+2, this.cellSize.y+2)
				}
				if(this.L[crd2str(i, j)] === 2){
					ctx.fillStyle = "#8fffa0"//green
					ctx.fillRect(this.renderAnchor.x+i*this.cellSize.x-0.5, this.renderAnchor.y+j*this.cellSize.y-0.5, this.cellSize.x+1, this.cellSize.y+1)
				}
			}
		}
		//enemies
		for(let i=0; i<this.enemyIds.length; i++){
			const enemy = this.enemies[this.enemyIds[i]]
			ctx.fillStyle = "blue"
			ctx.beginPath()
			ctx.arc(this.renderAnchor.x+enemy.x*this.cellSize.x, this.renderAnchor.y+enemy.y*this.cellSize.y, enemy.radius, 0, 2*Math.PI)
			ctx.fill()
		}
		//players
		for(let i=0; i<this.playerIds.length; i++){
			const player = this.players[this.playerIds[i]]
			if(!player.isDead){
				ctx.fillStyle = player.color
				ctx.fillRect(this.renderAnchor.x+player.x*this.cellSize.x-this.cellSize.x*player.scale/2, this.renderAnchor.y+player.y*this.cellSize.y-this.cellSize.x*player.scale/2, this.cellSize.x*player.scale, this.cellSize.y*player.scale)
			}

		}
	}

}

class Player{
	constructor(id, level, color = "red", speed = 0.05){
		this.isDead = false
		this.speed = speed
		this.id = id
		this.level = level
		this.scale = 0.6
		this.color = color
		this.x = 0
		this.y = 0
		levels[level].newPlayer(this)
		this.finished = 0
	}
	move(x, y){
		if(!this.isDead){
			if(x<0 && this.x>this.scale/2){
				if(levels[this.level].L[crd2str(Math.floor(this.x-this.scale/2-0.07), Math.floor(this.y-this.scale/2))] != 1){
					if(levels[this.level].L[crd2str(Math.floor(this.x-this.scale/2-0.07), Math.floor(this.y+this.scale/2))] != 1){
						this.x += x
					}
				}
			}
			if(x>0 && this.x<levels[this.level].width-this.scale/2){
				if(levels[this.level].L[crd2str(Math.floor(this.x+this.scale/2+0.07), Math.floor(this.y-this.scale/2))] != 1){
					if(levels[this.level].L[crd2str(Math.floor(this.x+this.scale/2+0.07), Math.floor(this.y+this.scale/2))] != 1){
						this.x += x
					}
				}
			}

			if(y<0 && this.y>this.scale/2+0.05){
				if(levels[this.level].L[crd2str(Math.floor(this.x-this.scale/2), Math.floor(this.y-this.scale/2-0.07))] != 1){
					if(levels[this.level].L[crd2str(Math.floor(this.x+this.scale/2), Math.floor(this.y-this.scale/2-0.07))] != 1){
						this.y += y
					}
				}
			}
			if(y>0 && this.y<levels[this.level].height-this.scale/2-0.05){
				if(levels[this.level].L[crd2str(Math.floor(this.x-this.scale/2), Math.floor(this.y+this.scale/2+0.07))] != 1){
					if(levels[this.level].L[crd2str(Math.floor(this.x+this.scale/2), Math.floor(this.y+this.scale/2+0.07))] != 1){
						this.y += y
					}
				}
			}
		}
	}
	levelUp(){
		this.level += 1
		levels[this.level].newPlayer(this)

	}
	respawn(){
		this.x = levels[this.level].startPoint.x
		this.y = levels[this.level].startPoint.y
		this.isDead = false
	}
}

let levels = {}
levels[1] = new Level(16, 7, {x:1.5, y:3.5}, "empty")
levels[1].fill(3, 0, 1, 6, 1)
levels[1].fill(4, 0, 7, 1, 1)
levels[1].fill(5, 6, 7, 1, 1)
levels[1].fill(12, 1, 1, 6, 1)
levels[1].fill(0, 0, 3, 7, 2)
levels[1].fill(13, 0, 3, 7, 2)
levels[1].addEnemy("dot1", [[4.25, 1.5], [11.75, 1.5]], 50)
levels[1].addEnemy("dot2", [[11.75, 2.5], [4.25, 2.5]], 50)
levels[1].addEnemy("dot3", [[4.25, 3.5], [11.75, 3.5]], 50)
levels[1].addEnemy("dot4", [[11.75, 4.5], [4.25, 4.5]], 50)
levels[1].addEnemy("dot5", [[4.25, 5.5], [11.75, 5.5]], 50)
levels[1].addTarget({minX:13, minY:0, maxX:16, maxY:7})

levels[2] = new Level(18, 6, {x:1.5, y:3}, "empty")
levels[2].fill(0, 0, 3, 2, 1)
levels[2].fill(0, 4, 3, 2, 1)
levels[2].fill(15, 0, 3, 2, 1)
levels[2].fill(15, 4, 3, 2, 1)
levels[2].fill(0, 2, 3, 2, 2)
levels[2].fill(15, 2, 3, 2, 2)
let id = 1
for(let i=3.5; i<=15; i+=2){
	levels[2].addEnemy(`dot${id}`, [[i, 0.25],[i, 5.75]], 50)
	id += 1
	levels[2].addEnemy(`dot${id}`, [[i+1, 5.75],[i+1, 0.25]], 50)
	id += 1
}
levels[2].addTarget({minX:15, minY:0, maxX:18, maxY:6})

levels[3] = new Level(13, 13, {x:0.5, y:12.5}, "empty")
levels[3].fill(0, 11, 1, 2, 2)
levels[3].fill(11, 0, 2, 1, 2)
levels[3].fill(1, 11, 10, 2, 1)
levels[3].fill(11, 1, 2, 12, 1)
levels[3].fill(3, 3, 5, 5, 1)
levels[3].addEnemy("dot1", [[0.5, 0.5], [0.5, 10.5], [10.5, 10.5], [10.5, 0.5]], 100)
levels[3].addEnemy("dot2", [[10.5, 10.5], [10.5, 0.5], [0.5, 0.5], [0.5, 10.5]], 100)
levels[3].addEnemy("dot3", [[0.5, 10.5], [10.5, 10.5], [10.5, 0.5], [0.5, 0.5]], 100)
levels[3].addEnemy("dot4", [[10.5, 0.5], [0.5, 0.5], [0.5, 10.5],[10.5, 10.5]], 100)

levels[3].addEnemy("dot5", [[2.5, 2.5], [8.5, 2.5], [8.5, 8.5], [2.5, 8.5]], 100)
levels[3].addEnemy("dot6", [[8.5, 8.5], [2.5, 8.5], [2.5, 2.5], [8.5, 2.5]], 100)
levels[3].addEnemy("dot7", [[8.5, 2.5], [8.5, 8.5], [2.5, 8.5], [2.5, 2.5]], 100)
levels[3].addEnemy("dot8", [[2.5, 8.5], [2.5, 2.5], [8.5, 2.5], [8.5, 8.5]], 100)


levels[3].addEnemy("dot9", [[1.5, 1.5], [1.5, 9.5]], 100)
levels[3].addEnemy("dot10", [[9.5, 9.5], [9.5, 1.5]], 100)
levels[3].addEnemy("dot11", [[9.5, 1.5], [1.5, 1.5]], 100)
levels[3].addEnemy("dot12", [[1.5, 9.5], [9.5, 9.5]], 100)

const player = new Player("player", 1)


let keys = {}
const loop =()=>{
	requestAnimationFrame(loop)
	ctx.fillStyle = "#70bfe0"
	ctx.fillRect(0, 0, 800, 600)
	levels[player.level].update()
	levels[player.level].render()


	if(keys["KeyW"] || keys["ArrowUp"]){
		player.move(0, -player.speed)
	}if(keys["KeyS"] || keys["ArrowDown"]){
		player.move(0, player.speed)
	}if(keys["KeyA"] || keys["ArrowLeft"]){
		player.move(-player.speed, 0)
	}if(keys["KeyD"] || keys["ArrowRight"]){
		player.move(player.speed, 0)
	}
}
loop()

document.addEventListener('keydown', (e)=>{
	keys[e.code] = true
})
document.addEventListener('keyup', (e)=>{
	keys[e.code] = null
})