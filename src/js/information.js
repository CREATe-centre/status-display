/**
 * Tweet information rendering functions.

 * @package status
 */

var Status = Status || {};

Status.Information = Status.Information || {};

Status.Information.Display = function() {
};

Status.Information.Display.prototype.renderText = function( text ) {
	return text
		.replace( /(^|\s)#(\S*)/g,
		"$1<a href=\"https://twitter.com/hashtag/$2\" target=\"_blank\">#$2</a>" )
		.replace( /(^|\s)@([a-zA-Z0-9]*)/g,
		"$1<a href=\"https://twitter.com/$2\" target=\"_blank\">@$2</a>" )
		.replace( /(^|\s)http(\S*)/g,
		"$1<a href=\"http$2\" target=\"_blank\">http$2</a>" )
		.replace( /(^|\s)(@\S*)/g, "$1<b>$2</b>" );
};

Status.Information.Display.prototype.renderDate = function( date ) {
	return moment( date ).format( "DD/MM/YY HH:mm:ss (Z)" );
};

Status.Information.Display.prototype.createNormalTweet = function( tweet ) {
	return "<div class=\"information-display\"><ul><li><b>Text</b>: "
		+ this.renderText( tweet.data.text )
		+ "</li><li><b>Date:</b> "
		+ this.renderDate( tweet.date )
		+ "</li>"
		+ (tweet.in_reply_to_screen_name
				? "<li>Sent in reply to <b><a href=\"https://twitter.com/"
						+ tweet.in_reply_to_screen_name + "\" target=\"_blank\">@"
						+ tweet.in_reply_to_screen_name + "</a></b></li>"
				: "")
		+ ( tweet.analytics == null ? ""
				: "<li><b>Impressions:</b> " + tweet.analytics.impressions + "</li><li><b>Engagements:</b> "
				+ tweet.analytics.engagements + "</li><li><b>Engagement rate:</b> "
				+ ( ( tweet.analytics.engagements / tweet.analytics.impressions) * 100 ).toFixed( 2 ) + "%</li><li><b>Retweets:</b> "
				+ tweet.analytics.retweets + "</li><li><b>Replies:</b> "
				+ tweet.analytics.replies + "</li><li><b>Likes:</b> "
				+ tweet.analytics.likes + "</li><li><b>User profile clicks:</b> "
				+ tweet.analytics.user_profile_clicks + "</li><li><b>URL clicks:</b> "
				+ tweet.analytics.url_clicks + "</li><li><b>Hashtag clicks:</b> "
				+ tweet.analytics.hashtag_clicks + "</li><li><b>Detail expands:</b> "
				+ tweet.analytics.detail_expands + "</li><li><b>Permalink clicks:</b> "
				+ tweet.analytics.permalink_clicks + "</li>")
	+ "</ul></div>";
};

Status.Information.Display.prototype.createMention = function( tweet ) {
	return "<div class=\"information-display\"><ul><li><b>Text</b>: "
		+ this.renderText( tweet.data.text )
		+ "</li><li><b>Date:</b> "
		+ this.renderDate( tweet.date )
		+ "</li><li>Sent by <b><a href=\"https://twitter.com/"
		+ tweet.data.user.screen_name + "\" target=\"_blank\">@"
		+ tweet.data.user.screen_name
	+ "</a></b></li></ul></div>";
};

Status.Information.Display.prototype.createRetweet = function( tweet ) {
	return "<div class=\"information-display\"><ul><li><b>Text</b>: "
		+ this.renderText( tweet.data.text )
		+ "</li><li><b>Date:</b> "
		+ this.renderDate( tweet.date )
		+ "</li><li>Retweeted by <b><a href=\"https://twitter.com/"
		+ tweet.data.user.screen_name + "\" target=\"_blank\">@"
		+ tweet.data.user.screen_name
	+ "</a></b></li></ul></div>";
};

