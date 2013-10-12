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
	var ctor = function RenderEngine(parentId, viewport)
	{
		var canvas = document.createElement("canvas");
		canvas.setAttribute("width", viewport.width);
		canvas.setAttribute("height", viewport.height);
		canvas.setAttribute("style", "border:2px solid #000000");
		document.getElementById(parentId).appendChild(canvas);

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
		var polygon = new Shape();
		
		polygon.addPoint(700, 300);
		polygon.addPoint(450, 550);
		polygon.addPoint(200, 500);
		polygon.addPoint(100, 300);
		polygon.addPoint(200, 170);
		polygon.addPoint(400, 100);
		polygon.addPoint(650, 150);
		polygon.addPoint(700, 300);
		
		polygon.connectPoints();

		var balls = new Array();
		for(var i = 0; i < 200; i++)
		{
			var rad = Math.random()*Math.PI*2;
			var vx = Math.sin(rad)*Math.random()*0.1;
			var vy = Math.cos(rad)*Math.random()*0.1;

			var radius = Math.random()*3 + 1;
			var mass = radius*radius*Math.PI*2;
			balls[i] = new Ball( 
				new Vector2D(300+Math.random()*200, 150+Math.random()*200),  // Position 400, 250
				new Vector2D(vx, vy), // Velocity
				radius, // Radius
				mass // Mass
				); 
		}
		/* // An alternative method for resource creation
		for (var i = 0; i < 6; ++i)
		{
			polygon.addPoint(Math.random()*canvas.width, Math.random()*canvas.height);
		}
		polygon.connectPointsToShape();*/

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

			// 
			// Update scene 
			//

			// Apply gravity
			/*var gravity = new Vector2D(0, 0.002);
			for(var i = 0; i < balls.length; i++)
			{
				balls[i].vv = balls[i].vv.add(gravity);
			}*/

			// Detect ball collision
			for(var j = 0; j < balls.length; j++)
			{
				// Ball[j] collision with ball[k]
				for(var k = j; k < balls.length; k++)
				{
					if(k == j) continue;
					var collisionNormal = balls[j].pv.minus(balls[k].pv);
					var relV = balls[j].vv.minus(balls[k].vv);
					if(
						collisionNormal.x*collisionNormal.x + collisionNormal.y*collisionNormal.y < (balls[j].radius + balls[k].radius)*(balls[j].radius + balls[k].radius) &&
						collisionNormal.dotMultiply(relV) < 0
						)
					{
						collisionNormal.normalize();
						
						// I = (1+e)*N*(Vr*N) / (1/Ma + 1/Mb)
						// Va -= I / a.mass
						// Vb += I / b.mass
						var impulse = collisionNormal.scalarMultiply(
							collisionNormal.dotMultiply(relV)*2/(balls[j].invMass + balls[k].invMass)
							);
						balls[j].vv = balls[j].vv.minus(impulse.scalarMultiply(balls[j].invMass));
						balls[k].vv = balls[k].vv.add(impulse.scalarMultiply(balls[k].invMass));
					}
				}

				// Ball collision with world
				for (var i = 0; i < polygon.lines.length; i++)
				{
					// Distance from ball to line:
					// d = P*N + d
					var	distance = ( (polygon.lines[i].normal.dotMultiply(balls[j].pv)) + (polygon.lines[i].d) ) ;
					
					var isColliding = balls[j].vv.dotMultiply(polygon.lines[i].normal)

					// Draw a detecting line here
					/*
					context.beginPath();
					context.moveTo(balls[j].pv.x, balls[j].pv.y);
					var endPointX = balls[j].pv.x - distance * polygon.lines[i].normal.x;
					var endPointY = balls[j].pv.y - distance * polygon.lines[i].normal.y;
					context.lineTo(endPointX, endPointY);
					context.strokeStyle = "green";
					context.stroke();*/

					if(distance < balls[j].radius && isColliding <= 0)
					{
						// Calculate reflection
						// v1 = v0 + (1+e)*n*v0
						balls[j].vv = balls[j].vv.add(polygon.lines[i].normal.scalarMultiply( 2 * Math.abs(balls[j].vv.dotMultiply(polygon.lines[i].normal))));
					}
				}
				// Update ball position according to velocity
				balls[j].updatePosition(delta);
			}
			
			// Render scene	
			polygon.drawSelf(context);
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

re = new RenderEngine("canvas_parent", new Viewport(800, 600, "LightSteelBlue"));

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