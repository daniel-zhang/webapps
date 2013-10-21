$(document).ready(function()
{

$("#radio").buttonset();
$("#menu").menu();

// Shows how to add custom events
$("input").click(function(){
	$(this).trigger(
	{
		type: "customized",
		message: this.id
	})
});

$(document).on("customized", function(e){
	console.log("Received event: " + e.message );
})

});
