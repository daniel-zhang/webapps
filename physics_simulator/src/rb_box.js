
function EdgeVerticesPair(edge, vertices)
{
	this.edge = edge;
	this.vertices = vertices;
	this.dist = this.getDist();
}
EdgeVerticesPair.prototype.debugDraw = function(color)
{
	var p = this.getProjectedPoint(this.vertices[0]);
	debugCtx.beginPath();
	debugCtx.moveTo(p.x, p.y);
	debugCtx.lineTo(this.vertices[0].x, this.vertices[0].y);
	var tmp = debugCtx.lineWidth;
	debugCtx.lineWidth = 2;
	debugCtx.strokeStyle = color;
	debugCtx.stroke();
	debugCtx.lineWidth = tmp;
}

EdgeVerticesPair.prototype.getDist = function()
{
	// Find non-zero test vertex
	var testVertex;
	for(var i = 0; i < this.vertices.length; i++)
	{
		if(this.vertices[i].equalZero() == false)
		{
			testVertex = this.vertices[i];
			break;
		}
	}
	var projectedPoint = this.getProjectedPoint(testVertex);
	var sign;
	if(testVertex.minus(this.edge.startPos).dotMultiply(this.edge.normal) > 0)
		sign = 1;
	else
		sign = -1;
	var dist = testVertex.minus(projectedPoint).mod() * sign;
	// var dist = testVertex.minus(projectedPoint).mod();
	return dist;

	// var distFromTestVertexToOrigin = testVertex.dotMultiply(this.edge.normal);
	// var distFromEdgeToOrigin = this.edge.dist();
	// return distFromEdgeToOrigin + distFromTestVertexToOrigin;
}
// If p's projection point p1 is on edge, return p1
// Else, return the closest edge vertex to p
EdgeVerticesPair.prototype.getProjectedPoint = function(p)
{
	var v1 = p.minus(this.edge.startPos);
	var v2 = p.minus(this.edge.endPos);
	var testVector;
	var testPos, testPos2;
	if(v1.squareMod() > v2.squareMod())
	{
		testVector = v1;
		testPos = this.edge.startPos;
		testPos2 = this.edge.endPos;
	}
	else
	{
		testVector = v2;
		testPos = this.edge.endPos;
		testPos2 = this.edge.startPos;
	}

	var dist = testVector.dotMultiply(this.edge.normal);
	var distVector = this.edge.normal.scalarMultiply(dist);
	var projVector = testVector.minus(distVector);

	var edgeSquareMod = this.edge.endPos.minus(this.edge.startPos).squareMod();
	if(edgeSquareMod > projVector.squareMod())
		return testPos.add(projVector);
	else
		return testPos2;
}

// Find support vertex/vertices for a given edge
function findSupportVertices(normal, vertices)
{
	var supportVertices = new Array();
	var minProj = Number.MAX_VALUE;

	for(var i = 0; i < vertices.length; i++)
	{
		var projection = normal.dotMultiply(vertices[i]);
		if(minProj > projection)
		{
			minProj = projection;
			supportVertices.length = 0;
			supportVertices.push(vertices[i]);
		}
		else if(minProj == projection)
		{
			supportVertices.push(vertices[i]);
			console.log("Parralle deteced!");
		}
	}
	return supportVertices;
}

// Find the Edge->Vertices pair with minimal distance
function findEdgeVerticesPair(edges, vertices)
{
	var targetPair = null;
	var targetPair2 = null;
	var minPositiveDist = Number.MAX_VALUE;
	var maxNegativeDist = 0 - Number.MAX_VALUE;
	for(var i = 0; i < edges.length; i++)
	{
		var supportVertices = findSupportVertices(edges[i].normal, vertices);
		var pair = new EdgeVerticesPair(edges[i], supportVertices);
		// Find minimal positive dist
		if(pair.dist > 0 && minPositiveDist > pair.dist)
		{
			minPositiveDist = pair.dist;
			targetPair = pair;
		}
		// Find maximal negative dist
		else if(pair.dist < 0 && maxNegativeDist < pair.dist)
		{
			maxNegativeDist = pair.dist;
			targetPair2 = pair;
		}
	}
	return [targetPair, targetPair2];
}

