var canvas = document.getElementById("render_window");
var ctx = canvas.getContext("2d");
canvas.style.cursor = "crosshair";
canvas.onmousedown = function(e)
{
 
}
 
canvas.onmouseup = function(e)
{
 
}
 
canvas.onmousemove = function(e)
{
	var x = e.clientX - canvas.offsetLeft;
	var y = e.clientY - canvas.offsetTop;
	var mousePos = new Vector2D(x, y);
	render(mousePos);
}
 
function clearCanvas(color)
{
	color = color || "#7ba7c9";
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}
 
var projector = new Projector();
 
var triangleA = new Array();
triangleA.push(new Vector2D(200, 300));
triangleA.push(new Vector2D(400, 500));
triangleA.push(new Vector2D(600, 200));
var polygonA = new Polygon(triangleA);
 
function render(mousePos)
{
	clearCanvas();
 
	polygonA.drawSelf(ctx);
 
	for(var i = 0; i < polygonA.edges.length; i++)
	{
		projector.projectPointOntoEdge(mousePos, polygonA.edges[i]);
		projector.drawSelf(ctx);
	}
 
}