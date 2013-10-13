function ConfigPanelUI(parent_, viewport_)
{
	this.parent = parent_;
	this.height = viewport_.height;

	this.panelElement = null;
	// Init stataus of config panel
	this.checkBoxStatus = {};
	this.canvasSize = 
	{
		'400 x 300' : {'width':400, 'height':300, 'pre_selected':false},
		'800 x 600' : {'width':800, 'height':600, 'pre_selected':true},
		"1024 x 768" : {'width':1024, 'height':768, 'pre_selected':false},
		"1280 x 720" : {'width':1280, 'height':720, 'pre_selected':false},
	};

	this.queryCheckBoxStatus = function(itemId_)
	{
		if(itemId_ in this.checkBoxStatus)
			return this.checkBoxStatus[itemId_];
	}

	this.addjustSize = function(height_)
	{
		this.height = height_;
		this.panelElement.setAttribute("style", "height:" + this.height + "px;");
	}

	// Callback handler when canvas size is changed
	// Also send a customized event to indicate this change
	this.onSizeChanged = function(key, that)
	{
		if(key in that.canvasSize)
		{
			var width = that.canvasSize[key]['width'];
			var height = that.canvasSize[key]['height']

			if(that.height != height)
			{
				that.addjustSize(height);
				
				// Create and dispatch event
				var e = new CustomEvent('canvasSizeChange');
				e.width = width;
				e.height = height;

				document.dispatchEvent(e);
				console.log("CustomEvent dispatched...............");


			}
		}
	}

	this.init = function()
	{
		this.panelElement = document.createElement("div");
		this.parent.appendChild(this.panelElement);
		this.panelElement.className = "configPanel";
		this.addjustSize(this.height);

		var displaySetttings = this.addGroupBox("Display Settings", this.panelElement);
		this.addCheckBox("showNormal", "Normal", displaySetttings);
		this.addCheckBox("showFPS", "FPS", displaySetttings);
		this.addCheckBox("showDectectingLine", "Detecting Line", displaySetttings);
		
		displaySetttings.appendChild(document.createElement("hr"));
		this.addDropDownList("Canvas Size: ", this.canvasSize, displaySetttings, this.onSizeChanged);
	}

	
	this.addGroupBox = function(title, parent)
	{
		var groupBox = document.createElement("fieldset");
		parent.appendChild(groupBox);

		var legend = document.createElement("legend");
		groupBox.appendChild(legend);
		legend.innerHTML = title;

		return groupBox;
	}

	this.addCheckBox = function(id, desc, parent)
	{
		this.checkBoxStatus[id] = false;
		var cb = document.createElement("input");
		parent.appendChild(cb);
		cb.type = "checkbox";
		cb.id = id;

		// Tricky part: the context of 'this' is changed in a callback function.
		// Have to save the current 'this' as a local variable to refer to it later in another context.
		var that = this;
		cb.onclick = function()
		{
			that.checkboxHandler(cb);
		} 

		var label = document.createElement("label");
		parent.appendChild(label);
		label.htmlFor = id;
		label.appendChild(document.createTextNode(desc));
		parent.appendChild(document.createElement("br"));
	}

	this.checkboxHandler = function(checkBox)
	{
		this.checkBoxStatus[checkBox.id] = checkBox.checked;
		this.testCheckbox();
	}

	this.testCheckbox = function()
	{
		var txt = "";
		for(var key in this.checkBoxStatus)
		{
			txt += key + ":" + this.queryCheckBoxStatus(key) + ";\n"
		}
		console.log(txt);
	}

	this.addDropDownList = function(name, items, parent, itemOnClickHandler)
	{
		parent.appendChild(document.createTextNode(name));
		var select = document.createElement("select");
		parent.appendChild(select);

		var that = this;
		select.onclick = function()
		{
			console.log("Dropdown list is clicked: ");
			itemOnClickHandler((select.options[select.selectedIndex]).text, that);
		}

		for(var key in items)
		{
			var option = document.createElement("option");
			select.appendChild(option);
			option.appendChild(document.createTextNode(key));

			if(items[key]['pre_selected'] == true)
				option.setAttribute("selected");
		}
		parent.appendChild(document.createElement("br"));
	}

	this.init();
}

function CanvasUI(parent_, viewport_)
{
	this.parent = parent_;
	this.viewport = viewport_;

	this.canvasElement = null;
	this.init = function()
	{
		this.canvasElement = document.createElement("canvas");
		this.parent.appendChild(this.canvasElement);
		
		this.addjustSize(this.viewport.width, this.viewport.height);
		var that = this;
		document.addEventListener(
			'canvasSizeChange',
			function(e)
			{
				console.log("Canvas received event:" + e + " " + e.width + " " + e.height);
				that.addjustSize(e.width, e.height);
			},
			false
			);
	}

	this.addjustSize = function(width, height)
	{
		this.canvasElement.setAttribute("width", width);
		this.canvasElement.setAttribute("height", height);
	}

	this.init();
}