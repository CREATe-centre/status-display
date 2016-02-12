/**
 * Utility functions.

 * @package status
 */

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
	} else if (tweet.event == "YOU_FOLLOWED") {
		id_end = tweet.data.followedUserId;
	} else if (tweet.event == "YOU_UNFOLLOWED") {
		id_end = tweet.data.unfollowedUserId;
	} else if (tweet.event == "FOLLOWED_YOU") {
		id_end = tweet.data.sourceId;
	} else if (tweet.event == "QUOTED_TWEET") {
		id_end = tweet.data.sourceId + "-" + tweet.data.status.id_str;
	} else if (tweet.event == "RETWEETED_RETWEET") {
		id_end = tweet.data.sourceId + "-" + tweet.data.status.id_str;
	} else {
		console.log( "Don't know how to generate ID for event '" + tweet.event + "'" );
	}
	return tweet.event + "-" + id_end;
}

Status.Util.getEventTypeDesc = function( eventType ) {
	switch ( eventType ) {
		case "TWEET": return "Tweet";
		case "MENTION": return "Mention";
		case "RETWEET": return "General Retweet";
		case "FRIEND_RETWEET": return "Retweet by a Friend";
		case "FRIEND_OF_FRIEND_RETWEET": return "Retweet by a Friend of a Friend";
		case "FAVOURITED_RETWEET": return "";
		case "YOU_FAVOURITED": return "Tweet You Favourited";
		case "YOU_UNFAVOURITED": return "Tweet You Unfavourited";
		case "FAVOURITED_YOU": return "Your Tweet Was Favourited";
		case "UNFAVOURITED_YOU": return "Your Tweet Was Unfavourited";
		case "YOU_FOLLOWED": return "You Started Following";
		case "YOU_UNFOLLOWED": return "You Stopped Following";
		case "FOLLOWED_YOU": return "Started Following You";
		case "QUOTED_TWEET": return "Quoted Tweet";
		case "FAVOURITED_RETWEET": return "Your Retweet Was Favourited";
		default: return "";
	}
}
