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
	this.equal = function(that)
	{
		if(this.x == that.x && this.y == that.y)
			return true;
		else
			return false;
	}
	this.distance = function(that)
	{
		var deltaX = (this.x - that.x) * (this.x - that.x);
		var deltaY = (this.y - that.y) * (this.y - that.y);
		return Math.sqrt(deltaY + deltaX);
	}
}

function Vector2D(x, y)
{
	this.x = x;
	this.y = y;

	//
	// Vector operations
	//
	this.add = function(that)
	{
		return new Vector2D(this.x + that.x, this.y + that.y);
	}
	
	// A.minus(B) is equivalent to A - B
	this.minus = function(that)
	{
		return new Vector2D(this.x - that.x, this.y - that.y);
	}

	this.scalarMultiply = function(scalar)
	{
		return new Vector2D(this.x * scalar, this.y * scalar);
	}

	this.scalarDivide = function(scalar)
	{
		return new Vector2D(this.x / scalar, this.y / scalar);
	}

	this.dotMultiply = function(that)
	{
		return	this.x*that.x + this.y* that.y;
	}

	// Used to determin normal direction of a 'plane', so it's actually a simplified version of cross muliplication.
	// Right-handed.
	// Usage: 
	// var z = line.vector.crossMultiply(line.normal)
	// if z>0, normal is okay
	// else, flip normal
	this.crossMultiply = function(that)
	{
		return this.x * that.y - this.y * that.x;
	}

	this.mod = function()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	this.normalize = function()
	{
		var mod = this.mod();
		this.x = this.x / mod;
		this.y = this.y / mod;
	}
}

function Line(startPos, endPos)
{
	this.startPos = startPos;
	this.endPos = endPos;

	this.vector = new Vector2D((this.endPos.x - this.startPos.x), (this.endPos.y - this.startPos.y) );

	this.normal = new Vector2D(0, 0);
	this.calculateNormal = function()
	{
		// vector * normal = 0
		// => v.x*n.x + v.y*n.y = 0
		// => n.x = v.y, n.y = -v.x
		this.normal.x = 0 - this.vector.y;
		this.normal.y = this.vector.x;
		// Note: this step loses too much precision
		this.normal.normalize();	

		// Correct normal direction
		if(this.vector.crossMultiply(this.normal) < 0)
			this.normal = this.normal.scalarMultiply(-1);
	}
	this.calculateNormal();

	// Use vector formulation to calculate distance from point to line
	// Wiki page:
	// http://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
	// distance from p to x=a+tv is:
	// ||(a-p) - (a-p)_dot_v*v||
	this.distanceToOrigin = function()
	{
		var testVector;
		if(this.startPos.equal(0, 0) == false)
			testVector = new Vector2D(this.startPos.x, this.startPos.y);
		else
			testVector = new Vector2D(this.endPos.x, this.endPos.y);

		this.vector.normalize();
		var distVector = testVector.minus(this.vector.scalarMultiply(this.vector.dotMultiply(testVector)));

		if(distVector.dotMultiply(this.normal) > 0)
			return 0 - distVector.mod();
		else
			return distVector.mod();
	}
	this.d = this.distanceToOrigin();

	// Where normal is drawn
	this.getMidPoint = function()
	{
		return new Position( (this.startPos.x + this.endPos.x)/2,  (this.startPos.y + this.endPos.y)/2 );
	}
	
	this.translate = function(vector_2d)
	{

	}

	this.rotate = function()
	{

	}

	this.drawSelf = function(ctx, color, displayNormal)
	{
		// Draw line
		ctx.beginPath();
		ctx.arc(this.startPos.x, this.startPos.y, 3, 0, 2*Math.PI);
		ctx.moveTo(this.startPos.x, this.startPos.y);
		ctx.lineTo(this.endPos.x, this.endPos.y);
		ctx.strokeStyle = color;
		ctx.stroke();

		// Draw normal if needed
		if(displayNormal)
		{
			ctx.beginPath();
			ctx.strokeStyle = "red";
			ctx.moveTo(this.getMidPoint().x, this.getMidPoint().y);
			var normalLen = 50;
			ctx.lineTo(this.getMidPoint().x + normalLen * this.normal.x, this.getMidPoint().y + normalLen * this.normal.y);
			ctx.stroke();

			/*
			ctx.beginPath()
			ctx.fillStyle = "blue";
			ctx.fillText("d:"+this.d, this.getMidPoint().x, this.getMidPoint().y);
			*/
		}
	}
}

