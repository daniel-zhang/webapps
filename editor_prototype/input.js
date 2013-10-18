var infoWindow = document.getElementById("info");

infoWindow.rows = 20;
infoWindow.cols = 50;

var counter = 0;
var canvas = document.getElementById("canvas");
canvas.style.cursor = "crosshair";

function show(txt, critical)
{
  counter += 1;
	if(critical)
		infoWindow.innerHTML += "\n" + counter + ">" + txt + "\n--------------------------\n";
	else
		infoWindow.innerHTML += counter + ">" + txt + "\n";
	
	infoWindow.scrollTop = infoWindow.scrollHeight;
}


function Mode()
{
	this.isMouseDown = false;
	var that = this; // Good companion of callback functions
	
	this.move = 0;
	this.drawLine = 1;
	this.rotate = 2;
	this.editMode = this.drawLine;
	document.getElementById("move_mode").onclick = function()
	{
		that.editMode = that.move;
	}
	document.getElementById("draw_line_mode").onclick = function()
	{
		that.editMode = that.drawLine;
	}
	document.getElementById("rotate_mode").onclick = function()
	{
		that.editMode = that.rotate;
	}
	
	this.dotStyle = 0;
	this.lineStyle = 1;
	this.bezierStyle = 2;
	this.penStyle = this.dotStyle;
	
	document.getElementById("pen_style_options").onclick = function()
	{
		var styleType = this.options[this.selectedIndex].value;
		switch(styleType)
		{
			case "pen_style_dot": that.penStyle = that.dotStyle; break;
			case "pen_style_line": that.penStyle = that.lineStyle; break;
			case "pen_style_bezier": that.penStyle = that.bezierStyle; break;
		}
		drawStuff(lastCursorPos);
	}
}
var lastCursorPos = new Point(0, 0);
var mode = new Mode();
var shapes = new Array();
var curShape = null;

function Selection()
{
	this.selectedShape = null;
	this.startPoint = null;
	this.enabled = false;
	
	this.select = function(shape, at)
	{
		this.selectedShape = shape;
		this.startPoint = at;
		this.enabled = true;
	}
	this.updateMovement = function(x, y)
	{
		if(this.enabled == false) return;
		
		var movement = new Vector2D(x - this.startPoint.x, y - this.startPoint.y);	
		this.selectedShape.updatePosition(movement);
		
		this.startPoint.x = x;
		this.startPoint.y = y;
	}
	this.updateRotation = function(x, y)
	{
		if(this.enabled == false) return;

		var center = this.selectedShape.translation;
		var initVector = new Vector2D(this.startPoint.x - center.x, this.startPoint.y - center.y);
		var curVector = new Vector2D(x - center.x, y - center.y);
		initVector.nomarlize();
		curVector.nomarlize();
		var theta = Math.acos(initVector.dot(curVector));
		if(initVector.x * curVector.y - initVector.y * curVector.x > 0)
		{
			this.selectedShape.rotate(theta);
		}
		else
		{
			this.selectedShape.rotate(0-theta);
		}
		this.startPoint.x = x;
		this.startPoint.y = y;
	}
	this.clear = function()
	{
		this.startPoint = null;
		this.selectedShape = null;
		this.enabled = false;
	}
}
var selection = new Selection();

canvas.onmouseover = function(e){show("Mouse into " + this.id , true);};
canvas.onmouseout = function(e){show("Mouse out of " + this.id, true);};

canvas.onmousedown = function(e)
{
	mode.isMouseDown = true;
	var x = e.clientX - canvas.offsetLeft;
	var y = e.clientY - canvas.offsetTop;
	
	switch(mode.editMode)
	{
		case mode.move:
		case mode.rotate:
			var clickPos = new Point(x, y);
			for(var i = 0; i < shapes.length; i++)
			{
				if(shapes[i].isTouched(clickPos))
				{
					selection.select(shapes[i], clickPos);
				}
			}
		break;
		
		case mode.drawLine:
			curShape = new Line();		
			curShape.addPoint(new Point(x, y));
		break;
	}
	
};

canvas.onmouseup = function(e)
{
	mode.isMouseDown = false;
	switch(mode.editMode)
	{
		case mode.drawLine:
			if(curShape != null)
			{
				curShape.setDone(true);
				shapes.push(curShape);
				curShape = null;
			}
		break;
			
		case mode.move:
		case mode.rotate:
			selection.clear();
		break;
	}
};

canvas.onmousemove = function(e)
{
	var x = e.clientX - canvas.offsetLeft;
	var y = e.clientY - canvas.offsetTop;
	switch(mode.editMode)
	{
		case mode.move:
			if(mode.isMouseDown)
			{
				selection.updateMovement(x, y);
			}
		break;

		case mode.rotate:
			if(mode.isMouseDown)
			{
				selection.updateRotation(x, y);
			}
		break;
		
		case mode.drawLine:
			if(mode.isMouseDown)
			{
				curShape.addPoint(new Point(x, y));
			}
		break;
	}
	drawStuff(new Point(e.clientX, e.clientY));
};

