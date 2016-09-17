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
		'800 x 600' : {'width':800, 'height':600, 'pre_selected':false},
		"1024 x 768" : {'width':1024, 'height':768, 'pre_selected':false},
		"1280 x 720" : {'width':1280, 'height':720, 'pre_selected':true},
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
	var onSizeChanged = function(key, that)
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

				console.log("Config panel sent out event: " + e.type);
				document.dispatchEvent(e);
			}
		}
	}

    // Callback handler when button is clicked
    var onButtonClicked = function(id)
    {
    	console.log("Config panel sent out event: " + id);
        document.dispatchEvent(new CustomEvent(id));
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
		this.addDropDownList("Canvas Size: ", this.canvasSize, displaySetttings, onSizeChanged);

        this.addButton("Start Engine", "startEngine", this.panelElement, onButtonClicked);
        this.addButton("Stop Engine", "stopEngine", this.panelElement, onButtonClicked);
        this.addButton("Pause Engine", "pauseEngine", this.panelElement, onButtonClicked);

        console.log("Config Panel init done!");
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

	this.addDropDownList = function(alias, items, parent, itemOnClickHandler)
	{
		parent.appendChild(document.createTextNode(alias));
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

    this.addButton = function(alias, id, parent, onClickHandler)
    {
        var button = document.createElement("button");
        parent.appendChild(button);
        button.id = id;
        button.type = 'button';
        button.innerHTML = alias;

        var that = this;
        button.onclick = function()
        {
            onClickHandler(button.id, that);
        }
        parent.appendChild(document.createElement("br"));
    }

	this.init();
}

function CanvasUI(id, viewport_)
{
	this.eleId = id;
	this.viewport = viewport_;

	this.canvasElement = null;

	this.init = function()
	{
		this.canvasElement = document.getElementById(id);
		this.viewport.width = this.canvasElement.width;
		this.addjustSize(this.viewport.width, this.viewport.width * 9 / 16);
		var that = this;
		this.canvasElement.onmousewheel = function(e)
		{
			if(e.wheelDelta > 0)
			{
				// var width = that.canvasElement.width*1.08*(e.wheelDelta/120);
				// var height = that.canvasElement.height*1.1*(e.wheelDelta/120);
				var width = that.canvasElement.width + 30;
				var height = width * 9 / 16;
				that.addjustSize(width, height);
			}
			else if (e.wheelDelta < 0)
			{
				// var width = that.canvasElement.width*0.92*(0-e.wheelDelta/120);
				var width = that.canvasElement.width - 30;
				var height = width * 9 / 16;
				// var height = that.canvasElement.height*0.93*(0-e.wheelDelta/120);
				that.addjustSize(width, height);
			}
		}
	}

	this.addjustSize = function(width, height)
	{
		this.viewport.width = width;
		this.viewport.height = height;
		this.canvasElement.setAttribute("width", width);
		this.canvasElement.setAttribute("height", height);
	}

	this.init();
}
