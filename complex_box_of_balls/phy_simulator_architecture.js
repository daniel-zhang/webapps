var Point = function(x, y)
{
	this.x = x;
	this.y = y;
}

var Vector2D = function(x, y)
{
	// Unpack parameters and set default values.
	this.x = x;
	this.y = y;

	this.add = function(that){}
	this.minus = function(that){}
	this.dotMul = function(that){}
	this.scalarMul = function(that){}
	this.mod = function(){}
	this.normalize = function(){}
	this.equal = function(that){}
}

/*
Base class for rigid bodies
*/
var RigidBody = function(position, velocity, mass)
{
	this.position = position;
	this.velocity = velocity;
	this.invMass = 1/mass;
}

RigidBody.prototype.generateContact = function(anotherRb)
{

}

RigidBody.prototype.integrate = function(delta)
{
	this.position = this.position.add(this.velocity.scalarMul(delta));
}


var Circle = function(position, velocity, mass, radius)
{
	this.radius = radius;
	this.generateContact = function(antoherRb)
	{

	}
}


var Plane = function(position, velocity, mass, noraml, distanceToOrigin)
{
	this.noraml = noraml;
	this.distanceToOrigin = distanceToOrigin;
	this.generateContact = function(anotherRb)
	{

	}
}

var Contact = function(normal, distance)
{
	this.normal = normal;
	this.distance = distance;
}

function update()
{
	for(var i = 0; i < rigidBodies.length; i++)
	{
		if(rigidBodies[i].invMass > 0)
			// Apply gravity	
	}

	for(var i = 0; i < rigidBodies.length; i++)
	{
		for(var j = 0; j < rigidBodies.length; j++)
		{
			var contact = rigidBodies[i].generateContact(rigidBodies[j]);
			// Solve contact
		}
	}
	
	for(var i = 0; i < rigidBodies.length; i++)
		rigidBodies[i].integrate();

}