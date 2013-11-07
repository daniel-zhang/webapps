function Edge(startPos, endPos)
{
	if(startPos.isZero() && endPos.isZero())
		throw "Both endpoints are zero";
 
	this.startPos = startPos;
	this.endPos = endPos;
	this.mid = startPos.add(endPos).scalarMultiply(0.5);
	this.normal = null;
 
	this.updateNormal();
	if(this.normal == null)
		throw "Failed to calculate normal for Edge: " + startPos + ", " + endPos;
}
Edge.prototype.updateNormal = function() { this.normal = (new Vector2D(this.startPos.y - this.endPos.y, this.endPos.x - this.startPos.x)).normalize();}
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
	ctx.stroke();
	// Draw normal
	var normalStart = this.mid;
	var normalEnd = this.mid.add(this.normal.scalarMultiply(20));
	ctx.beginPath();
	ctx.moveTo(normalStart.x, normalStart.y);
	ctx.lineTo(normalEnd.x, normalEnd.y);
	ctx.strokeStyle = "black";
	ctx.stroke();
}
 
 
function Polygon(vertices)
{
	this.vertices = vertices;
	this.edges = new Array();
 
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
 
Polygon.prototype.drawSelf = function(ctx, color)
{
	for(var i = 0; i < this.edges.length; i++)
	{
		this.edges[i].drawSelf(ctx, color);
	}
}