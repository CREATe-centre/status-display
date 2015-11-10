var Status = Status || {};

Status.Profile = Status.Profile || {};

Status.Profile.get = function( $, success ) {
	$.ajax( statusConfig.ajaxurl, {
		"type" : "post",
		"data" : { "action" : "status.get_profile" },
		"success" : success
	} );
};

Status.Profile.draw = function( $, data ) {
	var image = $( "<img src=\"" + data.profile_image_url + "\" class=\"profile-image\" />" );
	var details = $("<ul><li><b>You:</b> @" + data.screen_name
		+ "</li><li><b>Location:</b> " + data.location
		+ "</li><li><b>Timezone:</b> " + data.time_zone
		+ "</li><li><b>Following:</b> " + data.friends_count
		+ "</li><li><b>Followers:</b> " + data.followers_count
		+ "</li><li><b>Tweets:</b> " + data.statuses_count
	+ "</li></ul>");
	return [ image, details ];
};