// Minkowski difference:
// For arbitrary two polygons A and B, return their closest points.
//
// Possible contacts configurations:
// vertex-vertex
// edge-vertex
// vertex-edge
// edge-edge
function VerticesPair(vertexOfA, vertexOfB, dist)
{
	this.vertexOfA = vertexOfA;
	this.vertexOfB = vertexOfB;
	this.dist = dist;
}
VerticesPair.prototype.draw = function()
{
	debugCtx.beginPath();
	debugCtx.arc(this.vertexOfA.x, this.vertexOfA.y, 5, 0, 2*Math.PI);
	debugCtx.fillStyle = "blue";
	debugCtx.fill();

	debugCtx.beginPath();
	debugCtx.arc(this.vertexOfB.x, this.vertexOfB.y, 5, 0, 2*Math.PI);
	debugCtx.fillStyle = "blue";
	debugCtx.fill();

	debugCtx.beginPath();
	debugCtx.moveTo(this.vertexOfA.x, this.vertexOfA.y);
	debugCtx.lineTo(this.vertexOfB.x, this.vertexOfB.y);
	debugCtx.strokeStyle = "black";
	debugCtx.stroke();
}
function findClosestPoints(polygonA, polygonB)
{
	var edgesOfA = polygonA.getEdges();
	var edgesOfB = polygonB.getEdges();

	var pairsAB = findEdgeVerticesPair(edgesOfA, polygonB.vertices);
	var pairsBA = findEdgeVerticesPair(edgesOfB, polygonA.vertices);

	// Find minimal positive pair
	var minimalPositivePair = null;
	if(pairsAB[0]!= null && pairsBA[0] != null)
		minimalPositivePair = pairsAB[0].dist < pairsBA[0].dist ? pairsAB[0] : pairsBA[0];
	else if(pairsBA[0] != null)
		minimalPositivePair = pairsBA[0];
	else if(pairsAB[0] != null)
		minimalPositivePair = pairsAB[0];

	// Find maximal negative pair
	var maximalNegativePair = null;
	if(pairsAB[1]!= null && pairsBA[1] != null)
		maximalNegativePair = pairsAB[1].dist > pairsBA[1].dist ? pairsAB[1] : pairsBA[1];
	else if(pairsAB[1] != null)
		maximalNegativePair = pairsAB[1];
	else if (pairsBA[1] != null)
		maximalNegativePair = pairsBA[1];

	if(minimalPositivePair != null)
	{
		minimalPositivePair.debugDraw("green");
	}
	else
	{
		maximalNegativePair.debugDraw("red");
	}

	var contactPairs = new Array();

	// // Edge-Vertex
	// if(pairAB.dist >= 0 && pairBA.dist >=0)
	// {
	// 	if(pairAB.dist < pairBA.dist)
	// 		contactPairs.push(new VerticesPair(pairAB.getProjectedPoint(pairAB.vertices[0]),  pairAB.vertices[0], pairAB.dist));
	// 	else
	// 		contactPairs.push(new VerticesPair(pairBA.getProjectedPoint(pairBA.vertices[0]),  pairBA.vertices[0], pairBA.dist));

	// 	return contactPairs;

	// }
	// else if(pairAB.dist >= 0)
	// {
	// 	contactPairs.push(new VerticesPair(pairAB.getProjectedPoint(pairAB.vertices[0]),  pairAB.vertices[0], pairAB.dist));
	// 	return contactPairs;
	// }
	// else if(pairBA.dist >= 0)
	// {
	// 	contactPairs.push(new VerticesPair(pairBA.getProjectedPoint(pairBA.vertices[0]),  pairBA.vertices[0], pairBA.dist));
	// 	return contactPairs;
	// }
	// if(pairAB.dist < pairBA.dist)
	// {
	// 	var contactPair = new VerticesPair(pairAB.getProjectedPoint(pairAB.vertices[0]), pairAB.vertices[0], pairAB.dist);
	// 	contactPairs.push(contactPair);
	// }
	// // Edge-Edge
	// else if(pairAB.dist == pairBA.dist)
	// {
	// 	var pointA1 = pairAB.getProjectedPoint(pairAB.vertices[0]);
	// 	var pointA2 = pairAB.getProjectedPoint(pairAB.vertices[1]);

	// 	var pointB1 = pairBA.getProjectedPoint(pairBA.vertices[0]);
	// 	var pointB2 = pairBA.getProjectedPoint(pairBA.vertices[1]);

	// 	contactPairs.push( new VerticesPair(pointA2, pointB1, pairAB.dist));
	// 	contactPairs.push( new VerticesPair(pointA1, pointB2, pairBA.dist));
	// }
	// // Vertex-Edge
	// else
	// {
	// 	var contactPair = new VerticesPair(pairBA.getProjectedPoint(pairBA.vertices[0]), pairBA.vertices[0], pairBA.dist);
	// 	contactPairs.push(contactPair);
	// }
	return contactPairs;
}

