//
// Plane-2D
//
function Plane(position, velocity, angVelo, invMass, color, startPos, endPos)
{
	RigidBody.call(this, position, velocity, angVelo, invMass, color || "#8B8378");
	this.type = this.TYPE_PLANE;

	this.startPos = startPos;
	this.endPos = endPos;

	this.normalColor = "#458B74";

	// Vector from startPos to endPos
	this.vector = new Vector2D(0, 0);
	this.normal = new Vector2D(0, 0);
	this.distanceToOrigin;

	this.updateSelf = function()
	{
		this.position = startPos.add(endPos).scalarMultiply(0.5);
		this.calculateVector();
		this.calculateNormal();
		this.calculateDistanceToOrigin();
	}
	this.calculateVector = function()
	{
		this.vector.x = this.endPos.x - this.startPos.x;
		this.vector.y = this.endPos.y - this.startPos.y;
		this.vector.normalize();
	}
	this.calculateNormal = function()
	{
		this.normal.x = 0 - this.vector.y;
		this.normal.y = this.vector.x;
	}
	this.calculateDistanceToOrigin = function()
	{
		var testVector;
		var zero = new Vector2D(0, 0);
		if(this.startPos.equal(zero) == false)
			testVector = this.startPos;
		else if(this.endPos.equal(zero) == false)
			testVector = this.endPos;
		else
			console.log("Invalid plane definition");

		this.distanceToOrigin = 0 - testVector.dotMultiply(this.normal);
	}
	this.updateSelf();
}
Plane.prototype = Object.create(RigidBody.prototype);
Plane.prototype.generateContact = function(anotherRb)
{
	var contact;
	if(anotherRb.type == this.TYPE_CIRCLE)
	{
		var dist = anotherRb.position.dotMultiply(this.normal) + this.distanceToOrigin - anotherRb.radius;
		// plane-circle contact's normal is the plane's normal*(-1)
		var contactNormal = this.normal.scalarMultiply(-1);
		var contactPA = anotherRb.position.add(contactNormal.scalarMultiply(dist + anotherRb.radius));
		var contactPB = anotherRb.position.add(contactNormal.scalarMultiply(anotherRb.radius));
		contact = new Contact(contactNormal, dist, this, anotherRb, contactPA, contactPB);
	}
	else if(anotherRb.type == this.TYPE_PLANE)
	{
		//TODO: add plane-plane-contact
		contact = new Contact();
	}
	else
	{
		//TODO: throw exception here
		contact = new Contact();
	}
	return contact;
}
Plane.prototype.translate = function(movement)
{
	this.startPos.addSelf(movement);
	this.endPos.addSelf(movement);
	this.updateSelf();
}
Plane.prototype.rotate = function(angle)
{
	this.startPos.minusSelf(this.position);
	this.endPos.minusSelf(this.position);

	this.startPos.rotate(angle);
	this.endPos.rotate(angle);

	this.startPos.addSelf(this.position);
	this.endPos.addSelf(this.position);
}
Plane.prototype.draw = function(ctx)
{
	ctx.beginPath();
	ctx.moveTo(this.startPos.x, this.startPos.y);	
	ctx.lineTo(this.endPos.x, this.endPos.y);
	ctx.strokeStyle = this.color;
	ctx.stroke();

	// Draw plane normal
	ctx.beginPath();
	var midPoint = this.startPos.add(this.endPos).scalarDivide(2);
	var normalLen = 50;
	ctx.moveTo(midPoint.x, midPoint.y);
	ctx.lineTo(midPoint.x + normalLen * this.normal.x, midPoint.y + normalLen * this.normal.y);
	ctx.strokeStyle = this.normalColor;
	ctx.stroke();
}
