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