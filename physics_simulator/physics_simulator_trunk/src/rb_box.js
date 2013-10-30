function Edge(startPos, endPos)
{
	this.startPos = startPos;
	this.endPos = endPos;
	this.midPos = startPos.add(endPos).scalarDivide(2);
	this.vector = (endPos.minus(startPos)).normalize();
	this.normal = new Vector2D( this.vector.y, 0 - this.vector.x);
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
		for(var i = 0; i < this.vertices.length; i++)
		{
			var circleCenter = anotherRb.position;
			var startPos = this.vertices[i];
			var endPos = this.vertices[(i+1)%this.vertices.length];
 
			var edge = new Edge(startPos, endPos);
 
			var testVectA = circleCenter.minus(startPos);
			var testVectB = circleCenter.minus(endPos);
 
			var testVect;
			if(testVectA.squareMod() > testVectB.squareMod())
				testVect = testVectA;
			else
				testVect = testVectB;
 
			var dist = testVect.dotMultiply(edge.normal);
			if( dist> 0)
			{
				var distV = edge.normal.scalarMultiply(dist);
				// proj = test - n*(test dot n) = test - distV
				var projection = testVect.minus(distV);
 
				// If projection is on edge
				var edgeV = edge.endPos.minus(edge.startPos);
				if(projection.squareMod() < edgeV.squareMod())
				{
					distV.normalize();
					var contactPointA = circleCenter.add(distV.negate().scalarMultiply(dist));
					var contactPointB = circleCenter.add(distV.negate().scalarMultiply(anotherRb.radius));
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

	}

	return new Contact(new Vector2D(1, 0), 10, this, anotherRb, new Vector2D(0, 0), new Vector2D(1, 1));
}

Box.prototype.draw = function(ctx)
{
	ctx.beginPath();
	ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
	ctx.lineTo(this.vertices[1].x, this.vertices[1].y);
	ctx.lineTo(this.vertices[2].x, this.vertices[2].y);
	ctx.lineTo(this.vertices[3].x, this.vertices[3].y);
	ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
	ctx.fillStyle= this.color;
	ctx.fill();

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