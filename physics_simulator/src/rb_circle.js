//
// Circle
//
function Circle(position, velocity, angVelo, invMass, color, radius)
{
	RigidBody.call(this, position, velocity, angVelo, invMass, color||"#6495ED");
	this.type = this.TYPE_CIRCLE;
	this.radius = radius;
	// j = 2mR^2/5
	this.invInertia = 5 * invMass / (2 * radius * radius);
	this.pointer = position.add(new Vector2D(radius, 0));
}
Circle.prototype = Object.create(RigidBody.prototype);
Circle.prototype.generateContact = function(anotherRb)
{
	var contact;
	if(anotherRb.type == this.TYPE_CIRCLE)
	{
		var contactNormal = this.position.minus(anotherRb.position);
		// Minimize sqrt if possible
		var mod = contactNormal.mod();
		var dist = mod - (this.radius + anotherRb.radius);
		// Normalize contactNormal
		contactNormal = contactNormal.scalarDivide(mod);
		var contactPA = this.position.minus(contactNormal.scalarMultiply(this.radius));	
		var contactPB = anotherRb.position.add(contactNormal.scalarMultiply(anotherRb.radius));

		contact = new Contact(contactNormal, dist, this, anotherRb, contactPA, contactPB);
	}
	else if(anotherRb.type == this.TYPE_PLANE)
	{
		// circle-plane contact's normal is the plane's normal
		var contactNormal = anotherRb.normal;
		var dist = this.position.dotMultiply(anotherRb.normal) + anotherRb.distanceToOrigin - this.radius;

		var contactPA = this.position.minus(contactNormal.scalarMultiply(this.radius));	
		var contactPB = this.position.minus(contactNormal.scalarMultiply(dist + this.radius));

		contact = new Contact(contactNormal, dist, this, anotherRb, contactPA, contactPB);
	}
	else if(anotherRb.type == this.TYPE_BOX)
	{
		contact = anotherRb.generateContact(this);
		// return new Contact(contact.normal.negate(), contact.distance, anotherRb, this, contact.contactPointB, contact.contactPointA);
		return contact.flip();
	}
	return contact;
}
Circle.prototype.translate = function(movement)
{
	this.position.addSelf(movement);
	this.pointer.addSelf(movement);
}
// Circle rotation is only relevant to the 'pointer'
Circle.prototype.rotate = function(angle)
{
	this.pointer.minusSelf(this.position);
	this.pointer.rotate(angle);
	this.pointer.addSelf(this.position);
}

Circle.prototype.draw = function(ctx)
{
	// Draw circle
	ctx.beginPath();
	ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
	ctx.fillStyle = this.color;
	ctx.fill();

	// Draw pointer
	ctx.beginPath();
	var begin = this.position.add(this.position.minus(this.pointer));
	ctx.moveTo(begin.x, begin.y);
	ctx.lineTo(this.pointer.x, this.pointer.y);
	var tmp = ctx.lineWidth;
	ctx.lineWidth = 8;
	ctx.strokeStyle = "#104E8B";
	ctx.stroke();
	ctx.lineWidth = tmp;
}

Circle.prototype.isClicked = function(pos, tolerance)
{
	var dist = (pos.minus(this.position).mod() - this.radius);
	if(dist > 0)
		return 0;
	else if(dist > 0 - tolerance)
	{
		console.log("rotate mode");
		return 1;
	}
	else
	{
		console.log("translate mode");
		return 2;
	}
}
