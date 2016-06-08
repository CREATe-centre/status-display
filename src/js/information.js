/**
 * Tweet information rendering functions.

 * @package status
 */

var Status = Status || {};

Status.Information = Status.Information || {};

Status.Information.Display = function( $, container ) {
	var self = this;

	this.$ = $;
	this.container = container;

	$( Status ).bind( "status.timeline.visualisation.tweet-selected", function( event, tweet ) {
		self.displayTweet( tweet );
	} );
	$( Status ).bind( "status.map.googlemap.tweet-selected", function( event, tweet ) {
		self.displayTweet( tweet );
	} );

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

Status.Information.Display.prototype.displayNormalTweet = function( tweet ) {
	var self = this;
	this.container.html( "<h3>SELECTED NODE</h3><ul><li><b>Type</b>: Tweet</li><li><b>Text</b>: "
		+ this.renderText( tweet.data.text )
		+ "</li><li><b>Date:</b> "
		+ this.renderDate( tweet.date )
		+ "</li>"
		+ (tweet.in_reply_to_screen_name
				? "<li>Sent in reply to <b><a href=\"https://twitter.com/"
						+ tweet.in_reply_to_screen_name + "\" target=\"_blank\">@"
						+ tweet.in_reply_to_screen_name + "</a></b></li>"
				: "")
	+ "</ul>");
};

Status.Information.Display.prototype.displayMention = function( tweet ) {
	this.container.html( "<h3>SELECTED NODE</h3><ul><li><b>Type</b>: Mention</li><li><b>Text</b>: "
		+ this.renderText( tweet.data.text )
		+ "</li><li><b>Date:</b> "
		+ this.renderDate( tweet.date )
		+ "</li><li>Sent by <b><a href=\"https://twitter.com/"
		+ tweet.data.user.screen_name + "\" target=\"_blank\">@"
		+ tweet.data.user.screen_name
	+ "</a></b></li></ul>" );
};

Status.Information.Display.prototype.displayRetweet = function( tweet ) {
	var type = "Retweet";
	if ( tweet.event == "RETWEET" ) {
		type = "Retweet";
	} else if ( tweet.event == "FRIEND_RETWEET" ) {
		type = "Retweet by Friend";
	} else if ( tweet.event == "FRIEND_OF_FRIEND_RETWEET" ) {
		type = "Retweet by Friend of a Friend";
	}
	this.container.html( "<h3>SELECTED NODE</h3><ul><li><b>Type</b>: "
		+ type + "</li><li><b>Text</b>: "
		+ this.renderText( tweet.data.text )
		+ "</li><li><b>Date:</b> "
		+ this.renderDate( tweet.date )
		+ "</li><li>Retweeted by <b><a href=\"https://twitter.com/"
		+ tweet.data.user.screen_name + "\" target=\"_blank\">@"
		+ tweet.data.user.screen_name
	+ "</a></b></li></ul>" );
};

Status.Information.Display.prototype.displayFavourited = function( tweet ) {
	var type = "Tweet You Favourited";
	var status = tweet.data.status;
	var screen_name = "";
	if (tweet.event == "YOU_FAVOURITED") {
		type = "Tweet You Favourited";
		screen_name = tweet.data.targetUserName;
	} else if (tweet.event == "YOU_UNFAVOURITED") {
		type = "Tweet You Unfavourited";
		screen_name = tweet.data.targetUserName;
	} else if (tweet.event == "FAVOURITED_YOU") {
		type = "Your Tweet Was Favourited";
		screen_name = tweet.data.sourceName;
	} else if (tweet.event == "UNFAVOURITED_YOU") {
		type = "Your Tweet Was Unfavourited";
		screen_name = tweet.data.sourceName;
	} else if (tweet.event == "FAVOURITED_RETWEET") {
		type = "Your Retweet Was Favourited";
		screen_name = tweet.data.sourceName;
	}
	this.container.html( "<h3>SELECTED NODE</h3><ul><li><b>Type</b>: "
		+ type + "</li><li><b>Text</b>: "
			+ this.renderText( status.text )
			+ "</li><li><b>Date:</b> "
			+ this.renderDate( tweet.date )
			+ "</li><li>By <b><a href=\"https://twitter.com/"
			+ screen_name + "\" target=\"_blank\">@"
			+ screen_name
	+ "</a></b></li></ul>" );
}

Status.Information.Display.prototype.displayFollowed = function( tweet ) {
	var text = "";
	if (tweet.event == "YOU_FOLLOWED") {
		text = "You started following <b><a href=\"https://twitter.com/"
				+ tweet.data.followedUserName + "\" target=\"_blank\">@"
				+ tweet.data.followedUserName
				+ "</a></b>";
	} else if (tweet.event == "YOU_UNFOLLOWED") {
		text = "Your stopped following <b><a href=\"https://twitter.com/"
				+ tweet.data.unfollowedUserName + "\" target=\"_blank\">@"
				+ tweet.data.unfollowedUserName
				+ "</a></b>";
	} else if (tweet.event == "FOLLOWED_YOU") {
		text = "<b><a href=\"https://twitter.com/"
				+ tweet.data.sourceName + "\" target=\"_blank\">@"
				+ tweet.data.sourceName
				+ "</a></b> started following you";
	}
	this.container.html( "<h3>SELECTED NODE</h3><ul><li>"
	+ text + "</li></ul>" );
}

Status.Information.Display.prototype.displayQuotedTweet = function( tweet ) {
	var type = "Quoted Tweet";
	this.container.html( "<h3>SELECTED NODE</h3><ul><li><b>Type</b>: "
		+ type + "</li><li><b>Text</b>: "
		+ this.renderText( tweet.data.status.text )
		+ "</li><li><b>Quoted Text</b>: "
		+ this.renderText( tweet.data.status.quoted_status.text ) + "</li><li><b>Date:</b> "
		+ this.renderDate( tweet.date )
		+ "</li><li>Quoted by <b><a href=\"https://twitter.com/"
		+ tweet.data.sourceName + "\" target=\"_blank\">@"
		+ tweet.data.sourceName
	+ "</a></b></li></ul>" );
}

Status.Information.Display.prototype.displayBlock = function( tweet ) {
	var type = "Block";
	this.container.html( "<h3>SELECTED NODE</h3><ul><li><b>Type</b>: "
		+ type + "</li><li>You blocked "
		+ this.renderText( "@" + tweet.data.blockedUserName )
		+ "</li></ul>" );
}

Status.Information.Display.prototype.displayUnblock = function( tweet ) {
	var type = "Block";
	this.container.html( "<h3>SELECTED NODE</h3><ul><li><b>Type</b>: "
		+ type + "</li><li>You unblocked "
		+ this.renderText( "@" + tweet.data.unblockedUserName )
		+ "</li></ul>" );
}

Status.Information.Display.prototype.displayTweet = function( tweet ) {
	this.container.empty();
	if ( tweet.event == "TWEET" ) {
		this.displayNormalTweet( tweet );
	} else if ( tweet.event == "MENTION" ) {
		this.displayMention( tweet );
	} else if ( tweet.event == "RETWEET"
			|| tweet.event == "FRIEND_RETWEET"
			|| tweet.event == "FRIEND_OF_FRIEND_RETWEET" ) {
		this.displayRetweet( tweet );
	} else if ( tweet.event == "YOU_FAVOURITED"
			|| tweet.event == "YOU_UNFAVOURITED"
			|| tweet.event == "FAVOURITED_YOU"
			|| tweet.event == "UNFAVOURITED_YOU"
			|| tweet.event == "FAVOURITED_RETWEET") {
		this.displayFavourited( tweet );
	} else if (tweet.event == "YOU_FOLLOWED"
			|| tweet.event == "YOU_UNFOLLOWED"
			|| tweet.event == "FOLLOWED_YOU") {
		this.displayFollowed( tweet );
	} else if (tweet.event == "QUOTED_TWEET") {
		this.displayQuotedTweet( tweet );
	} else if (tweet.event == "BLOCK") {
		this.displayBlock( tweet );
	} else if (tweet.event == "UNBLOCK") {
		this.displayUnblock( tweet );
	} else {
		console.log( "Don't know how to render event type '" + tweet.event + "'" );
	}
};
