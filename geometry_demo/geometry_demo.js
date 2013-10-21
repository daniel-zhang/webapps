var infoWindow = document.getElementById("log_window1");

infoWindow.rows = 20;
infoWindow.cols = 40;

var counter = 0;
var canvas = document.getElementById("render_viewport_1");
canvas.style.cursor = "crosshair";

function show(txt, critical)
{
  counter += 1;
  if(critical)
		infoWindow.innerHTML += "\n" + counter + ">" + txt + "\n---------------------------------------\n";
	else
		infoWindow.innerHTML += counter + ">" + txt + "\n";
	
	infoWindow.scrollTop = infoWindow.scrollHeight;
}


function Mode()
{
	this.isMouseDown = false;
	var that = this; // Good companion of callback functions
	
	this.move = 0;
	this.rotate = 1;
	this.drawLine = 2;
	this.drawPolygon = 3;

	this.editMode = this.drawLine;

	// These UI code really sucks...
	var moveButton = document.getElementById("move_mode");
	var rotateButton = document.getElementById("rotate_mode");
	var drawLineButton = document.getElementById("draw_line_mode");
	var drawPolyButton = document.getElementById("draw_poly_mode");
	var activeBgColor = "#ff9640";
	moveButton.onclick = function()
	{
		that.editMode = that.move;
		this.style.top = "3px";
		this.style.backgroundColor=activeBgColor;

		rotateButton.style.backgroundColor= "#369";
		rotateButton.style.top = "0px";
		drawLineButton.style.backgroundColor = "#369";
		drawLineButton.style.top = "0px";
		drawPolyButton.style.backgroundColor = "#369";
		drawPolyButton.style.top = "0px";
	}
	drawLineButton.onclick = function()
	{
		that.editMode = that.drawLine;
		this.style.top = "3px";
		this.style.backgroundColor=activeBgColor;

		moveButton.style.backgroundColor= "#369";
		moveButton.style.top = "0px";
		rotateButton.style.backgroundColor = "#369";
		rotateButton.style.top = "0px";
		drawPolyButton.style.backgroundColor = "#369";
		drawPolyButton.style.top = "0px";
	}

	rotateButton.onclick = function()
	{
		that.editMode = that.rotate;
		this.style.top = "3px";
		this.style.backgroundColor=activeBgColor;

		drawLineButton.style.backgroundColor = "#369";
		drawLineButton.style.top = "0px";
		moveButton.style.backgroundColor= "#369";
		moveButton.style.top = "0px";
		drawPolyButton.style.backgroundColor = "#369";
		drawPolyButton.style.top = "0px";
	}
	drawPolyButton.onclick = function()
	{
		that.editMode = that.drawPolygon;
		this.style.top = "3px";
		this.style.backgroundColor=activeBgColor;

		drawLineButton.style.backgroundColor = "#369";
		drawLineButton.style.top = "0px";
		moveButton.style.backgroundColor= "#369";
		moveButton.style.top = "0px";
		rotateButton.style.backgroundColor = "#369";
		rotateButton.style.top = "0px";
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
		// Redraw if pen style is changed
		drawStuff(lastCursorPos);
	}
}

