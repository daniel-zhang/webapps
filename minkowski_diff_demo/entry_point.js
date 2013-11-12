var canvas = document.getElementById("render_window");
var ctx = canvas.getContext("2d");
canvas.style.cursor = "crosshair";

var shapes = new Array();

var triangleA = new Array();
triangleA.push(new Vector2D(200, 100));
triangleA.push(new Vector2D(500, 100));
triangleA.push(new Vector2D(300, 10));

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

var mode = mode_null;
var mode_translate = 0;
var mode_rotate = 1;
var mode_null = 2;

canvas.onmousedown = function(e)
{
	isMouseDown = true;
	var mousePos = getMousePos(e, canvas);

	for(var i = 0; i < shapes.length; i++)
	{
		if(shapes[i].isClicked(mousePos) == true)
		{
			if(e.ctrlKey)
				mode = mode_rotate;
			else
				mode = mode_translate;

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
	mode = mode_null;
}
 
canvas.onmousemove = function(e)
{
	var mousePos = getMousePos(e, canvas);
	if(isMouseDown && selected != null)
	{
		// Calculate movement
		var movement = mousePos.minus(oldPos);

		// Calculate rotation
		var center = selected.getCenter();
		var v0 = center.minus(oldPos);
		var v1 = center.minus(mousePos);
		var rotation = Math.acos(v1.normalize().dotMultiply(v0.normalize()));
		if(v1.crossMultiply(v0) > 0)
			rotation = 0 - rotation;
		oldPos = mousePos;

		if(mode == mode_translate)
		{
			selected.translate(movement);
		}
		else if(mode == mode_rotate)
		{
			selected.rotate(rotation);
		}
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
	// var contacts = MinkowskiDiff2(shapes[0], shapes[1]);
	var contacts = MinkowskiDiff3(shapes[0], shapes[1]);
	for(var i = 0; i < contacts.length; i++)
	{
		if(contacts[i].distance > 0)
			contacts[i].drawSelf(ctx, "blue");
		else
			contacts[i].drawSelf(ctx, "red");
	}

	// if(contacts.length == 1)
	// {
	// 	contacts[0].drawSelf(ctx, "blue");
	// }
	// else if(contacts.length == 2)
	// {
	// 	contacts[0].drawSelf(ctx, "blue");
	// 	contacts[1].drawSelf(ctx, "red");
	// }
	// else
	// 	console.log("invalid contacts found!");
	// for(var i = 0; i < contacts.length; i ++)
	// {
	// 	if(contacts[i].distance > 0)
	// 		contacts[i].drawSelf(ctx, "blue");
	// 	else
	// 		contacts[i].drawSelf(ctx, "red");
	// }

	// var evPairs = MinkowskiDiff(shapes[0], shapes[1]);
	// for(var i = 0; i < evPairs.pairs1.length; i++)
	// {
	// 	evPairs.pairs1[i].drawSelf(ctx);
	// }
	// for(var i = 0; i < evPairs.pairs2.length; i++)
	// {
	// 	evPairs.pairs2[i].drawSelf(ctx);
	// }

	// var evp = evPairs.pairs1.concat(evPairs.pairs2);
	// var minPosDist = Number.MAX_VALUE;
	// var maxNegDist = 0 - Number.MAX_VALUE;
	// var targetPosPairIndex = null;
	// var targetNegPairIndex = null;
	// for(var i = 0; i < evp.length; i++)
	// {
	// 	var dist = evp[i].projDist;
	// 	if(dist >= 0)
	// 	{
	// 		if(minPosDist > dist)
	// 		{
	// 			minPosDist = dist;
	// 			targetPosPairIndex = i;
	// 		}
	// 	}
	// 	else
	// 	{
	// 		if(maxNegDist < dist)
	// 		{
	// 			maxNegDist = dist;
	// 			targetNegPairIndex = i;
	// 		}
	// 	}
	// }
	// if(targetPosPairIndex != null)
	// {
	// 	if(targetPosPairIndex < evp.length/2)
	// 		evp[targetPosPairIndex].drawSelf(ctx, "blue", "A", "B");
	// 	else
	// 		evp[targetPosPairIndex].drawSelf(ctx, "blue", "B", "A");
	// }
	// else
	// {
	// 	evp[targetNegPairIndex].drawSelf(ctx, "red");

	// }
}