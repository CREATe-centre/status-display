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
				var tl = new Timeline( $( "#timeline" ), start, data, true );
				$( "#timeline" ).toggle( "fade", {}, 300 );
				tl.redraw()();
			});
		})
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