var lastCursorPos = new Point(0, 0);
var mode = new Mode();
var shapes = new Array();
var curShape = null;
var cDetector = new CollisionDetector();
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
		this.selectedShape.translate(movement);
		
		this.startPoint.x = x;
		this.startPoint.y = y;
	}
	this.updateRotation = function(x, y)
	{
		if(this.enabled == false) return;

		var center = this.selectedShape.translation;
		var initVector = new Vector2D(this.startPoint.x - center.x, this.startPoint.y - center.y);
		var curVector = new Vector2D(x - center.x, y - center.y);
		initVector.normalize();
		curVector.normalize();
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
	var clickPos = new Point(x, y);
	
	switch(mode.editMode)
	{
		case mode.move:
		case mode.rotate:
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
		curShape.addPoint(clickPos);
		break;

		case mode.drawPolygon:
		if(curShape == null)
		{
			curShape = new ConvexPolygon();
			curShape.addPoint(clickPos);
		}
		else
		{
			if(curShape.points[0].squaredDistance(clickPos) < 100)
			{
				curShape.setDone(true);
				shapes.push(curShape);
				curShape = null;
			}
			else
				curShape.addPoint(clickPos);
		}
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

		case mode.draw_poly_mode:
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

		case mode.drawPolygon:
		if(mode.isMouseDown == false)
		{

		}
		break;
	}
	cDetector.macroDetect(shapes);
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
	ctx.fillStyle = "#7ba7c9";
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

	
	// Draw the origin of Minkowski Space
	var tx = 600;
	var ty = 400;
	ctx.beginPath();
	ctx.arc(tx, ty, 5, 0, Math.PI*2);
	ctx.fillStyle="red";
	ctx.fill();

	// Draw Minkowski set
	/*
	for(var i = 0; i < cDetector.mDifference.mdSet.length; i++)
	{
		var point = cDetector.mDifference.mdSet[i];
		ctx.beginPath();
		ctx.arc(point.x+tx, point.y+ty,5,0,Math.PI*2 );
		ctx.fillStyle="black";
		ctx.fill();
	}
	*/

	// Draw Minkowski set
	var mdb = cDetector.mDifference.mdBoundary;
	for(var i = 0; i < mdb.length/2; i++)
	{
		var p0 = mdb[2*i];
		var p1 = mdb[2*i+1];
		ctx.beginPath();
		ctx.moveTo(p0.x + tx, p0.y + ty);
		ctx.lineTo(p1.x + tx, p1.y + ty);
		if(i < mdb.length/4)
			ctx.strokeStyle ="black";
		else
			ctx.strokeStyle ="yellow";
		ctx.stroke();
	}
}

//
// A little bit math
//
function Vector2D(x, y)
{
	this.x = x;
	this.y = y;
}
Vector2D.prototype.mod = function()
{
	return Math.sqrt(this.x * this.x + this.y * this.y);
}
Vector2D.prototype.normalize = function()
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

//
// Point
//
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

Point.prototype.getMid = function(that)
{
	return new Point((this.x + that.x)/2, (this.y + that.y)/2);
}

Point.prototype.minus = function(that)
{
	return new Point(this.x - that.x, this.y - that.y);
}

Point.prototype.isZero = function()
{
	if(this.x == 0 && this.y == 0)
		return true;
	else
		return false;
}
//
// AABB
//
function AABB()
{
	this.leftUpper = new Vector2D(0, 0);
	this.rightBottom = new Vector2D(0, 0);
	this.center = new Vector2D(0, 0);

	// For convenience, just save contacts info into AABB
	this.contacts = new Array();
	this.isIntersecting = function()
	{
		if(this.contacts.length == 0)
			return false;
		else
			return true;
	}
	
	this.addContact = function(index)
	{
		// Do nothing if index is already there
		for(var i = 0; i < this.contacts.length; i++)
		{
			if(this.contacts[i] == index)
				return;
		}
		
		// Add if it's not there
		this.contacts.push(index);
	}
	
	this.removeContact = function(index)
	{
		var indexToRemove = -1;
		for(var i = 0; i < this.contacts.length; i++)
		{
			if(this.contacts[i] == index)
			{
				indexToRemove = i;
				break;
			}
		}
		if(indexToRemove != -1)
			this.contacts.splice(indexToRemove, 1);
	}
	
	this.rebuild = function(pset)
	{
		if(pset == null || pset.length == 0)	return;
		
		this.init(pset[0]);
		for(var i = 1; i < pset.length; i++)
		{
			this.updateSinglePoint(pset[i]);
		}
	}
	
	this.init = function(p)
	{		
		this.leftUpper.x = p.x;
		this.leftUpper.y = p.y;
		this.rightBottom.x = p.x;
		this.rightBottom.y = p.y;
		
		this.center.x = (this.leftUpper.x + this.rightBottom.x)/2;
		this.center.y = (this.leftUpper.y + this.rightBottom.y)/2;
	}
	
	this.updateSinglePoint = function (p)
	{
		if(p == null) return;
		
		this.leftUpper.x = this.leftUpper.x < p.x ? this.leftUpper.x : p.x;
		this.leftUpper.y = this.leftUpper.y < p.y ? this.leftUpper.y : p.y;
		
		this.rightBottom.x = this.rightBottom.x > p.x ? this.rightBottom.x : p.x;
		this.rightBottom.y = this.rightBottom.y > p.y ? this.rightBottom.y : p.y;
		
		this.center.x = (this.leftUpper.x + this.rightBottom.x)/2;
		this.center.y = (this.leftUpper.y + this.rightBottom.y)/2;
	}
	
	this.translate = function(m)
	{
		if (m == null) return;
		this.leftUpper.x += m.x;
		this.leftUpper.y += m.y;
		this.rightBottom.x += m.x;
		this.rightBottom.y += m.y;
		
		this.center.x += m.x;
		this.center.y += m.y;
	}
}

