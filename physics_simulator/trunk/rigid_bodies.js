// Use this to achieve inheritance in javascript...
// Fallback to customized implementation if less than ES5
if(Object.create === "undefined")
{
	console.log("Fallback to customized implementation of Object.create.");
	Object.create = function(o)
  	{
    	function dummy(){}
    	dummy.prototype = o;
    	return new dummy();
  	}
}
else
	console.log("Object.create is supported.");

//
// Base class for rigid bodies
//
function RigidBody(position, velocity, invMass)
{
	this.position = position;
	this.velocity = velocity;
	this.invMass = invMass;
}

RigidBody.prototype.type = "RigidBody";

// A virtual method
RigidBody.prototype.generateContact = function(anotherRb){}

RigidBody.prototype.integrate = function(delta)
{
	this.position = this.position.add(this.velocity.scalarMultiply(delta));
}

//
// Circle
//
function Circle(position, velocity, invMass, radius)
{
	this.radius = radius;
	this.type = "Circle";
	RigidBody.call(this, position, velocity, invMass);
}
Circle.prototype = Object.create(RigidBody.prototype);
Circle.prototype.generateContact = function(anotherRb)
{
	var contact;
	if(anotherRb.type == "Circle")
	{
		var relNormal = this.position.minus(anotherRb.position);
		var dist = relNormal.mod() - (this.radius + anotherRb.radius);
		contact = new Contact(relNormal, dist);
	}
	else if(anotherRb.type == "Plane")
	{

	}
	else
	{
		// TODO: throw exception here
	}
	return contact;
}

//
// Plane-2D
//
function Plane(position, velocity, invMass, startPos, endPos)
{
	this.startPos = startPos;
	this.endPos = endPos;
	this.type = "Plane";
	RigidBody.call(this, position, velocity, invMass);

	// Vector from startPos to endPos
	this.vector = new Vector2D(0, 0);
	this.normal = new Vector2D(0, 0);
	this.distanceToOrigin;

	this.updateSelf = function()
	{
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
		// normal is already normalized
	}
	this.calculateDistanceToOrigin = function()
	{
		var testVector;
		if(this.startPos.equalOrigin() == false)
			testVector = new Vector2D(this.startPos.x, this.startPos.y);
		else if(this.endPos.equalOrigin() == false)
			testVector = new Vector2D(this.endPos.x, this.endPos.y);
		else
			console.log("Invalid plane definition");

		this.distanceToOrigin = 0 - testVector.dotMultiply(this.normal);
	}
	this.updateSelf();
}
Plane.prototype = Object.create(RigidBody.prototype);
Plane.prototype.generateContact = function(anotherRb)
{

}

//
// Contact
//
function Contact(normal, distance)
{
	this.normal = normal;
	this.distance = distance;
}

//
// PhysicsEngine
//
function PhysicsEngine()
{
	this.objQueue = new Array();
	this.init = function()
	{

	}

	this.update = function()
	{

	}
}