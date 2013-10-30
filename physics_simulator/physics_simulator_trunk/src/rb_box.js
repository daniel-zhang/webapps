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
}