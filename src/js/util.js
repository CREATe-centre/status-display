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

Status.Util.parseCreatedAt = function( createdAt ) {
	return moment( createdAt, "ddd MMM DD HH:mm:ss ZZ YYYY" ).toDate();
};