// A shape is consisted of planes
function Shape()
{
	this.points = new Array();
	this.lines = new Array();

	// Construction method 1: add points then connect them.
	this.addPoint = function(x, y)
	{
		this.points.push(new Position(x, y));
	}

	this.connectPoints = function()
	{
		var len = this.points.length;
		if(len <= 1) 
		{
			console.log("Shape has less than 2 points: " + len);
			return;
		}

		var previous = this.points[0];

		for(var i = 1; i < len; i++)
		{
			if(previous.equal(this.points[i]))
				break;

			this.addLine(previous.x, previous.y, this.points[i].x, this.points[i].y);
			previous = this.points[i];
		}
	}

	// Connect arbitrary points into a meaningful shape
	this.connectPointsToShape = function()
	{
		var len = this.points.length;
		if(len <= 1)
		{
			console.log("Shape has less than 2 points: " + len);
			return;
		}

		// Connect points[0] and its nearest neighbour as the first line
		var minD = null;
		var index;
		// Find the nearest neighbour
		for (var i = 1; i < len; i++)
		{
			if(minD == null)
			{
				minD = this.points[0].distance(this.points[i]);
				index = i;
			}
			else
			{
				var curD = this.points[0].distance(this.points[i]);
				if(curD < minD)
				{
					minD = curD;
					index = i;
				}
			}
		}

		console.log("nearest index:" + index);

		// Add the first line
		var line = new Line( this.points[0], this.points[index]);
		this.lines.push(line);

		// Now save the first point and remove it from this.points
		var firstPoint = this.points[0];
		this.points.splice(0, 1);
		index -= 1;

		// Examine the remaining points
		while(this.points.length > 1)
		{
			var min = null;
			var max = null;
			var minIndex = null;
			var maxIndex = null;

			for(var i  = 0; i < this.points.length; i++)
			{
				if( i != index)
				{
					var tryLine = new Line(this.points[index], this.points[i]);	
					// 0-PI
					if(line.normal.crossMultiply(tryLine.normal) > 0)
					{
						if(max == null)
						{
							max = line.normal.dotMultiply(tryLine.normal);
							maxIndex = i;
						}
						else
						{
							var cur = line.normal.dotMultiply(tryLine.normal);
							if(max < cur)
							{
								max = cur;
								maxIndex = i;
							}
						}
					}
					// PI-2PI
					else
					{
						if(min == null)
						{
							min = line.normal.dotMultiply(tryLine.normal);
							minIndex = i;
						}
						else
						{
							var cur = line.normal.dotMultiply(tryLine.normal);
							if(min > cur)
							{
								min = cur;
								minIndex = i;
							}
						}

					}
				}
			}//end of for loop
			var tmp = index;
			index = maxIndex==null ? minIndex: maxIndex;

			line = new Line(this.points[tmp], this.points[index]);
			this.lines.push(line);

			this.points.splice(tmp, 1);
			if(index > tmp)
				index -= 1;
		}
		// Close the shape
		this.lines.push(new Line(this.points[0], firstPoint));
	}

	// Construction method 2: add lines
	this.addLine = function(x1, y1, x2, y2)
	{
		this.lines.push(new Line( new Position(x1, y1), new Position(x2, y2) ));
	}

	this.transform = function(translation, rotation)
	{
		for(var i = 0; i < this.lines.length; i++)
		{
			this.lines[i].translate(translation);
			this.lines[i].rotate(rotation);
		}
	}

	this.drawSelf = function(ctx, color, displayNormal)
	{
		// Set param default value
		var color = typeof color !== 'undefined' ? color : "DarkBlue";
		var displayNormal = typeof displayNormal !== 'undefined' ? displayNormal : true;

		for(var i = 0; i < this.lines.length; i++)
		{
			this.lines[i].drawSelf(ctx, color, displayNormal);
		}
	}
}

function Ball(positionVector, velocityVector, radius)
{
	this.pv = positionVector;
	this.vv = velocityVector;
	this.radius = radius;

	this.updatePosition = function(delta)
	{
		// p1 = p0 + v0*delta
		this.pv = this.pv.add(this.vv.scalarMultiply(delta));
	}
	this.drawSelf = function(ctx)
	{
		ctx.beginPath();
		ctx.arc(this.pv.x, this.pv.y, this.radius, 0, 2 * Math.PI);
		ctx.fillStyle = "yellow";
		ctx.fill();
	}
}