//
// Normal
//
function Normal(fn, vIndex)
{
	this.n = fn;
	this.vertexIndex = vIndex;
}

//
// Line
// 
function Line()
{
	this.points = new Array();
	this.done = false;
	// Track this line's translation from origin
	this.translation = null;
	this.aabb = new AABB();
	this.faceNormals = new Array();
}

Line.prototype.calcFaceNormals = function()
{
	this.faceNormals.length = 0;
	for(var i = 0; i < this.points.length-1; i++)
	{
		var startP = this.points[i];
		var endP = this.points[i+1];
		var n = new Vector2D(startP.y - endP.y, endP.x - startP.x);
		n.normalize();
		this.faceNormals.push(new Normal(n, i));
	}
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
		this.calcFaceNormals();
	}
}

Line.prototype.addPoint = function(p)
{
	this.points.push(p);
	if(this.points.length == 1)
		this.aabb.init(p);
	else
		this.aabb.updateSinglePoint(p);
}

Line.prototype.drawSelf = function()
{
	switch(mode.penStyle)
	{
	case mode.dotStyle: this.drawSelfDot(); break;
	case mode.lineStyle: this.drawSelfLineSeg(); break;
	case mode.bezierStyle: this.drawSelfBezierSeg(); break;
	}
	// Draw AABB
	ctx.strokeStyle = "blue";
	if(this.aabb.isIntersecting())
	{
		ctx.strokeStyle = "red";
	}
	ctx.strokeRect(
		this.aabb.leftUpper.x, 
		this.aabb.leftUpper.y, 
		this.aabb.rightBottom.x - this.aabb.leftUpper.x,
		this.aabb.rightBottom.y - this.aabb.leftUpper.y
		);
	
	// Draw normals
	var normalLen = 15;
	for(var i = 0; i < this.faceNormals.length; i++)
	{
		var ind = this.faceNormals[i].vertexIndex;
		if(ind < this.points.length-1)
		{
			var startP = this.points[ind];
			var endP = this.points[ind+1];
		
			var mid = startP.getMid(endP);
			var norm = this.faceNormals[i].n;
		
			ctx.beginPath();
			ctx.moveTo(mid.x, mid.y);
			ctx.lineTo(mid.x + normalLen * norm.x, mid.y + normalLen* norm.y);
			ctx.strokeStyle="DarkSlateGray";
			ctx.stroke();
		}
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

Line.prototype.translate = function(movement)
{
	if(movement == null) return;
	for(var i = 0; i < this.points.length; i++)
	{
		this.points[i].x += movement.x;	
		this.points[i].y += movement.y;
	}
	this.translation.x += movement.x;
	this.translation.y += movement.y;
	this.aabb.translate(movement);
	this.calcFaceNormals();
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
	this.aabb.rebuild(this.points);
	this.calcFaceNormals();
}

//
// Convex polygon
//
function ConvexPolygon()
{
	this.points = new Array();
	this.done = false;
	this.translation = null;
	this.aabb = new AABB();
	this.faceNormals = new Array();
}
ConvexPolygon.prototype.setDone = function(flag)
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
		this.calcFaceNormals();
	}	
}
ConvexPolygon.prototype.calcFaceNormals = function()
{
	this.faceNormals.length = 0;
	var startP, endP, n;
	for(var i = 0; i < this.points.length-1; i++)
	{
		startP = this.points[i];
		endP = this.points[i+1];
		n = new Vector2D(startP.y - endP.y, endP.x - startP.x);
		n.normalize();
		this.faceNormals.push(new Normal(n, i));
	}
	// Connect the last and first point(into at least a triangle)
	if(this.points.length > 2)
	{
		var lastIndex = this.points.length - 1;
		startP = this.points[lastIndex];
		endP = this.points[0];
		n = new Vector2D(startP.y - endP.y, endP.x - startP.x);
		n.normalize();
		this.faceNormals.push(new Normal(n, lastIndex));
	}
}
ConvexPolygon.prototype.addPoint = function(p)
{
	this.points.push(p);
	if(this.points.length == 1)
		this.aabb.init(p);
	else
		this.aabb.updateSinglePoint(p);	
}
ConvexPolygon.prototype.drawSelf = function()
{
	if(this.points.length == 0) return;
	ctx.beginPath();
	ctx.moveTo(this.points[0].x, this.points[0].y);
	for(var i = 1; i < this.points.length; i++)
	{
		ctx.lineTo(this.points[i].x, this.points[i].y);
	}
	// Draw the 'closing' line
	if(this.points.length > 2)
		ctx.lineTo(this.points[0].x, this.points[0].y);

	ctx.strokeStyle = "green";
	ctx.stroke();

	// Draw AABB
	ctx.beginPath();
	ctx.strokeStyle = "blue";
	if(this.aabb.isIntersecting())
	{
		ctx.strokeStyle = "red";
	}
	ctx.strokeRect(
		this.aabb.leftUpper.x, 
		this.aabb.leftUpper.y, 
		this.aabb.rightBottom.x - this.aabb.leftUpper.x,
		this.aabb.rightBottom.y - this.aabb.leftUpper.y
		);
	
	// Draw normals
	var normalLen = 15;
	for(var i = 0; i < this.faceNormals.length; i++)
	{
		var ind = this.faceNormals[i].vertexIndex;
		if(ind < this.points.length-1)
		{
			var startP = this.points[ind];
			var endP = this.points[ind+1];
		
			var mid = startP.getMid(endP);
			var norm = this.faceNormals[i].n;
		
			ctx.beginPath();
			ctx.moveTo(mid.x, mid.y);
			ctx.lineTo(mid.x + normalLen * norm.x, mid.y + normalLen* norm.y);
			ctx.strokeStyle="DarkSlateGray";
			ctx.stroke();
		}
		else if (ind == this.points.length-1)
		{
			var startP = this.points[ind];
			var endP = this.points[0];
			var mid = startP.getMid(endP);
			var norm = this.faceNormals[i].n;

			ctx.beginPath();
			ctx.moveTo(mid.x, mid.y);
			ctx.lineTo(mid.x + normalLen * norm.x, mid.y + normalLen* norm.y);
			ctx.strokeStyle="DarkSlateGray";
			ctx.stroke();
		}
	}
}
ConvexPolygon.prototype.isTouched = function(p)
{
	for(var i = 0; i < this.points.length; i++)
		if(this.points[i].squaredDistance(p) < 100)
			return true;
	return false;
}
ConvexPolygon.prototype.translate = function(movement)
{
	if(movement == null) return;
	for(var i = 0; i < this.points.length; i++)
	{
		this.points[i].x += movement.x;	
		this.points[i].y += movement.y;
	}
	this.translation.x += movement.x;
	this.translation.y += movement.y;
	this.aabb.translate(movement);
	this.calcFaceNormals();
}
ConvexPolygon.prototype.rotate = function(rad)
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
	this.aabb.rebuild(this.points);
	this.calcFaceNormals();
}

