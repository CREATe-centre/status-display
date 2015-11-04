/**
 * Display page Javascript functions.
 *
 * @package status
 */

jQuery(function($) {

	// User Profile section.
	(function () {
		$.ajax( statusConfig.ajaxurl, {
			"type" : "post",
			"data" : {
				"action" : "status.get_profile"
			},
			"success" : function(data) {
				var image = $( "<div><img src=\"" + data.profile_image_url + "\" /></div>" );
				var details = $("<div><ul><li>@" + data.screen_name
					+ "</li><li>Location: " + data.location
					+ "</li><li>Timezone: " + data.time_zone
					+ "</li><li>Following: " + data.friends_count
					+ "</li><li>Followers: " + data.followers_count
					+ "</li><li>Tweets: " + data.statuses_count
				+ "</li></ul></div>");
				$( "#profile" ).empty().append( image )
					.append( details ).toggle( "fade", {}, 300 );
			}
		});
	}) ();

	// Timeline section.
	(function () {
		$.ajax(statusConfig.ajaxurl, {
			"type" : "post",
			"data" : {
				"action" : "status.get_tweets"
			},
			"success" : function(data) {
				var start = new Date();
				$.each( data, function(i, o) {
					o.date = new Date( Date.parse( o.created_at ) );
					if (o.date.getTime() < start.getTime()) {
						start = o.date;
					}
				} );
				var tl = new Timeline( $( "#timeline" ), start, data, true );
				$( "#timeline" ).toggle( "fade", {}, 300 );
				tl.redraw()();
			}
		});
	}) ();

	// Map section.
	(function () {
		new MapClass( "map", null );
		$( "#map" ).toggle( "fade", {}, 300 );
	} ) ();

	$( Status ).bind( "status.tweet.mouseover", function( event, tweet ) {
		$( profile ).children( ".tweet-info" ).remove();
		$( profile ).append( Status.HTML.renderTweet( tweet ) );
	} )

});
