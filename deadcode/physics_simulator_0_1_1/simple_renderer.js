// Turn off logging
//console.log = function(){}

var RenderEngine = function ()
{
	// Private static code
	requestAnimationFrame = 
		window.requestAnimationFrame || 
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;

	cancelAnimationFrame = 
		window.cancelAnimationFrame ||
		window.mozCancelAnimationFrame ||
		window.webkitCancelAnimationFrame;
	window.cancelAnimationFrame = cancelAnimationFrame;

	// ctor
	var ctor = function RenderEngine(elementId, viewport)
	{
		var canvas = document.createElement("canvas");
		canvas.setAttribute("width", viewport.width);
		canvas.setAttribute("height", viewport.height);
		canvas.setAttribute("style", "border:2px solid #000000");
		document.getElementById(elementId).appendChild(canvas);

		var context = canvas.getContext("2d");		

		var clearBg = function()
		{
			context.beginPath();
			context.save();
			context.fillStyle = viewport.bgColor;
			context.fillRect(0, 0, viewport.width, viewport.height);
			context.restore();
		};
		clearBg();

		// Resouce creation -- many balls bouncing around...
		var balls = new Array();
		var colorset = ["Black", "DarkCyan", "Gold", "Maroon", "Blue"];
		for(var i = 0; i < 321; i++)
		{
			// Randomly create balls
			var x = Math.random() * viewport.width;
			var y = Math.random() * viewport.height;
			var r = Math.random() * 5 + 1; //5-20

			var vx = Math.random() * 0.2 // 0 - 0.5
			if(Math.random() > 0.5)
				vx = 0 - vx;

			var vy = Math.random() * 0.2 // 0 - 0.5
			if(Math.random() > 0.5)
				vy = 0 - vy;

			var color = colorset[i % colorset.length];

			balls[i] = new Ball(new Position(x, y), r, new Velocity(vx, vy), color);
		}

		// Render loop
		var lastTimeStamp = null;
		var requestID;
		var frameSeqNo = 0;
		var fps = 0;
		var step = function(timestamp)
		{
			clearBg();
			frameSeqNo += 1;

			// Caculate fps and delta time
			if(lastTimeStamp == null)
				lastTimeStamp = timestamp;
			var delta = timestamp - lastTimeStamp;
			lastTimeStamp = timestamp;

			// Update scene 
			for(var i = 0; i < balls.length; i++)
			{
				balls[i].updateAgainstBoundary(delta, viewport);
				/*
				for(var j = 0; j < balls.length; j++)
				{
					if(j != i)
					{
						balls[i].collide(balls[j]);
					}
				}
				*/
			}

			// Render scene
			for(var i = 0; i < balls.length; i++)
			{
				context.beginPath();
				context.arc(balls[i].position.x, balls[i].position.y, balls[i].radius, 0, 2 * Math.PI);
				context.fillStyle = balls[i].color;
				context.fill();	
			}

			// Draw fps info
			var fpsTxt = fps + " frames per second";
			context.font = "bold 20px consola";
			context.fillStyle = "FloralWhite";
			context.fillText(fpsTxt, canvas.width - context.measureText(fpsTxt).width - 10, 15);

			requestID = requestAnimationFrame(step);
		}

		this.isStarted = false;
		var fpsCounter = null;
		this.start = function()
		{
			// Start render loop
			requestID = requestAnimationFrame(step);
			this.isStarted = true;
			console.log("Engine started successfully.");

			// Start fps counter
			fpsCounter = window.setInterval(function(){
				fps = frameSeqNo;
				frameSeqNo = 0;
			}, 1000);
		}

		this.stop = function()
		{
			//Clear fps counter
			window.clearInterval(fpsCounter);
			fpsCounter = null;
			frameSeqNo = 0;
			fps = 0;

			// Stop render loop
			cancelAnimationFrame(requestID);
			this.isStarted = false;
			lastTimeStamp = null;
			console.log("Engine stopped successfully.");
		}
	};

	return ctor;
}();

re = new RenderEngine("render_engine", new Viewport(800, 600, "LightSteelBlue"));

function startAnimation()
{
	console.log("Start button is clicked.");
	if(re.isStarted == false)
		re.start();		
	else
		console.log("Engine already started. Nothing is done.");
}

function stopAnimation()
{
	console.log("Stop button is clicked.");
	if(re.isStarted)
		re.stop();		
	else
		console.log("Engine already stopped. Nothing is done.")
}