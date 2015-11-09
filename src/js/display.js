/**
 * Display page Javascript functions.
 *
 * @package status
 */

jQuery(function($) {

	// Map section.
	var map = new Map( $, "map" );
	$( "#map" ).toggle( "fade", {}, 300 );

	// User Profile section.
	(function () {
		$.ajax( statusConfig.ajaxurl, {
			"type" : "post",
			"data" : {
				"action" : "status.get_profile"
			},
			"success" : function(data) {
				var image = $( "<div><img src=\"" + data.profile_image_url + "\" /></div>" );
				var details = $("<div><ul><li><b>You:</b> @" + data.screen_name
					+ "</li><li><b>Location:</b> " + data.location
					+ "</li><li><b>Timezone:</b> " + data.time_zone
					+ "</li><li><b>Following:</b> " + data.friends_count
					+ "</li><li><b>Followers:</b> " + data.followers_count
					+ "</li><li><b>Tweets:</b> " + data.statuses_count
				+ "</li></ul></div>");
				$( "#profile" ).prepend( image )
					.prepend( details ).toggle( "fade", {}, 300 );
			}
		});
	}) ();

	// Timeline section.
	var timeline;
	(function () {
		Status.JS.getTweets( function(tweets) {
			$.each( tweets, function(i, o) {
				o.type = "tweet";
			});
			Status.JS.getMentions( function(mentions) {
				$.each( mentions, function(i, o) {
					o.type = "mention";
				});
				var data = tweets.concat( mentions );
				var start = new Date();
				$.each( data, function(i, o) {
					o.date = new Date( Date.parse( o.created_at ) );
					if (o.date.getTime() < start.getTime()) {
						start = o.date;
					}
				} );
				timeline = new Timeline( $( "#timeline" ), start, data, true );
				$( "#timeline" ).toggle( "fade", {}, 300 );
				timeline.redraw()();
				map.displayTweets( data );
			});
		})
	}) ();

	$( Status ).bind( "status.tweet.select", function( event, tweet ) {
		$( profile ).children( ".tweet-info" ).remove();
		$( profile ).append( Status.HTML.renderTweet( tweet ) );
	} );

	$( Status ).bind( "status.tweet.map.select" , function( event, tweet ) {
		$( profile ).children( ".tweet-info" ).remove();
		$( profile ).append( Status.HTML.renderTweet( tweet ) );
		var s = $( ".selected" ).get( 0 );
		if ( s ) {
			d3.select( s ).classed( "selected", false );
		}
		d3.select( $( "#tweet-" + tweet.id_str ).get( 0 ) ).classed( "selected", true );
		var domain = timeline.x.domain();
		var range = moment.range( domain[0], domain[1] );
		var diff = parseInt( range.diff( "milliseconds" ) / 2 );
		var center = moment( tweet.date );
		var start = center.clone().subtract( diff, "milliseconds" );
		var end = center.clone().add( diff, "milliseconds" );
		timeline.x.domain( [ start.toDate(), end.toDate() ] );
		timeline.redraw()();
	} );

});
