function Viewport(width, height, bgColor)
{
	this.width = width;
	this.height = height;
	this.bgColor = bgColor;
}

function Position(x, y)
{
	this.x = x;
	this.y = y;
}

function Velocity(vx, vy)
{
	this.vx = vx;
	this.vy = vy;
}


function Ball(position, radius, velocity, color)
{
	this.position = position;
	this.radius = radius;
	this.velocity = velocity;
	this.color = color;

	this.updateAgainstBoundary = function(delta, viewport)
	{
		//update velocity according to boundary
		if(this.position.x + this.radius >= viewport.width && this.velocity.vx > 0)
			this.velocity.vx = 0 - this.velocity.vx;

		if(this.position.x - this.radius < 0 && this.velocity.vx < 0)
			this.velocity.vx = 0 - this.velocity.vx;

		if(this.position.y + this.radius > viewport.height && this.velocity.vy > 0)
			this.velocity.vy = 0 - this.velocity.vy;
		
		if(this.position.y - this.radius < 0 && this.velocity.vy < 0)
			this.velocity.vy = 0 - this.velocity.vy;


		//update postion
		if(delta > 0)
		{
			this.position.x += (this.velocity.vx * delta);
			this.position.y += (this.velocity.vy * delta);	
		}

		/*console.log(
			" Ball pos: x=" + this.position.x + " y=" + this.position.y +
			" Delta:" + delta + 
			" Velocity: vx=" + this.velocity.vx + " vy=" + this.velocity.vy +
			" Viewport: width=" + viewport.width + " height=" + viewport.height
			);
		*/
	}

	this.collide = function(anotherBall)
	{


	}
}


