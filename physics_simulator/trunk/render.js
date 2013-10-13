// Comment out the following line to turn on debug logging.
//console.log = function(){}

function RenderEngine(parentId, viewport)
{
	this.parentId = parentId;
	this.canvasUI = null;
	this.configPanelUI = null;

	this.initUI = function(viewport)
	{
		// Create the container element
		var container = document.createElement("div");
		document.getElementById(this.parentId).appendChild(container);
		container.className = "renderContainer";

		this.canvasUI = new CanvasUI(container, viewport);

		this.configPanelUI = new ConfigPanelUI(container, viewport);

	}
	this.initUI(viewport);
}

var renderEngine = new RenderEngine("simulator_parent", new Viewport(800, 600, "LightSteelBlue"));