//
// Collisison Detector
//
function CollisionDetector()
{
	this.mDifference = new MinkowskiSpace();
	this.macroDetect = function(objects)
	{
		if(objects == null || objects.length < 2) return;
		for(var i = 0; i < objects.length - 1; i ++)
		{
			for(var j = i+1 ; j < objects.length; j ++)
			{
				this.detectAABB(objects, i, j);
			}
		}
		this.mDifference.build(objects[0], objects[1]);
	}
	this.detectAABB = function(objs, indexA, indexB)
	{
		var boxA = objs[indexA].aabb;
		var boxB = objs[indexB].aabb;
		
		var halfLenAX = (boxA.rightBottom.x - boxA.leftUpper.x)/2;
		var halfLenAY = (boxA.rightBottom.y - boxA.leftUpper.y)/2;
		var halfLenBX = (boxB.rightBottom.x - boxB.leftUpper.x)/2;
		var halfLenBY = (boxB.rightBottom.y - boxB.leftUpper.y)/2;
		
		var dx = boxA.center.x - boxB.center.x;
		var dy = boxA.center.y - boxB.center.y;
		dx = dx > 0 ? dx : 0 - dx;
		dy = dy > 0 ? dy : 0 - dy;
		
		var distX = dx - (halfLenAX + halfLenBX);
		var distY = dy - (halfLenAY + halfLenBY);
		
		if(distX <= 0 && distY <= 0)
		{
			boxA.addContact(indexB);
			boxB.addContact(indexA);
		}
		else
		{
			boxA.removeContact(indexB);
			boxB.removeContact(indexA);
		}
	}
	
	this.microDetect = function()
	{
		
	}
}

