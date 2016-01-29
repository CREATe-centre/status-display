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
	if ( tweet.type == "RETWEET" ) {
		type = "Retweet";
	} else if ( tweet.type == "RETWEET" ) {
		type = "Retweet by Friend";
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

Status.Information.Display.prototype.displayTweet = function( tweet ) {
	this.container.empty();
	if ( tweet.event == "TWEET" ) {
		this.displayNormalTweet( tweet );
	} else if ( tweet.event == "MENTION" ) {
		this.displayMention( tweet );
	} else if ( tweet.event == "RETWEET" || tweet.event == "FRIEND_RETWEET" ) {
		this.displayRetweet( tweet );
	} else {
		console.log( "Dont know how to render " + tweet.event );
	}
};
