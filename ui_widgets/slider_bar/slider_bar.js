function SliderBar(id, dispId)
{
	function CursorPosition(x, y)
	{
		this.x = x || 0;
		this.y = y || 0;
	}
	this.uid = id;
	this.ele = document.getElementById(this.uid);
	this.disp = document.getElementById(dispId);
	this.isDown = false;
	this.cursPos = new CursorPosition();

	this.setCursPos = function(x, y)
	{
		this.cursPos.x = x; 
		this.cursPos.y = y;
	};

	var full = 220;
	var boundary = 200;
	var ratio = 0.2;
	var curPos = ratio * boundary;
	this.disp.innerHTML = "Velocity: " + (ratio * full).toFixed(2) + " mph";
	this.slide = function(delta)
	{
		curPos += delta;
		if(curPos > boundary)  curPos = boundary;
		if(curPos < 0) curPos = 0;

		ratio = curPos/boundary;
		this.disp.innerHTML = "Velocity: " + (ratio * full).toFixed(2) + "mph";
	}

	var that = this;
	this.ele.onmousedown = function(e)
	{
		that.isDown = true;
		that.setCursPos(e.clientX, e.clientY);
		console.log("Mouse down!");
	}

	this.ele.onmouseup = function(e)
	{
		that.isDown = false;
		console.log("Mouse up!");
	}

	this.ele.onmousemove = function(e)
	{
		if(that.isDown)
		{
			var delta = e.clientX - that.cursPos.x;
			that.slide(delta);
			that.setCursPos(e.clientX, e.clientY);
		}
	}

	this.ele.onclick = function()
	{
		console.log("Clicked!");
	}

}

var sb = new SliderBar("velocity", "velocity_disp");
var sb2 = new SliderBar("density", "density_disp");