function MinkowskiSpace()
{
	this.mdSet = new Array();
	this.mdBoundary = new Array();
	this.translation = new Vector2D(400, 300);

	var findSupportVertex = function(normal, vertices)
	{
		var minProj = Number.MAX_VALUE;
		var supportIndex = null;
		for(var i = 0; i < vertices.length; i++)
		{
			var result = normal.dot(vertices[i]);
			if(minProj > result)
			{
				minProj = result;
				supportIndex = i;
			}
		}
		if(supportIndex != null)
			return vertices[supportIndex];
		else
			return null;
	}

	this.build = function(objA, objB)
	{
		// Empty Minkowski space
		this.mdSet.length = 0;
		// Build Minkowski Difference for reference
		for(var i = 0; i < objA.points.length; i++)
		{
			var pointA = objA.points[i];
			for(var j = 0; j < objB.points.length; j++)
			{
				var pointB = objB.points[j];
				this.mdSet.push(pointA.minus(pointB));
			}
		}
		
		// Empty boundary data
		this.mdBoundary.length = 0;
		// Improved MD: objA -> objB
		for(var i = 0; i < objA.faceNormals.length; i++)
		{
			var normal = objA.faceNormals[i].n;
			var v0 = objA.points[objA.faceNormals[i].vertexIndex];
			var v1 = objA.points[(objA.faceNormals[i].vertexIndex + 1)%objA.points.length];
			var supportVertex = findSupportVertex(normal, objB.points);

			if(supportVertex != null)
			{
				this.mdBoundary.push(new Point(v0.x - supportVertex.x, v0.y - supportVertex.y));
				this.mdBoundary.push(new Point(v1.x - supportVertex.x, v1.y - supportVertex.y));
			}
		}
		// Improved MD: objB -> objA
		for(var i = 0; i < objB.faceNormals.length; i++)
		{
			var normal = objB.faceNormals[i].n;
			var v0 = objB.points[objB.faceNormals[i].vertexIndex];
			var v1 = objB.points[(objB.faceNormals[i].vertexIndex + 1)%objB.points.length];
			var supportVertex = findSupportVertex(normal, objA.points);

			if(supportVertex != null)
			{
				this.mdBoundary.push(new Point(supportVertex.x - v0.x, supportVertex.y - v0.y));
				this.mdBoundary.push(new Point(supportVertex.x - v1.x, supportVertex.y - v1.y));
			}
		}
	}
}