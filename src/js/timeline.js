var Status = Status || {};

Status.JS = Status.JS || {};

Status.JS.getTweets = function( callback ) {
	jQuery.ajax(statusConfig.ajaxurl, {
		"type" : "post",
		"data" : {
			"action" : "status.get_tweets"
		},
		"success" : callback
	});
};

Status.JS.getMentions = function( callback ) {
	jQuery.ajax(statusConfig.ajaxurl, {
		"type" : "post",
		"data" : {
			"action" : "status.get_mentions"
		},
		"success" : callback
	});
};

Status.JS.getRetweets = function( tweet, callback ) {
	jQuery.ajax(statusConfig.ajaxurl, {
		"type" : "post",
		"data" : {
			"action" : "status.get_retweets",
			"verify" : statusConfig.verify,
			"tweet_id" : tweet.id_str
		},
		"success" : callback
	});
};

Status.HTML = Status.HTML || {};

Status.HTML.renderTweetText = function( text ) {
	return text
		.replace( /(^|\s)#(\S*)/g, "$1<a href=\"https://twitter.com/hashtag/$2\" target=\"_blank\">#$2</a>" )
		.replace( /(^|\s)http(\S*)/g, "$1<a href=\"http$2\" target=\"_blank\">http$2</a>" )
		.replace( /(^|\s)(@\S*)/g, "$1<b>$2</b>" );
};

Status.HTML.renderTweetDate = function( date ) {
	var d = moment( date, "ddd MMM DD HH:mm:ss ZZ YYYY" );
	return d.format( "DD/MM/YY HH:mm:ss (Z)" );
}

Status.HTML.renderTweet = function( tweet ) {
	var d = jQuery( document.createElement( "div" ) );
	d.addClass( "tweet-info" );
	if ( tweet.type == "tweet" ) {
		d.html( "<ul><li><b>Text</b>: " + Status.HTML.renderTweetText( tweet.text )
			+ "</li><li><b>Date:</b> "
			+ Status.HTML.renderTweetDate( tweet.created_at ) + "</li><li><b>Retweeted:</b> "
			+ tweet.retweet_count + "</li><li><b>Favourited:</b> "
			+ tweet.favorite_count + "</li>"
			+ (tweet.in_reply_to_screen_name
				? "<li>Sent in reply to <b>@"
						+ tweet.in_reply_to_screen_name + "</b></li>"
				: "")
		+ "</ul>");
	} else if ( tweet.type == "mention" ) {
		d.html( "<ul><li><b>Text</b>: " + Status.HTML.renderTweetText( tweet.text )
			+ "</li><li><b>Date:</b> "
			+ Status.HTML.renderTweetDate( tweet.created_at )
		+ "</li><li>Sent by <b>@" + tweet.user.screen_name + "</b></li></ul>" );
	}
	return d;
};

Status.SVG = Status.SVG || {};

Status.SVG.renderTweet = function( tweet ) {
	var radius = 10;
	var g = d3.select( document.createElementNS( 'http://www.w3.org/2000/svg', 'g' ) )
		.attr( "class", tweet.type + " timeline-data" );
	g.append( "rect" )
		.attr( "width", "100px" )
		.attr( "height", "50px" )
		.attr( "rx", "10px" )
		.attr( "ry", "10px" );
	g.append( "text" )
		.attr( "dy", "15px" )
		.attr( "x", "10px" )
		.attr( "y", "0px" )
		.text( tweet.text.length <= 40
			? tweet.text
		: tweet.text.substring( 0, 37 ) + "..." );

	if ( tweet.type == "tweet" ) {
		g.append( "text" )
			.attr( "dy", "15px" )
			.attr( "x", "10px" )
			.attr( "y", "15px" )
			.text( "Retweeted: " + tweet.retweet_count );
		g.append( "text" )
			.attr( "dy", "15px" )
			.attr( "x", "10px" )
			.attr( "y", "30px" )
			.text( "Favourited: " + tweet.favorite_count );
	} else if ( tweet.type == "mention" ) {
		g.append( "text" )
			.attr( "dy", "15px" )
			.attr( "x", "10px" )
			.attr( "y", "15px" )
			.text( "Sent by: @" + tweet.user.screen_name );
	}
	g.append( "title" ).text( tweet.text );
	g.on( "click", function( d ) {
		var s = jQuery( ".selected" ).get( 0 );
		if ( s ) {
			d3.select( s ).classed( "selected", false );
		}
		g.classed( "selected", true );
		jQuery( Status ).trigger( "status.tweet.mouseover", d );
	} );
	return g.node();
};

Timeline = function(container, start, tweets) {

	var self = this;

	this.container = container;
	this.tweets = tweets;
	this.padding = 20;

	this.x = d3.time.scale.utc()
		.domain( [ start, new Date() ] );

	this.chart = d3.select( container.get( 0 ) )
		.append( "svg" )
		.attr( "class", "timeline" );

	this.chart.append( "defs" )
		.append( "filter" )
		.attr( "id", "blur" )
		.append( "feGaussianBlur" )
		.attr( "stdDeviation", 1 );

	this.canvas = this.chart
		.append( "g" )
		.attr( "transform", "translate( "
		+ this.padding + "," + this.padding + ")" );

	jQuery( window ).resize(function() {
		self.redraw()();
	})
};

Timeline.prototype.update = function() {
	var self = this;
	var tweets = self.canvas
		.selectAll( "g.timeline-data" )
		.data( self.tweets );
	tweets.enter().append( Status.SVG.renderTweet )
		.each( function( d ) {
			d3.select( this ).selectAll( "rect" )
				.attr( "width", this.getBBox().width + 10 );
		} );
	var count = parseInt( (self.container.height() - (self.padding * 2)) / 55 );
	tweets.attr( "transform", function( d, i ) {
		return "translate(" + self.x( d.date ) + ","
				+ ((i % count) * 55) + ")";
	} );
	tweets.exit().remove();
}

Timeline.prototype.redraw = function() {
	var self = this;
	return function() {

		var cx = self.container.width();
		var cy = self.container.height();
		var width = cx - (self.padding * 2);
		var height = cy - (self.padding * 2);

		var tx = function( d ) {
			return "translate(" + self.x( d ) + ",0)";
		};

		var fx = self.x.tickFormat( 10 );

		self.chart
			.attr( "width", cx )
			.attr( "height", cy );

		self.x.range( [ 0, width ] )

		var gx = self.canvas.selectAll( "g.x" )
			.data( self.x.ticks( 10 ), String )
			.attr( "transform", tx );

		gx.select( "text" )
			.text( fx )
			.attr( "y", height );

		gx.select( "line" )
			.attr( "y1", 0 )
			.attr( "y2", height );

		var gxe = gx.enter().insert( "g", ":first-child" )
			.attr( "class", "x" )
			.attr( "transform", tx );

		gxe.append( "line" )
			.attr( "y1", 0 )
			.attr( "y2", height );

		gxe.append( "text" )
			.attr( "class", "axis" )
			.attr( "y", height )
			.attr( "dy", "1em" )
			.attr( "text-anchor", "middle" )
			.text( fx );

		gx.exit().remove();

		self.chart.call(	d3.behavior.zoom()
				.x( self.x )
				.on( "zoom", self.redraw() ) );
		self.update();
	}
}