// Generate an edge from two vertices
function Edge(startPos, endPos)
{
	this.startPos = startPos;
	this.endPos = endPos;
	this.midPos = startPos.add(endPos).scalarDivide(2);
	this.vector = (endPos.minus(startPos)).normalize();
	this.normal = new Vector2D( this.vector.y, 0 - this.vector.x);
}
Edge.prototype.dist = function()
{
	var testVertex;
	if(this.startPos.equalZero())
		testVertex = this.endPos;
	else
		testVertex = this.startPos;

	var testVector = testVertex.duplicate().negate();
	return testVector.dotMultiply(this.normal);
}

function Box(position, velocity, angVelo, invMass, color, halfWidth, halfHeight, rotation)
{

	RigidBody.call(this, position, velocity, angVelo, invMass, color || "#A52A2A");
	this.type = this.TYPE_BOX;
	this.vertices = new Array();
	this.invInertia = 6 * invMass / (halfWidth * halfHeight);

	// Build
	var halfV0 = new Vector2D(0 - halfWidth, 0 - halfHeight);
	var halfV1 = new Vector2D(halfWidth, 0 - halfHeight);
	var halfV2 = new Vector2D(halfWidth, halfHeight);
	var halfV3 = new Vector2D(0 - halfWidth, halfHeight);
	halfV0.rotate(rotation);
	halfV1.rotate(rotation);
	halfV2.rotate(rotation);
	halfV3.rotate(rotation);

	this.vertices.push(position.add(halfV0));
	this.vertices.push(position.add(halfV1));
	this.vertices.push(position.add(halfV2));
	this.vertices.push(position.add(halfV3));
	// this.rotate(rotation);
}
Box.prototype = Object.create(RigidBody.prototype);

Box.prototype.getEdges = function()
{
	var numOfVertices = this.vertices.length;
	var edges = new Array();
	for(var i = 0; i < numOfVertices; i++)
	{
		var start = this.vertices[i];
		var end = this.vertices[(i + 1) % numOfVertices];

		edges.push(new Edge(start, end));
	}
	return edges;
}

Box.prototype.translate = function(movement)
{
	this.position.addSelf(movement);
	for(var i = 0; i < this.vertices.length; ++i)
	{
		this.vertices[i].addSelf(movement);
	}
}

Box.prototype.rotate = function(angle)
{
	for(var i = 0; i < this.vertices.length; ++i)
	{
		this.vertices[i].minusSelf(this.position);
		this.vertices[i].rotate(angle);
		this.vertices[i].addSelf(this.position);
	}
}

