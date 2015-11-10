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
		.replace( /(^|\s)http(\S*)/g,
		"$1<a href=\"http$2\" target=\"_blank\">http$2</a>" )
		.replace( /(^|\s)(@\S*)/g, "$1<b>$2</b>" );
};

Status.Information.Display.prototype.renderDate = function( date ) {
	return moment( date ).format( "DD/MM/YY HH:mm:ss (Z)" );
};

Status.Information.Display.prototype.displayNormalTweet = function( tweet ) {
	var self = this;
	this.container.html( "<ul><li><b>Text</b>: "
		+ this.renderText( tweet.text )
		+ "</li><li><b>Date:</b> "
		+ this.renderDate( tweet.date )
		+ "</li><li><b>Retweeted:</b> "
		+ tweet.retweet_count
		+ "</li><li><b>Favourited:</b> "
		+ tweet.favorite_count
		+ "</li>"
		+ (tweet.in_reply_to_screen_name
				? "<li>Sent in reply to <b>@"
						+ tweet.in_reply_to_screen_name + "</b></li>"
				: "")
	+ "</ul>");

	if ( tweet.retweet_count && tweet.retweet_count > 0 ) {
		var a = this.$( document.createElement( "a" ) );
		a.text( "View retweets" );
		a.attr( "href", "#" );
		a.on( "click", function() {
			self.$( Status ).trigger( "status.information.display.show-retweets", tweet );
		} );
		var li = this.$( document.createElement( "li" ) );
		li.append( a );
		this.container.children( "ul" ).append( li );
	}
};

Status.Information.Display.prototype.displayMention = function( tweet ) {
	this.container.html( "<ul><li><b>Text</b>: "
		+ this.renderText( tweet.text )
		+ "</li><li><b>Date:</b> "
		+ this.renderDate( tweet.date )
		+ "</li><li>Sent by <b>@"
		+ tweet.user.screen_name
	+ "</b></li></ul>" );
};

Status.Information.Display.prototype.displayTweet = function( tweet ) {
	this.container.empty();
	if ( tweet.type == "tweet" ) {
		this.displayNormalTweet( tweet );
	} else if ( tweet.type == "mention" ) {
		this.displayMention( tweet );
	}
};
