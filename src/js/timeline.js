/**
 * Timeline rendering functions.

 * @package status
 */

var Status = Status || {};

Status.Timeline = Status.Timeline || {};

Status.Timeline.Visualisation = function( $, container, start, tweets, links ) {

	var self = this;

	this.$ = $;
	this.container = container;
	this.tweets = tweets;
	this.links = links;
	this.padding = 20;
	this.maxBoxHeight = 0;
	this.renderer = new Status.Information.Display();

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

	this.getTweetByID = function( id ) {
		return $.grep( tweets, function( t, i ) {
			return t.db_id === id;
		} );
	}

	$( window ).resize( self.redraw() );
	
	$( Status ).bind( "status.timeline.visualisation.tweet-selected" , function( event, node, tweet ) {
		
	} );

	$( Status ).trigger( "status.timeline.visualisation.created",  self );
};

Status.Timeline.Visualisation.prototype.renderTweet = function( tweet ) {
	var self = this;
	var g = d3.select( document.createElementNS( 'http://www.w3.org/2000/svg', 'g' ) )
		.attr( "class", tweet.event + " timeline-element" )
		.attr( "id", tweet.id );
	g.append( "circle" );
	g.append( "title" ).text( Status.Util.getEventTypeDesc( tweet.event ) );
	g.on( "click", function( d ) {
		self.$( Status ).trigger( "status.timeline.visualisation.tweet-selected", [ this, d ] );
	} );
	return g.node();
};

Status.Timeline.Visualisation.prototype.renderLink = function( link ) {
	var self = this;
	var g = d3.select( document.createElementNS( 'http://www.w3.org/2000/svg', 'g' ) )
		.attr( "class", "link" )
		.attr( "id", "link-" + link.id );
	g.append( "line" );
	return g.node();
};

Status.Timeline.Visualisation.prototype.renderInformation = function( tweet ) {
	var self = this;
	var g = self.canvas.append("g");
	g.attr("class", tweet.event + " information-display");
	var width = 148;
	var height = 133;
	var coords = "M6,2"
	+ "h" + width
	+ "c3.252,0,6,2.748,6,6"
	+ "v" + height
	+ "c0,3.252-2.748,6-6,6"
	+ "H25.442"
	+ "L15.74," + (24.673 + height)
	+ "C 15.546, " + ( 24.885 + height ) + ", 15.276, " + ( 25 + height ) + ", 15, " + ( 25 + height )
	+ "c -0.121, 0 -0.243 -0.022 -0.361 -0.067"
	+ "C14.254," + ( 24.784 + height ) + ",14," + ( 24.143 + height ) + ",14," + ( 24 + height )
	+ "V" + ( height + 14 )
	+ "H6c-3.252,0-6-2.748-6-6"
	+ "L0,8"
	+ "C0,4.748,2.748,2,6,2"
	+ "z";
	var path = g.append("path")
		.attr("d", coords);
	var fo = g.append("foreignObject");
	fo.html(self.renderer.createTweet(tweet));
	g.style("visibility", "hidden");
	self.$( Status ).bind( "status.timeline.visualisation.tweet-selected" , function( event, node, t ) {
		if ( t.id == tweet.id ) {
			if ( g.style("visibility") == "hidden" ) {
				g.style("visibility", "visible");
			} else {
				g.style("visibility", "hidden");
			}
		}
	} );
	return g.node();
};

Status.Timeline.Visualisation.prototype.update = function() {
	var self = this;
	var offset = 30;
	var radius = Math.floor( ( self.container.height() - offset ) / 32 );
	var height = radius * 2;

	var links = self.canvas
		.selectAll( "g.link" )
		.data( self.links );
	links.enter()
		.append( function( d ) {
			return self.renderLink( d );
		} );
	links.each( function( d, i ) {
		var ft = self.getTweetByID( d.from_id );
		if ( ft.length == 0 ) {
			return;
		}
		var tt = self.getTweetByID( d.to_id );
		if ( tt.length == 0 ) {
			return;
		}
		ft = ft[0];
		tt = tt[0];
		var fy = Status.Util.TWEET_TYPES.indexOf( ft.event );
		var ty = Status.Util.TWEET_TYPES.indexOf( tt.event );
		d3.select( this ).select( "line" )
			.attr( "x1", self.x( ft.date ) ).attr( "y1", fy * height + offset )
			.attr( "x2", self.x( tt.date ) ).attr( "y2", ty * height + offset );
	} );
	links.exit().remove();

	var tweets = self.canvas
		.selectAll( "g.timeline-element" )
		.data( self.tweets );
	tweets.enter()
		.append( function( d ) {
			return self.renderTweet( d );
		} );
	tweets.attr( "transform", function( d, i ) {
		var y = Status.Util.TWEET_TYPES.indexOf( d.event );
		return "translate(" + self.x( d.date ) + ","
			+ (y * height + offset) + ")";
	} ).each(function( d, i ) {
		d3.select( this ).select( "circle" ).attr( "r", function() {
			return radius + "px";
		} );
	} );
	tweets.exit().remove();
	
	var information = self.canvas
		.selectAll( "g.information-display" )
		.data( self.tweets );
	information.enter()
		.append( function( d ) {
			return self.renderInformation( d );
		} )
	information.attr( "transform", function( d, i ) {
		var y = Status.Util.TWEET_TYPES.indexOf( d.event );
		return "translate(" + self.x( d.date ) + ","
			+ (y * height + offset) + ")";
	} )
	information.exit().remove();
	
	self.$( Status ).trigger( "status.timeline.visualisation.updated", [ self, height, radius ] );
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
			var date = arguments[0];
			var format = d3.time.format;
			var formatMillisecond = format( "%d/%m/%y %H:%M:%S" ),
				formatSecond = format( "%d/%m/%y %H:%M:%S" ),
				formatMinute = format( "%d/%m/%y %H:%M:%S" ),
				formatHour = format( "%d/%m/%y %H:%M" ),
				formatDay = format( "%d/%m/%y" ),
				formatWeek = format( "%d/%m/%y" ),
				formatMonth = format( "%B %Y" ),
				formatYear = format( "%Y" );
			return ( d3.time.second.utc( date ) < date ? formatMillisecond
			        : d3.time.minute.utc( date ) < date ? formatSecond
			        : d3.time.hour.utc( date ) < date ? formatMinute
			        : d3.time.day.utc( date ) < date ? formatHour
			        : d3.time.month.utc( date ) < date ?
			        		( d3.time.week.utc( date ) < date ? formatDay : formatWeek )
			        : d3.time.year.utc( date ) < date ? formatMonth
			        : formatYear )( date );
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
