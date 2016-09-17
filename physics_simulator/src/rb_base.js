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
function RigidBody(position, velocity, angVelo, invMass, color)
{
	this.position = position;
	this.velocity = velocity;
	this.angVelo = angVelo;
	this.invMass = invMass;
	this.invInertia = 0;
	this.color = color;

	this.oldVelocity = this.velocity;
}
RigidBody.prototype.TYPE_BASE = 0;
RigidBody.prototype.TYPE_CIRCLE = 1;
RigidBody.prototype.TYPE_PLANE = 2;
RigidBody.prototype.TYPE_BOX = 3;
RigidBody.prototype.TYPE_NUMBER = 4;

RigidBody.prototype.generateContact = function(anotherRb){}
RigidBody.prototype.translate = function(movement){}
RigidBody.prototype.rotate = function(angle){}
RigidBody.prototype.integrate = function(delta)
{
	// (v0 + v1)/2 integration to cope with constant acclerations like gravity
	var eulerVelocity = this.velocity.add(this.oldVelocity).scalarDivide(2);
	this.oldVelocity = this.velocity;

	// this.position.addSelf(eulerVelocity.scalarMulSelf(delta));
	this.translate(eulerVelocity.scalarMulSelf(delta));
	this.rotate(this.angVelo * delta);
}
RigidBody.prototype.draw = function(ctx){}
RigidBody.prototype.isClicked = function(pos, tolerance)
{
	// return 0 for not clicked
	// return 1 for click on edge
	// return 2 for click inside
}