Status.Information.Display.prototype.createFavourited = function( tweet ) {
	var status = tweet.data.status;
	var screen_name = "";
	if (tweet.event == "YOU_FAVOURITED") {
		screen_name = tweet.data.targetUserName;
	} else if (tweet.event == "YOU_UNFAVOURITED") {
		screen_name = tweet.data.targetUserName;
	} else if (tweet.event == "FAVOURITED_YOU") {
		screen_name = tweet.data.sourceName;
	} else if (tweet.event == "UNFAVOURITED_YOU") {
		screen_name = tweet.data.sourceName;
	} else if (tweet.event == "FAVOURITED_RETWEET") {
		screen_name = tweet.data.sourceName;
	}
	return "<div class=\"information-display\"><ul><li><b>Text</b>: "
			+ this.renderText( status.text )
			+ "</li><li><b>Date:</b> "
			+ this.renderDate( tweet.date )
			+ "</li><li>By <b><a href=\"https://twitter.com/"
			+ screen_name + "\" target=\"_blank\">@"
			+ screen_name
	+ "</a></b></li></ul></div>";
}

Status.Information.Display.prototype.createFollowed = function( tweet ) {
	var text = "";
	if (tweet.event == "YOU_FOLLOWED") {
		text = "You started following <b><a href=\"https://twitter.com/"
				+ tweet.data.followedUserName + "\" target=\"_blank\">@"
				+ tweet.data.followedUserName
				+ "</a></b>";
	} else if (tweet.event == "YOU_UNFOLLOWED") {
		text = "You stopped following <b><a href=\"https://twitter.com/"
				+ tweet.data.unfollowedUserName + "\" target=\"_blank\">@"
				+ tweet.data.unfollowedUserName
				+ "</a></b>";
	} else if (tweet.event == "FOLLOWED_YOU") {
		text = "<b><a href=\"https://twitter.com/"
				+ tweet.data.sourceName + "\" target=\"_blank\">@"
				+ tweet.data.sourceName
				+ "</a></b> started following you";
	}
	return "<div class=\"information-display\"><ul><li>"
	+ text + "</li></ul></div>";
}

Status.Information.Display.prototype.createQuotedTweet = function( tweet ) {
	return "<div class=\"information-display\"><ul><li><b>Text</b>: "
		+ this.renderText( tweet.data.status.text )
		+ "</li><li><b>Quoted Text</b>: "
		+ this.renderText( tweet.data.status.quoted_status.text ) + "</li><li><b>Date:</b> "
		+ this.renderDate( tweet.date )
		+ "</li><li>Quoted by <b><a href=\"https://twitter.com/"
		+ tweet.data.sourceName + "\" target=\"_blank\">@"
		+ tweet.data.sourceName
	+ "</a></b></li></ul></div>";
}

Status.Information.Display.prototype.createBlock = function( tweet ) {
	return "<div class=\"information-display\"><ul><li>You blocked "
		+ this.renderText( "@" + tweet.data.blockedUserName )
	+ "</li></ul></div>";
}

Status.Information.Display.prototype.createUnblock = function( tweet ) {
	return "<div class=\"information-display\"><ul><li>You unblocked "
		+ this.renderText( "@" + tweet.data.unblockedUserName )
	+ "</li></ul>";
}

Status.Information.Display.prototype.createTweet = function( tweet ) {
	if ( tweet.event == "TWEET" ) {
		return this.createNormalTweet( tweet );
	} else if ( tweet.event == "MENTION" ) {
		return this.createMention( tweet );
	} else if ( tweet.event == "RETWEET"
			|| tweet.event == "FRIEND_RETWEET"
			|| tweet.event == "FRIEND_OF_FRIEND_RETWEET" ) {
		return this.createRetweet( tweet );
	} else if ( tweet.event == "YOU_FAVOURITED"
			|| tweet.event == "YOU_UNFAVOURITED"
			|| tweet.event == "FAVOURITED_YOU"
			|| tweet.event == "UNFAVOURITED_YOU"
			|| tweet.event == "FAVOURITED_RETWEET") {
		return this.createFavourited( tweet );
	} else if (tweet.event == "YOU_FOLLOWED"
			|| tweet.event == "YOU_UNFOLLOWED"
			|| tweet.event == "FOLLOWED_YOU") {
		return this.createFollowed( tweet );
	} else if (tweet.event == "QUOTED_TWEET") {
		return this.createQuotedTweet( tweet );
	} else if (tweet.event == "BLOCK") {
		return this.createBlock( tweet );
	} else if (tweet.event == "UNBLOCK") {
		return this.createUnblock( tweet );
	} else {
		console.log( "Don't know how to render event type '" + tweet.event + "'" );
		return "";
	}
};
