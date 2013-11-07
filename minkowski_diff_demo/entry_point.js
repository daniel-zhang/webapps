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
triangleA.push(new Vector2D(100, 300));
triangleA.push(new Vector2D(300, 500));
triangleA.push(new Vector2D(400, 200));
var polygonA = new Polygon(triangleA);

var triangleB = new Array();
triangleB.push(new Vector2D(500, 200));
triangleB.push(new Vector2D(550, 400));
triangleB.push(new Vector2D(600, 200));
var polygonB = new Polygon(triangleB);
 
function render(mousePos)
{
	clearCanvas();
 
	polygonA.drawSelf(ctx);
	polygonB.drawSelf(ctx);
 
	// for(var i = 0; i < polygonA.edges.length; i++)
	// {
	// 	projector.projectPointOntoEdge(mousePos, polygonA.edges[i]);
	// 	projector.drawSelf(ctx);
	// }
	var evPairs = MinkowskiDiff(polygonA, polygonB);
	for(var i = 0; i < evPairs.pairs1.length; i++)
	{
		evPairs.pairs1[i].drawSelf(ctx);
	}
}