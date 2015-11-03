/**
 * Display page Javascript functions.
 *
 * @package status
 */

jQuery(function($) {

	// User Profile section.
	(function () {
		$.ajax( status_config.ajaxurl, {
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
				$( "#profile_container" ).empty().append( image )
					.append( details ).toggle( "fade", {}, 300 );
			}
		});
	}) ();

	var display_single_tweet = function(tweet) {
		$( "#timeline" ).children().fadeTo( 300, 0.2 );
		$.ajax(status_config.ajaxurl, {
			"type" : "post",
			"data" : {
				"action" : "status.get_retweets",
				"tweet_id" : tweet.id_str,
				"verify" : status_config.verify
			},
			"success" : function(data) {
				var start_date = new Date();
				$.each( data, function(i, o) {
					o.date = new Date( Date.parse( o.created_at ) );
					o.display = function() {
						display_single_tweet( o );
					};
					if (o.date.getTime() < start_date.getTime()) {
						start_date = o.date;
					}
				} );
				new Timeline( $( "#timeline" ), start_date, data, false );

			}
		});
	};

	// Timeline section.
	(function () {
		$.ajax(status_config.ajaxurl, {
			"type" : "post",
			"data" : {
				"action" : "status.get_tweets"
			},
			"success" : function(data) {
				var start_date = new Date();
				$.each( data, function(i, o) {
					o.date = new Date( Date.parse( o.created_at ) );
					o.display = function() {
						display_single_tweet( o );
					};
					if (o.date.getTime() < start_date.getTime()) {
						start_date = o.date;
					}
				} );
				new Timeline( $( "#timeline" ), start_date, data, true );
				$( "#timeline" ).toggle( "fade", {}, 300 );
			}
		});
	}) ();
});
