// Comment out the following line to turn on debug logging.
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

		//
		// Resource creation
		//
		var triangle = new Shape();
		
		triangle.addPoint(700, 300);
		triangle.addPoint(450, 550);
		triangle.addPoint(200, 500);
		triangle.addPoint(100, 300);
		triangle.addPoint(200, 170);
		triangle.addPoint(400, 100);
		triangle.addPoint(650, 150);
		triangle.addPoint(700, 300);
		
		triangle.connectPoints();

		//var ball = new Ball(new Vector2D(400, 250), new Vector2D(0.14, -0.08));

		var balls = new Array();
		for(var i = 0; i < 1000; i++)
		{
			balls[i] = new Ball( new Vector2D(400, 250), new Vector2D(0.2 - Math.random()*0.4, 0.2 - Math.random()*0.4), Math.random()*5 + 2);
		}
		/*for (var i = 0; i < 6; ++i)
		{
			triangle.addPoint(Math.random()*canvas.width, Math.random()*canvas.height);
		}*/

		//triangle.connectPointsToShape();

		//
		// Render loop
		//
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
			// Detect ball collision
			for(var j = 0; j < balls.length; j++)
			{
				for (var i = 0; i < triangle.lines.length; i++)
				{
					// Distance from ball to line:
					// d = P*N + d
					var	distance = ( (triangle.lines[i].normal.dotMultiply(balls[j].pv)) + (triangle.lines[i].d) ) ;
					
					var isColliding = balls[j].vv.dotMultiply(triangle.lines[i].normal)

					// Draw a detecting line here
					/*
					context.beginPath();
					context.moveTo(balls[j].pv.x, balls[j].pv.y);
					var endPointX = balls[j].pv.x - distance * triangle.lines[i].normal.x;
					var endPointY = balls[j].pv.y - distance * triangle.lines[i].normal.y;
					context.lineTo(endPointX, endPointY);
					context.strokeStyle = "green";
					context.stroke();*/

					if(distance < balls[j].radius && isColliding <= 0)
					{
						// Calculate reflection
						// v1 = v0 + (1+e)*n*v0
						balls[j].vv = balls[j].vv.add(triangle.lines[i].normal.scalarMultiply( 1.2 * Math.abs(balls[j].vv.dotMultiply(triangle.lines[i].normal))));
					}
				}
				// Update ball position according to velocity
				balls[j].updatePosition(delta);
			}
			
			// Render scene	
			triangle.drawSelf(context);
			for(var i = 0; i < balls.length; i++)
				balls[i].drawSelf(context);

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