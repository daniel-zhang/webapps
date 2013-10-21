// Sample usage
function BackgroundApp()
{
	var rbg = new RadioButtonGroup("radio_button_group_1");
	// Color scheme should be consistant with css
	var rbg2 = new RadioButtonGroup('radio_button_group_2', "red", "#eee");

	this.init = function()
	{
		// Add event listeners
		for(var i = 0; i < rbg.buttonList.length; i++)
			document.addEventListener(rbg.buttonList[i].uid, function(e){console.log(e.type + " received!")}, false);
		for(var i = 0; i < rbg2.buttonList.length; i++)
			document.addEventListener(rbg2.buttonList[i].uid, function(e){console.log(e.type + " received!")}, false);
	}
	this.init();
}
var app = new BackgroundApp();