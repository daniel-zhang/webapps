function EdgeVerticesPair()
{
 
}
 
function Projector()
{
	this.point;
	this.edge;
	this.projectedPoint;
	this.projectionDistance;
	this.projectionDistVector;
}
 
// Input: point, edge
// Return: porjected point, distance, distVector
Projector.prototype.projectPointOntoEdge = function(point, edge)
{
	this.point = point;
	this.edge = edge;
 
	var startPosToPoint = point.minus(edge.startPos);
	var endPosToPoint = point.minus(edge.endPos);
 
	var longVector, shortVector, longVectorEndPoint, shortVectorEndPoint;
 
	if(startPosToPoint.squareMod() == 0 && endPosToPoint.squareMod() == 0)
	{
		throw "both test vectors are zero, invalid edge";
	}
	else if(startPosToPoint.squareMod() >= endPosToPoint.squareMod())
	{
		longVector = startPosToPoint;
		longVectorEndPoint = edge.startPos;
		shortVector = endPosToPoint;
		shortVectorEndPoint = edge.endPos;
	}
	else 
	{
		longVector = endPosToPoint;
		longVectorEndPoint = edge.endPos;
		shortVector = startPosToPoint;
		shortVectorEndPoint = edge.startPos;
	}
 
	var signedDistance = longVector.dotMultiply(edge.normal);
	var distanceVector = edge.normal.scalarMultiply(signedDistance);
	var projectionVector = longVector.minus(distanceVector);
	// Projected point is on edge
	if(projectionVector.squareMod() <= edge.squareLen())
	{
		this.projectedPoint = longVectorEndPoint.add(projectionVector);
		this.projectionDistVector = distanceVector;
		this.projectionDistance = signedDistance;
	}
	// Projected point is out of edge
	else 
	{
		this.projectedPoint = shortVectorEndPoint;
		this.projectionDistVector = shortVector;
		this.projectionDistance = shortVector.mod();
	}
}
Projector.prototype.drawSelf = function(ctx, color)
{
	var clr = color || "black";
	// Draw projection
	ctx.beginPath();
	ctx.moveTo(this.point.x, this.point.y);
	ctx.lineTo(this.projectedPoint.x, this.projectedPoint.y);
	ctx.strokeStyle = clr;
	ctx.stroke();
 
	//Draw projection distance
	var midPoint = this.point.add(this.projectedPoint).scalarMultiply(0.5);
	var distText = this.projectionDistance.toFixed(2);
	ctx.font = "bold 13px consola";
	ctx.fillStyle = "FloralWhite";
	ctx.fillText(distText, midPoint.x, midPoint.y);
}