Box.prototype.generateContact = function(anotherRb)
{
	// function Contact(normal, distance, rbA, rbB, contactPointA, contactPointB)
	var contact;
	if(anotherRb.type == this.TYPE_CIRCLE)
	{
		var edges = this.getEdges();
		for(var i = 0; i < edges.length; i++)
		{
			var edge = edges[i];

			var circleCenter = anotherRb.position;
			var testVectA = circleCenter.minus(edge.startPos);
			var testVectB = circleCenter.minus(edge.endPos);
 
			var testVect;
			if(testVectA.squareMod() > testVectB.squareMod())
				testVect = testVectA;
			else
				testVect = testVectB;
 
			var dist = testVect.dotMultiply(edge.normal);
			if( dist >= 0)
			{
				var distV = edge.normal.scalarMultiply(dist);
				// proj = test - n*(test dot n) = test - distV
				var projection = testVect.minus(distV);
 
				// If projection is on edge
				var edgeV = edge.endPos.minus(edge.startPos);
				if(projection.squareMod() < edgeV.squareMod())
				{
					distV.normalize();
					// var contactPointA = circleCenter.add(distV.negate().scalarMultiply(dist));
					// var contactPointB = circleCenter.add(distV.negate().scalarMultiply(anotherRb.radius));
					var contactPointA = circleCenter.minus(edge.normal.scalarMultiply(dist));
					var contactPointB = circleCenter.minus(edge.normal.scalarMultiply(anotherRb.radius));
					contact = new Contact(edge.normal.negate(), dist - anotherRb.radius, this, anotherRb, contactPointA, contactPointB);
					return contact;
				}
			}
		}
		// Circle center projection is not on any edge, so find the closest vertex.
		var miniSquareDist = Number.MAX_VALUE;
		var targetVertex = null;
		for(var i = 0; i < this.vertices.length; i++)
		{
			var testVect = anotherRb.position.minus(this.vertices[i]); 
			var squareDist = testVect.squareMod();
			if(miniSquareDist > squareDist)
			{
				miniSquareDist =  squareDist;
				targetVertex =  this.vertices[i];
			}
		}
		if(targetVertex != null)
		{
			var contactPointA = targetVertex;
			var distVector = anotherRb.position.minus(targetVertex);
			var dist = distVector.mod() - anotherRb.radius;
			var contactPointB = anotherRb.position.add(distVector.normalize().negate().scalarMultiply(anotherRb.radius));
			return new Contact(distVector, dist, this, anotherRb, contactPointA, contactPointB);
		}
	}

	else if (anotherRb.type == this.TYPE_BOX)
	{
		var contactGroups = new Array();
		var contactPoints = findClosestPoints(this, anotherRb);
		// for(var i = 0; i < contactPoints.length; i++)
		// {
		// 	var cp = contactPoints[i];
		// 	cp.draw();
		// 	// var distVector = cp.vertexOfB.minus(cp.vertexOfA);
		// 	// contactGroups.push(new Contact(distVector.normalize().negate(), cp.dist, this, anotherRb, cp.vertexOfA, cp.vertexOfB ));
		// }
		var p1 = this.vertices[0];
		var p2 = anotherRb.vertices[0];
		var normal = new Vector2D(0, 1);
		var dist = p1.y - p2.y;
		dist = dist > 0 ? dist : 0 - dist;
		var contact = new Contact(normal, dist, this, anotherRb, p1, p2);
		return contact;
	}
}

Box.prototype.draw = function(ctx)
{
	ctx.beginPath();
	ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
	ctx.lineTo(this.vertices[1].x, this.vertices[1].y);
	ctx.lineTo(this.vertices[2].x, this.vertices[2].y);
	ctx.lineTo(this.vertices[3].x, this.vertices[3].y);
	ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
	// ctx.fillStyle= this.color;
	// ctx.fill();
	ctx.strokeStyle = this.color;
	ctx.stroke();

	// Draw normal
	for( var i = 0; i < this.vertices.length; i++)
	{
		var startPos = this.vertices[i];
		var endPos = this.vertices[(i+1)%this.vertices.length];
		var edge = new Edge(startPos, endPos);
		var normalVisualStart = edge.midPos;
		var normalVisualEnd = edge.midPos.add(edge.normal.scalarMultiply(20));
 
		ctx.beginPath();
		ctx.moveTo(normalVisualStart.x, normalVisualStart.y);
		ctx.lineTo(normalVisualEnd.x, normalVisualEnd.y);
		ctx.strokeStyle= "black";
		ctx.stroke();
	}
}

// Given two objects, find their closest points
function findClosestPoints1(polygonA, polygonB)
{

}