canvas.onmousewheel = function(e)
{
	var txt = "";
	if(e.wheelDelta > 0)
	{
		canvas.width = canvas.width*1.1*(e.wheelDelta/120);
		canvas.height = canvas.height*1.1*(e.wheelDelta/120);
	}
	else if (e.wheelDelta < 0)
	{
		canvas.width = canvas.width*0.93*(0-e.wheelDelta/120);
		canvas.height = canvas.height*0.93*(0-e.wheelDelta/120);
	}
	
};

var ctx = canvas.getContext("2d");


function clearBg()
{
	ctx.beginPath();
	//ctx.save();
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	//ctx.restore();
}

function drawStuff(point)
{
	var x = point.x - canvas.offsetLeft;
	var y = point.y - canvas.offsetTop;
	lastCursorPos = point;
	
	clearBg();
	ctx.beginPath();
	ctx.strokeStyle = "blue";
	ctx.moveTo(0, y-1);
	ctx.lineTo(canvas.width, y-1), 
	ctx.stroke();
	
	ctx.beginPath();
	ctx.strokeStyle = "blue";
	ctx.moveTo(x-1, 0);
	ctx.lineTo(x-1, canvas.height);
	ctx.stroke();
	
	if(curShape != null)
		curShape.drawSelf();
		
	for(var i = 0; i < shapes.length; i++)
	{	
		shapes[i].drawSelf();
	}
}

function Vector2D(x, y)
{
	this.x = x;
	this.y = y;
}
Vector2D.prototype.mod = function()
{
	return Math.sqrt(this.x * this.x + this.y * this.y);
}
Vector2D.prototype.nomarlize = function()
{
	var mod = this.mod();
	if(mod == 0) return;

	this.x = this.x / mod;
	this.y = this.y / mod;
}
Vector2D.prototype.dot = function(that)
{
	return this.x * that.x + this.y * that.y;
}

function Point(x, y)
{
	this.x = x;
	this.y = y;
}
Point.prototype.equal = function(that)
{
	if(this.x == that.x && this.y == that.y)
		return true;
	else
		return false;
}
Point.prototype.squaredDistance = function(that)
{
	var dx = this.x - that.x;
	var dy = this.y - that.y;
	return dx*dx + dy*dy;
}

function Line()
{
	this.points = new Array();
	this.done = false;
	this.translation = null;
}
Line.prototype.setDone = function(flag)
{
	this.done = flag;
	if(this.done)
	{
		var sumX = sumY = 0;
		var len = this.points.length;
		for(var i = 0; i < len; i++)
		{
			sumX += this.points[i].x;
			sumY += this.points[i].y;
		}
		this.translation = new Vector2D(sumX/len, sumY/len);	
	}
}

Line.prototype.addPoint = function(p)
{
	this.points.push(p);
}

Line.prototype.drawSelf = function()
{
	switch(mode.penStyle)
	{
	case mode.dotStyle: this.drawSelfDot(); break;
	case mode.lineStyle: this.drawSelfLineSeg(); break;
	case mode.bezierStyle: this.drawSelfBezierSeg(); break;
	}
}

Line.prototype.drawSelfDot = function()
{
	for(var i = 0; i < this.points.length; i++)
	{
		ctx.beginPath();
		ctx.fillStyle = "green";
		ctx.arc(this.points[i].x, this.points[i].y, 1, 0, 2*Math.PI);
		ctx.fill();
	}
}
Line.prototype.drawSelfLineSeg = function()
{
	if(this.points.length == 0) return;
	ctx.beginPath();
	ctx.moveTo(this.points[0].x, this.points[0].y);
	for(var i = 1; i < this.points.length; i++)
	{
		ctx.lineTo(this.points[i].x, this.points[i].y);
	}
	ctx.strokeStyle = "green";
	ctx.stroke();
}
Line.prototype.drawSelfBezierSeg = function()
{
	if(this.points.length == 0) return;
	ctx.beginPath();
	ctx.moveTo(this.points[0].x, this.points[0].y);
	for(var i = 1; i < this.points.length -1; i++)
	{
		ctx.bezierCurveTo(this.points[i-1].x, this.points[i-1].y, this.points[i+1].x, this.points[i+1].y, this.points[i].x, this.points[i].y);
	}
	ctx.strokeStyle = "green";
	ctx.stroke();
}

Line.prototype.isTouched = function(p)
{
	for(var i = 0; i < this.points.length; i++)
	{
		if(this.points[i].squaredDistance(p) < 100)
			return true;
	}
	return false;
}

Line.prototype.updatePosition = function(movement)
{
	for(var i = 0; i < this.points.length; i++)
	{
		this.points[i].x += movement.x;	
		this.points[i].y += movement.y;
	}
		this.translation.x += movement.x;
		this.translation.y += movement.y;
}

Line.prototype.rotate = function(rad)
{
    for(var i = 0; i < this.points.length; i++)
    {
    	// translate back to origin
    	this.points[i].x -= this.translation.x;
    	this.points[i].y -= this.translation.y;
    
    	// rotate points
    	var tmpX = this.points[i].x * Math.cos(rad) - this.points[i].y * Math.sin(rad);
    	var tmpY = this.points[i].x * Math.sin(rad) + this.points[i].y * Math.cos(rad);
    	this.points[i].x = tmpX;
    	this.points[i].y = tmpY;
    
    	// translate to where it should be
    	this.points[i].x += this.translation.x;
    	this.points[i].y += this.translation.y;
    }
}