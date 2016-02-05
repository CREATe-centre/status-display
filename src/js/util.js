var Status = Status || {};

Status.Util = Status.Util || {};

Status.Util.getTweets = function( $, count, callback ) {
	$.ajax(statusConfig.ajaxurl, {
		"type" : "post",
		"data" : {
			"action" : "status.get_tweets",
			"verify" : statusConfig.verify,
			"count" : count
		},
		"success" : callback
	});
};

Status.Util.getMentions = function( $, count, callback ) {
	$.ajax(statusConfig.ajaxurl, {
		"type" : "post",
		"data" : {
			"action" : "status.get_mentions",
			"verify" : statusConfig.verify,
			"count" : count
		},
		"success" : callback
	});
};

Status.Util.getRetweets = function( $, tweet, count, callback ) {
	$.ajax(statusConfig.ajaxurl, {
		"type" : "post",
		"data" : {
			"action" : "status.get_retweets",
			"verify" : statusConfig.verify,
			"count" : count,
			"tweet_id" : tweet.id_str
		},
		"success" : callback
	});
};

Status.Util.getTimeline = function( $, callback ) {
	$.ajax(statusConfig.ajaxurl, {
		"type" : "post",
		"data" : {
			"action" : "status.get_timeline",
			"verify" : statusConfig.verify
		},
		"success" : callback
	});
};

Status.Util.parseCreatedAt = function( createdAt ) {
	return moment( createdAt, "YYYY-MM-DD HH:mm:ss" ).toDate();
};

Status.Util.parseTwitterCreatedAt = function( createdAt ) {
	return moment( createdAt, "ddd MMM DD HH:mm:ss ZZ YYYY" ).toDate();
};

Status.Util.getID = function( tweet ) {
	var id_end = "";
	if (tweet.event == "TWEET"
		|| tweet.event == "MENTION"
		|| tweet.event == "RETWEET"
		|| tweet.event == "FRIEND_RETWEET"
		|| tweet.event == "FRIEND_OF_FRIEND_RETWEET"
		|| tweet.event == "FAVOURITED_RETWEET") {
		id_end = tweet.data.id_str;
	} else if (tweet.event == "YOU_FAVOURITED"
		|| tweet.event == "YOU_UNFAVOURITED"
		|| tweet.event == "FAVOURITED_YOU"
		|| tweet.event == "UNFAVOURITED_YOU") {
		id_end = tweet.data.status.id_str;
	} else {
		console.log( "Don't know how to generate ID for event '" + tweet.event + "'" );
	}
	return tweet.event + "-" + id_end;
}
