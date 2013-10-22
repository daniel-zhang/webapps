//
// Global definition of custom events
//
var event_start_engine = "_StartEngine";
var event_pause_engine = "_PauseEngine";
var event_restart_engine = "_RestartEngine";

var event_canvas_resize = "_CanvasResize"; //data: width, height

var event_enable_fps_display = "_ShowFPS";
var event_disable_fps_display = "_HideFPS";

var event_enable_normal_display = "_ShowNormal";
var event_disable_normal_display = "_HideNormal";

var event_enable_contact_display = "_ShowContact";
var event_disable_contact_display = "_HideContact";

var event_solver_type_changed = "_SolverChanged"; //data: speculative||discrete||TOIOrdered
var event_solver_iteration_changed = "_SolverIterationChanged"; //data: iterations(uint)


$(function(){
	$('#start').button({text:false, icons:{primary: "ui-icon-play"}});
	$('#start').on('click', function(){document.dispatchEvent(new CustomEvent(event_start_engine));});

	$('#pause').button({text:false, icons:{primary: "ui-icon-pause"}});
	$('#pause').on('click', function(){document.dispatchEvent(new CustomEvent(event_pause_engine));});
	
	$('#reload').button({text:false, icons:{primary: "ui-icon-arrowrefresh-1-s"}});
	$('#reload').on('click', function(){document.dispatchEvent(new CustomEvent(event_restart_engine));});

	$('#show_noraml').on('click', function(){if(this.checked) document.dispatchEvent(new CustomEvent(event_enable_normal_display)); else document.dispatchEvent(new CustomEvent(event_disable_normal_display));});
	$('#show_fps').on('click', function(){if(this.checked) document.dispatchEvent(new CustomEvent(event_enable_fps_display)); else document.dispatchEvent(new CustomEvent(event_disable_fps_display));});
	$('#show_detecting_line').on('click', function(){if(this.checked) document.dispatchEvent(new CustomEvent(event_enable_contact_display)); else document.dispatchEvent(new CustomEvent(event_disable_contact_display));});

	$('#accordion').accordion({
		// Some code from Boaz@SO that archieves multiple opened panels for accordion.
        collapsible:true,
        beforeActivate: function(event, ui) {
             // The accordion believes a panel is being opened
            if (ui.newHeader[0]) {
                var currHeader  = ui.newHeader;
                var currContent = currHeader.next('.ui-accordion-content');
             // The accordion believes a panel is being closed
            } else {
                var currHeader  = ui.oldHeader;
                var currContent = currHeader.next('.ui-accordion-content');
            }
             // Since we've changed the default behavior, this detects the actual status
            var isPanelSelected = currHeader.attr('aria-selected') == 'true';
            
             // Toggle the panel's header
            currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));
            
            // Toggle the panel's icon
            currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e',isPanelSelected).toggleClass('ui-icon-triangle-1-s',!isPanelSelected);
            
             // Toggle the panel's content
            currContent.toggleClass('accordion-content-active',!isPanelSelected)    
            if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }

            return false; // Cancels the default action
        }
    });

	$('#gravity_slider').slider({value:10, min:0, max:20, step:0.1, slide:function(event, ui){$("#gravity").val(ui.value);}});
	$('#gravity').val($('#gravity_slider').slider("value"));

	$('#restituition_slider').slider({value:0.0, min:0, max:1, step:0.01, slide:function(event, ui){$('#restituition').val(ui.value);}});
	$('#restituition').val($('#restituition_slider').slider("value"));


	$('#slider').slider({value:3, min:1, max:10, step:1, slide: function(event, ui){$("#iteration").val(ui.value);}});
	$( "#iteration" ).val( $( "#slider" ).slider( "value" ) );

	$("#modes").buttonset();
});


