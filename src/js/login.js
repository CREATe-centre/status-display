/**
 * Login page Javascript functions.
 * @package status
 */

jQuery(function($) {
	
	$( ".logon_image" ).click(function() {
		$( ".logon_image" ).off( "click" );
		$( ".status_login" ).toggle("fade", {}, 200, function() {
			$( ".loading_image" ).toggle( "fade", {}, 300 );
		});
		$.ajax(status_config.ajaxurl, {
	        "type": "post",
			"data": {
	            "action": "status.login"
			},
			"success": function(data) { window.location.assign( data ); }
	      });
	});
	
	$( ".about_link" ).click(function() {
		$( "#about_page" ).modal();
	});
	
});
