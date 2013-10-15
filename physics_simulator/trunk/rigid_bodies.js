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
		var contactNormal = this.position.minus(anotherRb.position);
		// Minimize sqrt if possible
		var mod = contactNormal.mod();
		var dist = mod - (this.radius + anotherRb.radius);
		// Normalize contactNormal
		contactNormal = contactNormal.scalarDivide(mod);

		contact = new Contact(contactNormal, dist, this, anotherRb);
	}
	else if(anotherRb.type == "Plane")
	{
		// circle-plane contact's normal is the plane's normal
		var contactNormal = anotherRb.normal;
		var dist = this.position.dotMultiply(anotherRb.normal) + anotherRb.distanceToOrigin - this.radius;

		contact = new Contact(contactNormal, dist, this, anotherRb);
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
		// Because this.vector is normalized, so is this.normal
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
	var contact;
	if(anotherRb.type == "Circle")
	{
		var dist = anotherRb.position.dotMultiply(this.normal) + this.distanceToOrigin - anotherRb.radius;
		// plane-circle contact's normal is the plane's normal*(-1)
		var contactNormal = this.normal.scalarMultiply(-1);
		contact = new Contact(contactNormal, dist, this, anotherRb);
	}
	else if(anotherRb.type == "Plane")
	{
		//TODO: add plane-plane-contact
	}
	else
	{
		//TODO: throw exception here
	}
	return contact;
}

//
// Contact
//
function Contact(normal, distance, rbA, rbB)
{
	this.normal = normal;
	this.distance = distance;
	this.rbA = rbA;
	this.rbB = rbB;
}

//
// PhysicsEngine
//
function PhysicsEngine()
{
	// For html canvas, axis y is facing "downward".
	this.gravity = 0.0002;
	this.restitution = 0.9;

	this.rigidBodies = new Array();
	this.contacts = new Array();

	this.populate = function()
	{

	}

	this.update = function()
	{
		// Apply gravity

		// Collision detection
		// Empty old contacts
		this.contacts.length = 0;
		for(var i = 0; i < this.rigidBodies.length - 1; i++)
		{
			for(var j = i + 1; j < this.rigidBodies.length; j++)
			{
				// Do not detect collision between two invMass==0 rbs, i.e. two planes.
				if( this.rigidBodies[i].invMass > 0 || this.rigidBodies[j].invMass > 0)
				{
					this.contacts.push(this.rigidBodies[i].generateContact(this.rigidBodies[j]));
				}
			}
		}

		// Solve contacts
		for(var i = 0; i < this.contacts.length; i++)
		{
			var contact = this.contacts[i];
			if(contact.distance <= 0)
			{
				var rbA = contact.rbA;
				var rbB = contact.rbB;
				// Keep it consistant with contact normal direction: relative velocity is always A.v - B.v
				var relV = rbA.velocity.minus(rbB.velocity);

				if(relV.dotMultiply(contact.normal) < 0)
				{
					// impluse = (1+e)*(Vr_dot_N)*N
					var impulse = contact.normal.scalarMultiply( (1 + this.restitution) * relV.dotMultiply(contact.normal) / (rbA.invMass + rbB.invMass) );
					rbA.velocity = rbA.velocity.minus(impulse.scalarMultiply(rbA.invMass));
					rbB.velocity = rbB.velocity.add(impulse.scalarMultiply(rbB.invMass));
				}
			}
		}

		// TODO: constraint solver

		// Integration...implicit euler integration


	}
}