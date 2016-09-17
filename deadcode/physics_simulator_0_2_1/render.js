// Comment out the following line to turn on debug logging.
//console.log = function(){}

function RenderEngine(parentId, viewport)
{
	this.parentId = parentId;
	this.canvasUI = null;
	this.configPanelUI = null;

	this.drawFPS = false;
	this.drawNormal = false;

	var requestAnimationFrame = null;
	var cancelAnimationFrame = null;
	var context = null;

	var looper = new Looper();

	this.physim = new PhysicsEngine();
	this.physim.populate();

	this.initUI = function(viewport)
	{
		// Create the container element
		var container = document.createElement("div");
		document.getElementById(this.parentId).appendChild(container);
		container.className = "renderContainer";

		this.canvasUI = new CanvasUI(container, viewport);
		this.configPanelUI = new ConfigPanelUI(container, viewport);

		console.log("Init UI done!");
	}

	this.initAnimator = function()
	{
		requestAnimationFrame = 
			window.requestAnimationFrame || 
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.msRequestAnimationFrame;

		cancelAnimationFrame = 
			window.cancelAnimationFrame ||
			window.mozCancelAnimationFrame ||
			window.webkitCancelAnimationFrame;

		context = this.canvasUI.canvasElement.getContext("2d");
	}

	this.registerEventListeners = function()
	{
		var that = this;
		document.addEventListener(
			'canvasSizeChange',
			function(e)
			{
				console.log("Render Engine received event:" + e['type'] + e['width'] + e['height']);
				that.canvasUI.addjustSize(e.width, e.height);
				that.clearBg();
			},
			false
			);
        document.addEventListener(
            'startEngine',
            function(e)
            {
            	console.log("Render Engine received event: " + e['type']);
            	if(looper.isLoopStarted)
            		console.log("Render loop is already started, nothing is done.");
            	else
            		that.start();
            },
            false 
            );
        document.addEventListener(
            'stopEngine',
            function(e)
            {
            	console.log("Render Engine received event: " + e['type']);
            	if(looper.isLoopStarted == false)
            		console.log("Render loop is not started yet, nothing is done.");
            	else
            		that.stop();
            },
            false
            );
        document.addEventListener(
            'pauseEngine',
            function(e)
            {
            	console.log("Render Engine received event: " + e['type']);
            },
            false
            );
	}

	this.clearBg = function()
	{
		context.beginPath();
		context.save();
		context.fillStyle = this.canvasUI.viewport.bgColor;
		context.fillRect(0, 0, this.canvasUI.viewport.width, this.canvasUI.viewport.height);
		context.restore();
	};
	
	this.initAll = function()
	{
		this.initUI(viewport);
		this.initAnimator();
		this.registerEventListeners();
		this.clearBg();
	}

	var that = this;
	var step = function(timestamp)
	{
		looper.currentFrameNo += 1;

		if(looper.previousTimestamp == null) 
			looper.previousTimestamp = timestamp;

		var delta = timestamp - looper.previousTimestamp;
		looper.previousTimestamp = timestamp;

		// Step physics simulator
		that.physim.update(delta);

		// Render
		that.clearBg();
		for(var i = 0; i < that.physim.rigidBodies.length; i++)
		{
			var rb = that.physim.rigidBodies[i];
			if(rb.type == rb.TYPE_CIRCLE)
			{
				context.beginPath();
				context.arc(rb.position.x, rb.position.y, rb.radius, 0, 2 * Math.PI);
				context.fillStyle = "yellow";
				context.fill();
			}
			else if (rb.type == rb.TYPE_PLANE)
			{
				context.beginPath();
				context.moveTo(rb.startPos.x, rb.startPos.y);	
				context.lineTo(rb.endPos.x, rb.endPos.y);
				context.strokeStyle = "green";
				context.stroke();

				// Draw plane normal
				context.beginPath();
				var midPoint = rb.startPos.add(rb.endPos).scalarDivide(2);
				var normalLen = 50;
				context.moveTo(midPoint.x, midPoint.y);
				context.lineTo(midPoint.x + normalLen*rb.normal.x, midPoint.y + normalLen*rb.normal.y);
				context.strokeStyle = "red";
				context.stroke();
			}
		}

		// Draw fps info
		var fpsTxt = looper.fps + " frames per second";
		context.font = "bold 20px consola";
		context.fillStyle = "FloralWhite";
		context.fillText(fpsTxt, that.canvasUI.viewport.width - context.measureText(fpsTxt).width - 10, 15);

		looper.id = requestAnimationFrame(step);
	}

	this.start = function()
	{
		looper.id = requestAnimationFrame(step);
		looper.isLoopStarted = true;
		looper.startFpsCounter();

		console.log("Render loop started.");
	}

	this.stop = function()
	{
		cancelAnimationFrame(looper.id);
		looper.isLoopStarted = false;
		looper.stopFpsCounter();

		console.log("Render loop stopped.");
	}

	this.initAll();

}

var renderEngine = new RenderEngine("simulator_parent", new Viewport(800, 600, "LightSteelBlue"));