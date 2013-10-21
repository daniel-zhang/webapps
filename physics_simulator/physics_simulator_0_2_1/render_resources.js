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