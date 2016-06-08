/**
 * Timeline rendering functions.

 * @package status
 */

var Status = Status || {};

Status.Timeline = Status.Timeline || {};

Status.Timeline.Visualisation = function( $, container, start, tweets ) {

	var self = this;

	this.$ = $;
	this.container = container;
	this.tweets = tweets;
	this.threaded_tweets = [];
	this.padding = 20;
	this.maxBoxHeight = 0;

	this.getTweetByID = function( id ) {
		var found = null;
		$.each( tweets, function( i, t ) {
			if ( t.id_str == id ) {
				found = t;
			}
		});
		return found;
	};

	this.x = d3.time.scale.utc()
		.domain( [ start, new Date() ] );

	this.display = d3.select( container.get( 0 ) ).append( "svg" );

	this.display.append( "defs" )
		.append( "filter" )
		.attr( "id", "blur" )
		.append( "feGaussianBlur" )
		.attr( "stdDeviation", 1 );

	this.canvas = this.display
		.append( "g" )
		.attr( "transform", "translate( "
		+ this.padding + "," + this.padding + ")" );

	$( window ).resize( self.redraw() );

	function selectTweet( tweet ) {
		d3.selectAll( ".timeline-element.selected" ).classed( "selected", false );
		d3.select( "#tweet-" + tweet.id ).classed( "selected", true );
	}

	$( Status ).bind( "status.map.googlemap.tweet-selected" , function( event, tweet ) {
		selectTweet( tweet );
		var domain = self.x.domain();
		var range = moment.range( domain[0], domain[1] );
		var diff = parseInt( range.diff( "milliseconds" ) / 2 );
		var center = moment( tweet.date );
		var start = center.clone().subtract( diff, "milliseconds" );
		var end = center.clone().add( diff, "milliseconds" );
		self.x.domain( [ start.toDate(), end.toDate() ] );
		self.redraw()();
	} );

	$( Status ).bind( "status.timeline.visualisation.tweet-selected" , function( event, tweet ) {
		selectTweet( tweet );
	} );

	$( Status ).trigger( "status.timeline.visualisation.created",  self );
};

Status.Timeline.Visualisation.prototype.renderTweet = function( self, tweet ) {
	var radius = 10;
	var g = d3.select( document.createElementNS( 'http://www.w3.org/2000/svg', 'g' ) )
		.attr( "class", tweet.event + " timeline-element" )
		.attr( "id", "tweet-" + tweet.id );
	var max = 45;
	var radius = max + (max - (max / Math.exp( tweet.incoming_edges.length )));
	g.append( "circle" )
		.attr( "r", radius + "px" );

	g.append( "title" ).text( Status.Util.getEventTypeDesc( tweet.event ) );
	g.on( "click", function( d ) {
		self.$( Status ).trigger( "status.timeline.visualisation.tweet-selected", d );
	} );
	return g.node();
};

Status.Timeline.Visualisation.prototype.update = function() {
	var self = this;
	var tweets = self.canvas
		.selectAll( "g.timeline-element" )
		.data( self.tweets );
	var threaded_tweets = this.threaded_tweets;
	tweets.enter()
		.append( function( d ) {
			return self.renderTweet( self, d );
		} )
		.each( function( d ) {
			d3.select( this ).selectAll( "circle" )
				.each( function() {
					if ( this.getBBox().height > self.maxBoxHeight ) {
						self.maxBoxHeight = this.getBBox().height;
					}
				} );
			if (d.in_reply_to_status_id_str) {
				threaded_tweets.push( d );
			}
		} );
	var threaded_tweets_data = self.canvas
		.selectAll( "g.timeline-link" )
		.data( threaded_tweets );
	threaded_tweets_data.enter()
		.insert( function( d ) {
			var g = d3.select( document.createElementNS( 'http://www.w3.org/2000/svg', 'g' ) )
				.attr( "class", "timeline-link" );
			g.append( "path" );
			return g.node();
		} );

	var height = self.maxBoxHeight + 5;
	var count = parseInt( (self.container.height() - (self.padding * 2)) / height );
	tweets.attr( "transform", function( d, i ) {
		d.i = i;
		return "translate(" + self.x( d.date ) + ","
				+ ((i % count) * height + 30) + ")";
	} );
	tweets.exit().remove();
	threaded_tweets_data.each( function (d, i) {
		var tt = self.getTweetByID( d.in_reply_to_status_id_str );
		if ( tt != null ) {
			d3.select( this ).selectAll( "path" ).attr( "d",
				"M " + self.x( d.date ) + " " + ((d.i % count) * height) + " L "
			+ self.x( tt.date ) + " " + ((tt.i % count) * height));
		}
	} );
	threaded_tweets_data.exit().remove();
}

Status.Timeline.Visualisation.prototype.redraw = function() {
	var self = this;
	return function() {

		var cx = self.container.width();
		var cy = self.container.height();
		var width = cx - (self.padding * 2);
		var height = cy - (self.padding * 2);

		var tx = function( d ) {
			return "translate(" + self.x( d ) + ",0)";
		};
		
		var fx = function() {
			//var r = self.x.tickFormat().apply( null, arguments );
			//return r;
			var date = arguments[0];
			var format = d3.time.format;
			var formatMillisecond = format("%d/%m/%y %H:%M:%S"),
				formatSecond = format("%d/%m/%y %H:%M:%S"),
				formatMinute = format("%d/%m/%y %H:%M:%S"),
				formatHour = format("%d/%m/%y %H:%M"),
				formatDay = format("%d/%m/%y"),
				formatWeek = format("%d/%m/%y"),
				formatMonth = format("%B %Y"),
				formatYear = format("%Y");
			return (d3.time.second.utc(date) < date ? formatMillisecond
			        : d3.time.minute.utc(date) < date ? formatSecond
			        : d3.time.hour.utc(date) < date ? formatMinute
			        : d3.time.day.utc(date) < date ? formatHour
			        : d3.time.month.utc(date) < date ? 
			        		(d3.time.week.utc(date) < date ? formatDay : formatWeek)
			        : d3.time.year.utc(date) < date ? formatMonth
			        : formatYear)(date);
		}

		self.display
			.attr( "width", cx )
			.attr( "height", cy );

		self.x.range( [ 0, width ] );		
		
		var gx = self.canvas.selectAll( "g.x" )
			.data( self.x.ticks( 5 ), String )
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

		self.display.call( ( self.zoom = d3.behavior.zoom() )
			.x( self.x )
		.on( "zoom", self.redraw() ) );
		self.update();
	}
}
