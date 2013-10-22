//
// 2D position
//
function Position(x, y)
{
	this.x = x;
	this.y = y;
}
Position.prototype.equalOrigin = function()
{
	if(this.x == 0 && this.y == 0)
		return true;
	else
		return false;
}
Position.prototype.equal = function(that)
{
	if(this.x == that.x && this.y == that.y)
		return true;
	else
		return false;
}
Position.prototype.distance = function(that)
{
	var deltaX = (this.x - that.x) * (this.x - that.x);
	var deltaY = (this.y - that.y) * (this.y - that.y);
	return Math.sqrt(deltaY + deltaX);
}

//
// 2D vector
//
function Vector2D(x, y)
{
	this.x = x;
	this.y = y;
}

Vector2D.prototype.makeZero = function()
{
	this.x = 0;
	this.y = 0;	
}

Vector2D.prototype.duplicate = function()
{
	return new Vector2D(this.x, this.y);
}

Vector2D.prototype.equal = function(that)
{
	if(this.x == that.x && this.y == that.y)
		return true;
	else
		return false;
}

Vector2D.prototype.add = function(that)
{
	return new Vector2D(this.x + that.x, this.y + that.y);
}

Vector2D.prototype.addSelf = function(that)
{
	this.x += that.x;
	this.y += that.y;
	return this;
}

Vector2D.prototype.minus = function(that)
{
	return new Vector2D(this.x - that.x, this.y - that.y);
}

Vector2D.prototype.minusSelf = function(that)
{
	this.x -= that.x;
	this.y -= that.y;
	return this;
}

Vector2D.prototype.scalarMultiply = function(scalar)
{
	return new Vector2D(this.x * scalar, this.y * scalar);
}

Vector2D.prototype.scalarMulSelf = function(scalar)
{
	this.x = this.x * scalar;
	this.y = this.y * scalar;
	return this;
}

Vector2D.prototype.scalarDivide = function(scalar)
{
	return new Vector2D(this.x / scalar, this.y / scalar);
}

Vector2D.prototype.scalarDivSelf = function(scalar)
{
	this.x = this.x / scalar;
	this.y = this.y / scalar;
	return this;
}

Vector2D.prototype.dotMultiply = function(that)
{
	return	this.x*that.x + this.y* that.y;
}

// Used to determin normal direction of a 'plane', so it's actually a simplified version of cross muliplication.
// Right-handed.
// Usage: 
// var z = line.vector.crossMultiply(line.normal)
// if z>0, normal is okay
// else, flip normal
Vector2D.prototype.crossMultiply = function(that)
{
	return this.x * that.y - this.y * that.x;
}

Vector2D.prototype.mod = function()
{
	return Math.sqrt(this.x * this.x + this.y * this.y);
}

Vector2D.prototype.normalize = function()
{
	var mod = this.mod();
	this.x = this.x / mod;
	this.y = this.y / mod;
}


