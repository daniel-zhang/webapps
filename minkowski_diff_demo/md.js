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
		this.projectionDistance = signedDistance > 0 ? shortVector.mod() : 0 - shortVector.mod();
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
 
	//Draw projection distance text
	var midPoint = this.point.add(this.projectedPoint).scalarMultiply(0.5);
	var distText = this.projectionDistance.toFixed(2);
	ctx.font = "bold 13px consola";
	ctx.fillStyle = "FloralWhite";
	ctx.fillText(distText, midPoint.x, midPoint.y);
}

function EdgeVerticesPair(edge, vertices, color)
{
	this.projectors = new Array();
	this.edge = edge;
	this.vertices = vertices;
	this.projDist = Number.MAX_VALUE;
	this.color = color;

	for(var i = 0; i < this.vertices.length; i++)
	{
		var projector = new Projector();
		projector.projectPointOntoEdge(this.vertices[i], this.edge);
		if(projector.projectionDistance >= 0)
		{
			if(this.projDist > projector.projectionDistance)
				this.projDist = projector.projectionDistance;
		}
		else 
		{
			if(this.projDist > 0 - projector.projectionDistance)
				this.projDist = projector.projectionDistance;
		}
		this.projectors.push(projector);
	}
}
EdgeVerticesPair.prototype.drawSelf = function(ctx, color)
{
	var clr = color || this.color;
	for(var i = 0; i < this.projectors.length; i++)
	{
		this.projectors[i].drawSelf(ctx, clr);
	}
}

function findSupportVertices(direction, vertices)
{
	var minProj = Number.MAX_VALUE;
	var result = new Array();
	for(var i = 0; i < vertices.length; i++)
	{
		var vertex = vertices[i];
		var proj = direction.dotMultiply(vertex);
		if(minProj > proj)
		{
			minProj = proj;
			result.length = 0;
			result.push(vertex);
		}
		else if(minProj == proj)
		{
			result.push(vertex);
		}
	}
	return result;
}
 
function MinkowskiDiff(polygonA, polygonB)
{
	var evPairs_A_B = new Array();
	for(var i = 0; i < polygonA.edges.length; i++)
	{
		var curEdge = polygonA.edges[i];
		var supportVertices = findSupportVertices(curEdge.normal, polygonB.vertices);
		var evPair = new EdgeVerticesPair(curEdge, supportVertices, polygonA.color); 
		evPairs_A_B.push(evPair);
	}
	var evPairs_B_A = new Array();
	for(var i = 0; i < polygonB.edges.length; i++)
	{
		var curEdge = polygonB.edges[i];
		var supportVertices = findSupportVertices(curEdge.normal, polygonA.vertices);
		var evPair = new EdgeVerticesPair(curEdge, supportVertices, polygonB.color);
		evPairs_B_A.push(evPair);
	}
	return {pairs1:evPairs_A_B, pairs2:evPairs_B_A};
}
