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

	this.oldVelocity = velocity;
}
RigidBody.prototype.TYPE_BASE = 0;
RigidBody.prototype.TYPE_CIRCLE = 1;
RigidBody.prototype.TYPE_PLANE = 2;
RigidBody.prototype.TYPE_NUMBER = 3;

RigidBody.prototype.generateContact = function(anotherRb){}
RigidBody.prototype.integrate2 = function(delta)
{
	this.position.addSelf(this.velocity.scalarMultiply(delta));
}
RigidBody.prototype.integrate = function(delta)
{
	var eulerVelocity = this.velocity.add(this.oldVelocity).scalarDivide(2);
	this.position.addSelf(eulerVelocity.scalarMulSelf(delta));
	this.oldVelocity = this.velocity;
}

//
// Circle
//
function Circle(position, velocity, invMass, radius)
{
	this.radius = radius;
	this.type = this.TYPE_CIRCLE;
	RigidBody.call(this, position, velocity, invMass);
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

		contact = new Contact(contactNormal, dist, this, anotherRb);
	}
	else if(anotherRb.type == this.TYPE_PLANE)
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
	this.type = this.TYPE_PLANE;
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
		contact = new Contact(contactNormal, dist, this, anotherRb);
	}
	else if(anotherRb.type == this.TYPE_PLANE)
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
	this.gravity = new Vector2D(0, 0.0012);
	this.restitution = 0.8;

	this.rigidBodies = new Array();
	this.contacts = new Array();

	this.populate = function()
	{
		this.rigidBodies.push(new Plane(new Vector2D(0, 0), new Vector2D(0, 0), 0, new Vector2D(100, 450), new Vector2D(100, 100) ));
		this.rigidBodies.push(new Plane(new Vector2D(0, 0), new Vector2D(0, 0), 0, new Vector2D(600, 500), new Vector2D(100, 450) ));
		this.rigidBodies.push(new Plane(new Vector2D(0, 0), new Vector2D(0, 0), 0, new Vector2D(1200, 100), new Vector2D(600, 500) ));
		this.rigidBodies.push(new Circle(new Vector2D(150, 150), new Vector2D(0.6, 0.0), 1/10, 15));
		this.rigidBodies.push(new Circle(new Vector2D(250, 150), new Vector2D(0.0, 0.0), 1/10, 25));
		this.rigidBodies.push(new Circle(new Vector2D(350, 150), new Vector2D(0.0, 0.0), 1/10, 35));
		this.rigidBodies.push(new Circle(new Vector2D(450, 150), new Vector2D(0.0, 0.0), 1/10, 5));
		this.rigidBodies.push(new Circle(new Vector2D(550, 150), new Vector2D(0.0, 0.0), 1/10, 10));
	}

	this.update = function(delta)
	{
		// Apply gravity
		for(var i = 0; i < this.rigidBodies.length; i++)
		{
			if(this.rigidBodies[i].invMass > 0)
			{
				this.rigidBodies[i].velocity.addSelf(this.gravity.scalarMultiply(delta));
			}
		}

		// Empty contacts from previous frame
		// TODO: cache contacts to save cpu circles...
		this.contacts.length = 0;

		// Collision detection
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
		for(var iter = 0; iter < 30; iter++)
		{
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
		}

		// TODO: constraint solver

		// Integration...implicit euler integration
		for(var i = 0; i < this.rigidBodies.length; i++)
		{
			if(this.rigidBodies[i].invMass > 0)
				this.rigidBodies[i].integrate(delta);
		}

	}
}