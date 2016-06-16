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
	if( tweet.db_id ) {
		return "tweet-data-node-" + String(tweet.db_id);
	} else {
		return "tweet-data-node-" + tweet.toString();
	}
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
		case "BLOCK": return "You blocked a user";
		case "UNBLOCK": return "You unblocked a user";
		default: return "";
	}
}

Status.Util.TWEET_TYPES = [
	"MENTION",
	"QUOTED_TWEET",
	"RETWEET",
	"FRIEND_RETWEET",
	"FRIEND_OF_FRIEND_RETWEET",
	"YOU_FAVOURITED",
	"YOU_UNFAVOURITED",
	"TWEET",
	"FAVOURITED_YOU",
	"UNFAVOURITED_YOU",
	"FAVOURITED_RETWEET",
	"YOU_FOLLOWED",
	"FOLLOWED_YOU",
	"YOU_UNFOLLOWED",
	"BLOCK",
	"UNBLOCK" ];
