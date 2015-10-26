/**
 * Display page Javascript functions.
 *
 * @package status
 */

jQuery(function($) {

	// User Profile section.
	function update_user_profile() {
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
				$( "#profile_container" ).empty().append( image ).append( details );
			}
		});
	};
	// update_user_profile();

	// Timeline section.
	function get_tweets() {
		$.ajax(status_config.ajaxurl, {
			"type" : "post",
			"data" : {
				"action" : "status.get_tweets"
			},
			"success" : function(data) {
				var tweets = [];
				$.each( data, function(i, o) {

				} );

			}
		});
	}
	// get_tweets();
});
