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
// Contact
//
function Contact(normal, distance)
{
	this.normal = normal;
	this.distance = distance;
}

//
// Base class for rigid bodies
//
function RigidBody(position, velocity, mass)
{
	this.position = position;
	this.velocity = velocity;
	this.invMass = 1/mass;
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
function Circle(position, velocity, mass, radius)
{
	this.radius = radius;
	this.type = "Circle";

	RigidBody.call(this, position, velocity, mass);
}
Circle.prototype = Object.create(RigidBody.prototype);

Circle.prototype.type = "Circle";
Circle.prototype.generateContact = function(anotherRb)
{

}

