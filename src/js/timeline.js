Timeline = function(element, start_date, data, top_level) {

	var self = this;
	var start = moment( start_date ).subtract( 14, 'days' ).toDate();
	var end = moment().add( 14, 'days' ).toDate();

	this.element = element;
	this.chart = element.get( 0 );
	this.cx = element.width();
	this.cy = element.height();
	this.padding = {
		"top" : 40,
		"right" : 40,
		"bottom" : 40,
		"left" : 40
	};
	this.size = {
		"width" : this.cx - this.padding.left - this.padding.right,
		"height" : this.cy - this.padding.top - this.padding.bottom
	};

	this.x = d3.time.scale.utc()
		.range( [ 0, this.size.width ] )
		.domain( [ start, end ] );

	this.points = data.map( function( d ) {
		d.x = d.date;
		return d;
	});

	this.vis = d3.select( this.chart )
		.append( "svg" )
		.attr( "class", "timeline" )
		.attr( "width", this.cx )
		.attr( "height", this.cy )
		.append( "g" )
		.attr( "transform",
		"translate( " + this.padding.left + "," + this.padding.top + ")" );

	this.plot = this.vis.append( "rect" )
		.attr( "id", "timeline-canvas" )
		.attr( "width", this.size.width )
		.attr( "height", this.size.height );

	this.plot.call(
		d3.behavior.zoom()
			.x( this.x )
			.on( "zoom", this.redraw() ) );

	this.redraw()();

	jQuery( window ).resize(function() {
		console.log( "redraw" );
		self.redraw()();
	})
};

Timeline.prototype.update = function() {
	var self = this;
	var radius = 10;
	var tweets = self.vis
		.selectAll( "g.tweet" )
		.data( self.points );
	tweets.enter()
		.append( function(d, i) {
			var g = d3.select( document.createElementNS( 'http://www.w3.org/2000/svg', 'g' ) );
			g.attr( "class", "tweet" );
			g.append( "circle" )
				.attr( "r", radius )
				.on( "click", function() {
					d3.selectAll( "circle.selected" ).classed( "selected", false );
					d3.select( this ).classed( "selected", true );
					d.display();
					// TODO: click for retweets and favourites
				} );
			g.append( "text" )
				.attr( "dy", "15px" )
				.attr( "x", radius + 5 )
				.attr( "y", "-15px" )
				.text( d.text.length <= 40
					? d.text
				: d.text.substring( 0, 37 ) + "..." );
			g.append( "text" )
				.attr( "dy", "15px" )
				.attr( "x", radius + 5 )
				.attr( "y", "0px" )
				.text( "Retweeted: " + d.retweet_count );
			g.append( "text" )
				.attr( "dy", "15px" )
				.attr( "x", radius + 5 )
				.attr( "y", "15px" )
				.text( "Favourited: " + d.favorite_count );
			g.append( "title" ).text( d.text );

			return g.node();
		} );

	var count = parseInt( self.size.height / 50 );

	if ( self.rendered ) {
		tweets.attr( "transform", function( d, i ) {
			return "translate(" + self.x( d.x ) + ","
				+ ((i % count) * 50) + ")";
		} );
	} else {
		self.rendered = true;
		tweets
		.attr( "transform", function( d, i ) {
			return "translate(0,0)";
		} )
		.transition()
		.attr( "transform", function( d, i ) {
			return "translate(" + self.x( d.x ) + ","
				+ ((i % count) * 50) + ")";
		} );
	}

	tweets.exit().remove();
}

Timeline.prototype.redraw = function() {
	var self = this;
	return function() {

		self.cx = self.element.width();
		self.cy = self.element.height();
		self.size = {
			"width" : self.cx - self.padding.left - self.padding.right,
			"height" : self.cy - self.padding.top - self.padding.bottom
		};

		d3.select( ".timeline" )
			.attr( "width", self.cx )
			.attr( "height", self.cy );

		self.x.range( [ 0, self.size.width ] )

		d3.select( "#timeline-canvas" )
			.attr( "width", self.size.width )
			.attr( "height", self.size.height );

		var tx = function( d ) {
			return "translate(" + self.x( d ) + ",0)";
		};

		var fx = self.x.tickFormat( 10 );

		var gx = self.vis.selectAll( "g.x" )
			.data( self.x.ticks( 10 ), String ) // TODO: date formatting goes here I think
			.attr( "transform", tx );

		gx.select( "text" ).text( fx ).attr( "y", self.size.height );

		var gxe = gx.enter().insert( "g" )
			.attr( "class", "x" )
			.attr( "transform", tx );

		gxe.append( "line" )
			.attr( "y1", 0 )
			.attr( "y2", self.size.height );

		gx.select( "line" )
			.attr( "y1", 0 )
			.attr( "y2", self.size.height );

		gxe.append( "text" )
			.attr( "class", "axis" )
			.attr( "y", self.size.height )
			.attr( "dy", "1em" )
			.attr( "text-anchor", "middle" )
			.text( fx );

		gx.exit().remove();

		self.plot.call(
			d3.behavior.zoom()
			.x( self.x )
			.on( "zoom", self.redraw() ) );
		self.update();
	}
}
