var FLOATING_ERROR = 0.2;
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
EdgeVerticesPair.prototype.drawSelf = function(ctx, color, projLabel, pointLabel)
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
		// else if(minProj == proj)
		// {
		// 	result.push(vertex);
		// }
		else if(Math.abs(minProj - proj) < FLOATING_ERROR)
		{
			console.log(minProj + " : " + proj);
			result.push(vertex);
		}
	}
	if(result.length > 1) console.log("2 support vertices found!");
	return result;
}

function ContactPair(edgeOfA, vertexOfB)
{
	this.projector = new Projector();
	this.projector.projectPointOntoEdge(vertexOfB, edgeOfA);

	this.pointOnA = this.projector.projectedPoint;
	this.pointOnB = this.projector.point;
	this.distance = this.projector.projectionDistance;
	this.distVector = this.projector.projectionDistVector;
}
ContactPair.prototype.flip = function()
{
	var tmp = this.pointOnA;
	this.pointOnA = this.pointOnB;
	this.pointOnB = tmp;
	this.distVector.negate();

	return this;
}
ContactPair.prototype.drawSelf = function(ctx, color)
{
	this.projector.drawSelf(ctx, color);
	ctx.fillText("A", this.pointOnA.x, this.pointOnA.y);
	ctx.fillText("B", this.pointOnB.x, this.pointOnB.y);
}

function MinkowskiDiff2(polygonA, polygonB)
{
	// Edges from A, vertices from B
	var minPosDist = Number.MAX_VALUE;
	var maxNegDist = 0 - Number.MAX_VALUE;
	var minPosPairAB = null;
	var maxNegPairAB = null;
	for(var i = 0; i < polygonA.edges.length; i++)
	{
		var curEdge = polygonA.edges[i];
		var supportVertices = findSupportVertices(curEdge.normal, polygonB.vertices);
		for(var j = 0; j < supportVertices.length; j++)
		{
			var supportVertex = supportVertices[j];
			var contactPairAB = new ContactPair(curEdge, supportVertex);

			// Debug draw
			// if(contactPairAB.distance > 0)
			 contactPairAB.drawSelf(ctx, "blue");

			// Trace minimal positive pair
			if(contactPairAB.distance >= 0)
			{
				if(minPosDist > contactPairAB.distance)
				{
					minPosDist = contactPairAB.distance;
					minPosPairAB = contactPairAB;
				}
			}
			// Trace maximal negative pair
			else
			{
				if(maxNegDist < contactPairAB.distance)
				{
					maxNegDist = contactPairAB.distance;
					maxNegPairAB = contactPairAB;
				}
			}
		}
	}

	// Edges from B, vertices from A
	minPosDist = Number.MAX_VALUE;
	maxNegDist = 0 - Number.MAX_VALUE;
	var minPosPairBA = null;
	var maxNegPairBA = null;
	for(var i = 0; i < polygonB.edges.length; i++)
	{
		var curEdge = polygonB.edges[i];
		var supportVertices = findSupportVertices(curEdge.normal, polygonA.vertices);
		for( var j = 0; j < supportVertices.length; j++)
		{
			var supportVertex = supportVertices[j];
			var contactPairBA = new ContactPair(curEdge, supportVertex);

			// Debug draw
			// if(contactPairBA.distance > 0)
			contactPairBA.drawSelf(ctx, "red");

			// Trace minimal positive pair
			if(contactPairBA.distance >= 0)
			{
				if(minPosDist >  contactPairBA.distance)
				{
					minPosDist = contactPairBA.distance;
					minPosPairBA = contactPairBA;
				}
			}
			// Trace maximal negative pair
			else
			{
				if(maxNegDist < contactPairBA.distance)
				{
					maxNegDist = contactPairBA.distance;
					maxNegPairBA = contactPairBA;
				}
			}
		}
	}

	var result = new Array();
	if(minPosPairAB != null && minPosPairBA != null)
	{
		// if(minPosPairAB.distance == minPosPairBA.distance)
		if(Math.abs(minPosPairAB.distance - minPosPairBA.distance) < 1)
		{
			result.push(minPosPairAB);
			result.push(minPosPairBA.flip());
		}
		else if(minPosPairAB.distance < minPosPairBA.distance)
		{
			result.push(minPosPairAB);
		}
		else
		{
			result.push(minPosPairBA.flip());
		}

	}
	else if(minPosPairAB != null && minPosPairBA == null)
	{
		result.push(minPosPairAB);
	}
	else if(minPosPairAB == null && minPosPairBA != null)
	{
		result.push(minPosPairBA.flip());
	}
	else
	{
		// if(maxNegPairAB.distance == maxNegPairBA.distance)
		if(Math.abs(maxNegPairAB.distance - maxNegPairBA.distance) < 1)
		{
			result.push(maxNegPairAB);
			result.push(maxNegPairBA.flip());
		}
		else if(maxNegPairAB.distance > maxNegPairBA.distance)
		{
			result.push(maxNegPairAB);
		}
		else
		{
			result.push(maxNegPairBA.flip());
		}
	}
	return result;
}
 
