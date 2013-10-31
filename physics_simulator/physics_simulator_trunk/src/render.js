// Comment out the following line to turn on debug logging.
//console.log = function(){}

function RenderEngine(canvasId, viewport)
{
	this.canvasId = canvasId;
	this.canvasUI = null;

	this.inputHandler = null;
	this.drawFPS = false;
	this.drawNormal = false;

	var requestAnimationFrame = null;
	var cancelAnimationFrame = null;
	var context = null;
	var looper = null;

	this.physim = null;

	this.initAll = function()
	{
		this.initUI(viewport);
		this.initAnimator();
		this.clearBg();

		this.registerEventListeners();

		this.physim = new PhysicsEngine();
		this.physim.populate();

		looper = new Looper();

		this.inputHandler = new InputHandler(this.canvasUI.canvasElement, this.physim.rigidBodies);
	}

	this.initUI = function(viewport)
	{
		// Create the container element
		this.canvasUI = new CanvasUI(this.canvasId, viewport);
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
            event_start_engine,
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
            event_pause_engine,
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
            event_restart_engine,
            function(e)
            {
            	console.log("Render Engine received event: " + e['type']);
            	document.dispatchEvent(new CustomEvent(event_pause_engine));
            	that.initAll();
            	document.dispatchEvent(new CustomEvent(event_start_engine));
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
	


	var that = this;
	var step = function(timestamp)
	{
		looper.currentFrameNo += 1;

		if(looper.previousTimestamp == null) 
			looper.previousTimestamp = timestamp;

		var delta = timestamp - looper.previousTimestamp;
		if(delta == 0)
			delta = 1000/60;
		looper.previousTimestamp = timestamp;

		that.clearBg();

		// Step physics simulator
		that.physim.update(delta);


		// Render
		for(var i = 0; i < that.physim.rigidBodies.length; i++)
		{
			var rb = that.physim.rigidBodies[i];
			rb.draw(context);
		}

		// Draw contacts
		for(var i = 0; i < that.physim.contacts.length; i++)
		{
			var pointA = that.physim.contacts[i].contactPointA;
			var pointB = that.physim.contacts[i].contactPointB;
			// if(pointA != null && pointB != null && pointA.minus(pointB).mod() < 0.2)
			if(pointA != null && pointB != null && pointA.minus(pointB).mod() < 10)
			{
				context.beginPath();
				context.arc(pointA.x, pointA.y, 3, 0, 2*Math.PI);
				context.fillStyle = "#483D8B";
				context.fill();

				context.beginPath();
				context.arc(pointB.x, pointB.y, 3, 0, 2*Math.PI);
				context.fillStyle = "#483D8B";
				context.fill();
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
		looper.isLoopStarted = true;
		looper.startFpsCounter();

		console.log("Render loop started.");

		looper.id = requestAnimationFrame(step);
	}

	this.stop = function()
	{
		cancelAnimationFrame(looper.id);
		looper.isLoopStarted = false;
		looper.previousTimestamp = null;
		looper.stopFpsCounter();
		looper.currentFrameNo = 0;

		console.log("Render loop stopped.");
	}

	this.initAll();
}

var renderEngine = new RenderEngine("main_canvas", new Viewport(1280, 720, "#ddd"));
