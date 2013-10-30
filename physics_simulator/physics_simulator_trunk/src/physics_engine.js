//
// Contact
//
function Contact(normal, distance, rbA, rbB, contactPointA, contactPointB)
{
	this.normal = normal || null;
	this.distance = distance || null;
	this.rbA = rbA || null;
	this.rbB = rbB || null;
	this.contactPointA = contactPointA || null;
	this.contactPointB = contactPointB || null;
}

//
// Obj creator
//
function createObjs(rbContainer)
{
	// function Plane(position, velocity, angVelo, invMass, color, startPos, endPos)
	rbContainer.push(new Plane(new Vector2D(0, 0), new Vector2D(0, 0), 0, 0, "#8B8378", new Vector2D(100, 450), new Vector2D(100, 100) ));
	rbContainer.push(new Plane(new Vector2D(0, 0), new Vector2D(0, 0), 0, 0, "#8B8378", new Vector2D(600, 500), new Vector2D(100, 450) ));
	rbContainer.push(new Plane(new Vector2D(0, 0), new Vector2D(0, 0), 0, 0, "#8B8378", new Vector2D(1200, 100), new Vector2D(600, 500) ));

	// function Box(position, velocity, angVelo, invMass, color, halfWidth, halfHeight, rotation)
	rbContainer.push(new Box(new Vector2D(300, 300), new Vector2D(0, 0), 0, 0, "#A52A2A", 50, 70, 0));

	for(var i = 0; i < 10; i++)
	{
		var posX = 150 + i * 80;
		var posY1 = 150 + i * 10;
		var posY2 = posY1 - 50;
		var posY3 = posY2 - 50;
		// function Circle(position, velocity, angVelo, invMass, color, radius)
		rbContainer.push(new Circle(new Vector2D(posX, posY1), new Vector2D(0.0, 0.0), 0, 1/4   , "#6495ED", 20));
		rbContainer.push(new Circle(new Vector2D(posX, posY2), new Vector2D(0.0, 0.0), 0, 1/2.25, "#6495ED", 15));
		rbContainer.push(new Circle(new Vector2D(posX, posY3), new Vector2D(0.0, 0.0), 0, 1/6.25, "#6495ED", 25));
	}
}

//
// PhysicsEngine
//
function PhysicsEngine()
{
	// For html canvas, axis y is facing "downward".
	this.gravity = new Vector2D(0, 0.01);
	this.restitution = 0.8;

	this.rigidBodies = new Array();
	this.contacts = new Array();

	this.populate = function()
	{
		createObjs(this.rigidBodies);
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
		
		for(var iter = 0; iter < 5; iter++)
		{
			for(var i = 0; i < this.contacts.length; i++)
			{
				var contact = this.contacts[i];
				var rbA = contact.rbA;
				var rbB = contact.rbB;
				// Keep it consistant with contact normal direction: relative velocity is always A.v - B.v
				var relV = rbA.velocity.minus(rbB.velocity);

				// Speculative solver from Paul Firth
				var remove = relV.dotMultiply(contact.normal) + contact.distance/delta;
				if(remove < 0)
				{
					// Note, this impulse is a scalar
					var impulse = remove / (rbA.invMass + rbB.invMass);

					rbA.velocity.minusSelf(contact.normal.scalarMultiply(impulse * rbA.invMass));
					rbB.velocity.addSelf(contact.normal.scalarMultiply(impulse * rbB.invMass));
				}

				/*
				// Discrete sovler
				if(contact.distance <= 0)
				{
					if(relV.dotMultiply(contact.normal) < 0)
					{
						// impluse = (1+e)*(Vr_dot_N)*N
						var impulse = contact.normal.scalarMultiply( (1 + this.restitution) * relV.dotMultiply(contact.normal) / (rbA.invMass + rbB.invMass) );
						rbA.velocity = rbA.velocity.minus(impulse.scalarMultiply(rbA.invMass));
						rbB.velocity = rbB.velocity.add(impulse.scalarMultiply(rbB.invMass));
					}
				}*/
			}
		}

		// TODO: constraint solver

		// Integration...implicit euler integration
		for(var i = 0; i < this.rigidBodies.length; i++)
		{
			this.rigidBodies[i].integrate(delta);
		}

	}
}