function MinkowskiDiff3(polygonA, polygonB)
{
	var minPosDist = Number.MAX_VALUE;
	var maxNegDist = 0 - Number.MAX_VALUE;
	var minPosPairs = new Array();
	var maxNegPairs = new Array();

	// Edges from A, vertices from B:
	for(var i = 0; i < polygonA.edges.length; i++)
	{
		var curEdge = polygonA.edges[i];
		var supportVertices = findSupportVertices(curEdge.normal, polygonB.vertices);
		for(var j = 0; j < supportVertices.length; j++)
		{
			var supportVertex = supportVertices[j];
			var contactPairAB = new ContactPair(curEdge, supportVertex);

			// Trace min positive distance
			if(contactPairAB.distance >= 0)
			{
				if(minPosDist > contactPairAB.distance)
				{
					minPosDist = contactPairAB.distance;
					minPosPairs.length = 0;
					minPosPairs.push(contactPairAB);
				}
				else if(Math.abs(minPosDist - contactPairAB.distance) < FLOATING_ERROR)
				{
					minPosPairs.push(contactPairAB);
				}
			}
			// Trace max negative distance
			else
			{
				if(maxNegDist < contactPairAB.distance)
				{
					maxNegDist = contactPairAB.distance;
					maxNegPairs.length = 0;
					maxNegPairs.push(contactPairAB);
				}
				else if(Math.abs(maxNegDist - contactPairAB.distance) < FLOATING_ERROR)
				{
					maxNegPairs.push(contactPairAB);
				}
			}
		}
	}
	// Edges from B, vertices from A:
	for(var i = 0; i < polygonB.edges.length; i++)
	{
		var curEdge = polygonB.edges[i];
		var supportVertices = findSupportVertices(curEdge.normal, polygonA.vertices);
		for(var j = 0; j < supportVertices.length; j++)
		{
			var supportVertex = supportVertices[j];
			var contactPairBA = new ContactPair(curEdge, supportVertex);

			// Trace min positive distance
			if(contactPairBA.distance >= 0)
			{
				if(minPosDist > contactPairBA.distance)
				{
					minPosDist = contactPairBA.distance;
					minPosPairs.length = 0;
					minPosPairs.push(contactPairBA.flip());

				}
				else if(Math.abs(minPosDist - contactPairBA.distance) < FLOATING_ERROR)
				{
					minPosPairs.push(contactPairBA.flip());
				}
			}
			// Trace max negative distance
			else
			{
				if(maxNegDist < contactPairBA.distance)
				{
					maxNegDist = contactPairBA.distance;
					maxNegPairs.length = 0;
					maxNegPairs.push(contactPairBA.flip());
				}
				else if(Math.abs(maxNegDist - contactPairBA.distance) < FLOATING_ERROR)
				{
					maxNegPairs.push(contactPairBA.flip());
				}
			}
		}
	}
	if(minPosPairs.length != 0)
	{
		if(minPosPairs.length == 3) minPosPairs.length = 2;
		return minPosPairs;
	}
	else if(maxNegPairs.length != 0)
	{
		if(maxNegPairs.length == 3) maxNegPairs.length = 2;
		return maxNegPairs;
	}
	else
	{
		console.log("MINKOWSKI DIFF ERROR!");
	}
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

// Wanted output
// Contact(distance, distanceVector, polygonA, polygonB, pointOnA, pointOnB)