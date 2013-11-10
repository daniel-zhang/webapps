function Edge(startPos, endPos)
{
	if(startPos.isZero() && endPos.isZero())
		throw "Both endpoints are zero";
 
	this.startPos = startPos;
	this.endPos = endPos;
	this.mid = null; 
	this.normal = null;
 
	this.update();
}
Edge.prototype.update = function() 
{ 
	this.normal = (new Vector2D(this.startPos.y - this.endPos.y, this.endPos.x - this.startPos.x)).normalize();
	this.mid = this.startPos.add(this.endPos).scalarMultiply(0.5);
}
Edge.prototype.squareLen = function(){ return this.endPos.minus(this.startPos).squareMod();}
Edge.prototype.len = function() { return this.endPos.minus(this.startPos).mod(); }
 
Edge.prototype.drawSelf = function(ctx, color)
{
	var clr = color || "red";
	// Draw edge
	ctx.beginPath();
	ctx.moveTo(this.startPos.x, this.startPos.y);
	ctx.lineTo(this.endPos.x, this.endPos.y);
	ctx.strokeStyle = clr;
	var tmp = ctx.lineWidth;
	ctx.lineWidth = 2;
	ctx.stroke();
	ctx.lineWidth = tmp;

	// Draw normal
	var normalStart = this.mid;
	var normalEnd = this.mid.add(this.normal.scalarMultiply(20));
	ctx.beginPath();
	ctx.moveTo(normalStart.x, normalStart.y);
	ctx.lineTo(normalEnd.x, normalEnd.y);
	ctx.strokeStyle = "black";
	ctx.stroke();
}
 
 
function Polygon(vertices, color)
{
	this.vertices = vertices;
	this.edges = new Array();
	this.color = color;
 
	this.init();
}
Polygon.prototype.init = function()
{
	var numOfVertices = this.vertices.length;
	for(var i = 0; i < numOfVertices; i++)
	{
		this.edges.push(new Edge(this.vertices[i], this.vertices[(i + 1) % numOfVertices]));
	}
}

Polygon.prototype.getCenter = function()
{
	var sum = this.vertices[0].duplicate();
	for(var i = 1; i < this.vertices.length; i++)
	{
		sum.addSelf(this.vertices[i]);
	}
	return sum.scalarDivide(this.vertices.length);
}

Polygon.prototype.translate = function(movement)
{
	for(var i = 0; i < this.vertices.length; i++)
	{
		this.vertices[i].addSelf(movement);
	}
	for(var i = 0; i < this.edges.length; i++)
	{
		this.edges[i].update();
	}
}

Polygon.prototype.rotate = function(rotation)
{
	var rotationCenter = this.getCenter(); 

	for( var i = 0; i < this.vertices.length; i++)
	{
		// Translate rotationCenter to origin
		this.vertices[i].minusSelf(rotationCenter);
		// Rotate around rotationCenter
		this.vertices[i].rotate(rotation);
		// Translate back to where it is
		this.vertices[i].addSelf(rotationCenter);
	}

	// Update edges from vertices
	for(var i = 0; i < this.edges.length; i++)
	{
		this.edges[i].update();
	}
}
 
Polygon.prototype.drawSelf = function(ctx)
{
	for(var i = 0; i < this.edges.length; i++)
	{
		this.edges[i].drawSelf(ctx, this.color);
	}
}

Polygon.prototype.isClicked = function(pos)
{
	for(var i = 0; i < this.vertices.length; i++)
	{
		var testV = pos.minus(this.vertices[i]);
		var edge = new Edge(this.vertices[i], this.vertices[(i + 1) % this.vertices.length]);
		if(testV.dotMultiply(edge.normal) >= 0)
			return false;
	}
	return true;
}