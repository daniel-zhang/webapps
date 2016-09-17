function Base(p1, p2)
{
	this.p1 = p1;
	this.p2 = p2;
}

Base.prototype.m1 = function()
{
	console.log("Base::m1");
}

Base.prototype.m2 = function()
{
	console.log("Base::m2");
}
Base.prototype.m3 = function()
{
	this.m1();
	this.m2();
}

function Child(p1, p2, p3)
{
	Base.call(this, p1, p2);
	this.p3 = p3;
}
Child.prototype = Object.create(Base.prototype);
Child.prototype.m1 = function()
{
	console.log("Child::m1");
}
Child.prototype.m2 = function()
{
	console.log("Child::m2");
}

function GrandChild(p1, p2)
{
	Child.call(this, p1, p2);
}
GrandChild.prototype = Object.create(Child.prototype);
GrandChild.prototype.m1 = function(){console.log("GrandChild::m1");}
GrandChild.prototype.m2 = function(){console.log("GrandChild::m2");}

var n = new Child(1,2,3);
var g = new GrandChild(1,2);

n.m3();
g.m3();