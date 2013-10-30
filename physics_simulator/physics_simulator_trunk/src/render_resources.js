function Viewport(width, height, bgColor)
{
	this.width = width;
	this.height = height;
	this.bgColor = bgColor;
}

// Helper object to manage misc status of render loops
function Looper()
{
	this.id = null;
	this.previousTimestamp = null;
	this.currentFrameNo = 0;
	this.fps = 0;
	this.fpsCounter = null;
	this.isLoopStarted = false;

	this.startFpsCounter = function()
	{
		var that = this;
		this.fpsCounter = window.setInterval(
			function()
			{
				that.fps = that.currentFrameNo;
				that.currentFrameNo = 0;
			},
			1000
			);
	}

	this.stopFpsCounter = function()
	{
		window.clearInterval(this.fpsCounter);
		this.previousTimestamp = null;
		this.currentFrameNo = 0;
	}
}

// Input handler
function InputHandler(canvas, sceneObjects)
{
	this.canvas = canvas;
	this.sceneObjs = sceneObjects;

	this.isMouseDown = false;
	this.previousMousePos = null;

	this.activeObj = null;
	this.tempInvMass = 0;

	this.translate = 0;
	this.rotate = 1;
	this.mode;

	this.getElementAbsolutePos = function(ele)
	{
		var x = y = 0;
		if(ele.offsetParent)
		{
			do{
				x += ele.offsetLeft;
				y += ele.offsetTop;
			}while(ele = ele.offsetParent);
		}
		return new Vector2D(x, y);
	}
	this.canvasAbsPos = this.getElementAbsolutePos(this.canvas);

	this.getRelativeClickPos = function(e)
	{
		var relPos = (new Vector2D(e.clientX, e.clientY)).minus(this.canvasAbsPos);
		return relPos;
	}

	this.init = function()
	{
		var that = this;

		this.canvas.onmousedown = function(e)
		{
			that.isMouseDown = true;
			var mousePos = that.getRelativeClickPos(e);

			for(var i = 0; i < that.sceneObjs.length; i++)
			{
				var result = that.sceneObjs[i].isClicked(mousePos, 5);

				// Not clicked
				if(result == 0)
					continue;

				// Clicked on edge
				else if(result == 1)
				{
					that.mode = that.rotate;
					that.activeObj = that.sceneObjs[i];
					that.tempInvMass = that.activeObj.invMass;
					that.previousMousePos = mousePos;
					that.activeObj.invMass = 0;
					that.activeObj.velocity.makeZero();
					that.activeObj.angVelo = 0;

					return;
				}

				// Clicked inside
				else if(result == 2)
				{
					that.mode = that.translate;
					// Enter kinematic mode
					that.activeObj = that.sceneObjs[i];
					that.tempInvMass = that.activeObj.invMass;
					that.activeObj.invMass = 0;
					that.activeObj.velocity.makeZero();
					that.activeObj.angVelo = 0;
					return;
				}
			}
			console.log("nothing clicked.");
		}

		this.canvas.onmousemove = function(e)
		{
			if(that.isMouseDown && that.activeObj != null)
			{
				var mousePos = that.getRelativeClickPos(e);
				switch(that.mode)
				{
				case that.translate:
					var delta = mousePos.minusSelf(that.activeObj.position);
					that.activeObj.translate(delta);
					break;

				case that.rotate:
					var v0 = that.activeObj.position.minus(that.previousMousePos);
					var v1 = that.activeObj.position.minus(mousePos);
					var angle = Math.acos(v1.normalize().dotMultiply(v0.normalize()));
					if(v1.crossMultiply(v0) > 0)
						angle = 0 - angle;

					that.previousMousePos = mousePos;
					that.activeObj.rotate(angle);
					break;
				}
			}
		}

		this.canvas.onmouseup = function(e)
		{
			that.isMouseDown = false;

			if(that.activeObj != null)
			{
				// Leave kinematic mode
				that.activeObj.invMass = that.tempInvMass;

				that.activeObj = null;
			}
		}
	}

	this.init();
}