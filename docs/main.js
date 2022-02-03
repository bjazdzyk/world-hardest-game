var c = document.getElementById("Canvas");
var ctx = c.getContext("2d");

const loop =()=>{
	requestAnimationFrame(loop)

	ctx.fillStyle = "skyblue"
	ctx.fillRect(0, 0, 800, 600)
}

loop()