var canvas = document.getElementById("render_window");
var ctx = canvas.getContext("2d");
canvas.style.cursor = "crosshair";

var shapes = new Array();

var triangleA = new Array();
triangleA.push(new Vector2D(100, 300));
triangleA.push(new Vector2D(300, 500));
triangleA.push(new Vector2D(400, 200));

var triangleB = new Array();
triangleB.push(new Vector2D(500, 200));
triangleB.push(new Vector2D(550, 400));
triangleB.push(new Vector2D(600, 200));

shapes.push(new Polygon(triangleA, "green"));
shapes.push(new Polygon(triangleB, "yellow"));

function getMousePos(e, obj)
{
	var x = e.clientX - obj.offsetLeft;
	var y = e.clientY - obj.offsetTop;
	return new Vector2D(x, y);
}

var isMouseDown = false;
var selected = null;
var oldPos = null;
canvas.onmousedown = function(e)
{
	isMouseDown = true;
	var mousePos = getMousePos(e, canvas);

	for(var i = 0; i < shapes.length; i++)
	{
		if(shapes[i].isClicked(mousePos) == true)
		{
			selected = shapes[i];
			oldPos = mousePos;
			return;
		}
	}
}
 
canvas.onmouseup = function(e)
{
	isMouseDown = false;
	selected = null;
	oldPos = null;
}
 
canvas.onmousemove = function(e)
{
	var mousePos = getMousePos(e, canvas);
	if(isMouseDown && selected != null)
	{
		var movement = mousePos.minus(oldPos);
		oldPos = mousePos;
		selected.translate(movement);
	}
	render();
}
 
function clearCanvas(color)
{
	color = color || "#7ba7c9";
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}
 
function render()
{
	clearCanvas();
	for(var i = 0; i < shapes.length; i++)
	{
		shapes[i].drawSelf(ctx);
	}

	var evPairs = MinkowskiDiff(shapes[0], shapes[1]);
	for(var i = 0; i < evPairs.pairs1.length; i++)
	{
		evPairs.pairs1[i].drawSelf(ctx);
	}
	for(var i = 0; i < evPairs.pairs2.length; i++)
	{
		evPairs.pairs2[i].drawSelf(ctx);
	}

	var evp = evPairs.pairs1.concat(evPairs.pairs2);
	var minPosDist = Number.MAX_VALUE;
	var maxNegDist = 0 - Number.MAX_VALUE;
	var targetPosPairIndex = null;
	var targetNegPairIndex = null;
	for(var i = 0; i < evp.length; i++)
	{
		var dist = evp[i].projDist;
		if(dist >= 0)
		{
			if(minPosDist > dist)
			{
				minPosDist = dist;
				targetPosPairIndex = i;
			}
		}
		else
		{
			if(maxNegDist < dist)
			{
				maxNegDist = dist;
				targetNegPairIndex = i;
			}
		}
	}
	if(targetPosPairIndex != null)
	{
		if(targetPosPairIndex < evp.length/2)
			evp[evptargetPosPairIndex].drawSelf(ctx, "blue", "A", "B");
		else
			evp[evptargetPosPairIndex].drawSelf(ctx, "blue", "B", "A");
	}
	else
	{
		evp[targetNegPairIndex].drawSelf(ctx, "red");

	}
}