function RadioButton(element, isPressed)
{
	this.htmlElement = element;
	this.uid = element.getAttribute('value');
	this.isPressed = isPressed;
}

function RadioButtonGroup(groupName, activeBgColor, normalBgColor)
{
	this.activeBgColor = activeBgColor || "yellow";
	this.normalBgColor = normalBgColor || "green";
	this.buttonList = new Array();
	this.init = function()
	{
		var buttons = document.getElementsByName(groupName);		
		for(var i = 0; i < buttons.length; i++)
		{
			if(buttons[i].getAttribute("checked") == "true")
			{
				this.buttonList.push( new RadioButton(buttons[i], true) );
			}
			else
				this.buttonList.push( new RadioButton(buttons[i], false) );

			var that = this;
			this.buttonList[i].htmlElement.onclick = function()
			{
				that.setButtonDown(that.findIndexByUid(this.getAttribute('value')));
			};
		}
	}

	this.setButtonDown = function(index)
	{
		var button = this.buttonList[index];
		button.isPressed = true;
		
		button.htmlElement.style.top = "5px";
		button.htmlElement.style.left = "5px";
		button.htmlElement.style.backgroundColor = this.activeBgColor;

		// Set other buttons up
		var selfIndex = this.findIndexByUid(button.uid);
		for(var i = 0; i < this.buttonList.length; i++)
		{
			if(i != selfIndex)
				this.setButtonUp(i);
		}

		// Dispatch customized event
		var e = new CustomEvent(button.uid);
		document.dispatchEvent(e);
	}

	this.setButtonUp = function(index)
	{
		var button = this.buttonList[index];
		button.isPressed = true;

		button.htmlElement.style.top = "0px";
		button.htmlElement.style.left = "0px";
		button.htmlElement.style.backgroundColor = this.normalBgColor;
	}

	this.findIndexByUid = function(uid)
	{
		for(var i = 0; i < this.buttonList.length; i++)
		{
			if(this.buttonList[i].uid == uid)
				return i;
		}
	}
	this.init();
}

