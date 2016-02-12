/**
 * Javascript map functions.

 * @package status
 */

if ( ! google.maps.Polygon.prototype.getBounds ) {
	google.maps.Polygon.prototype.getBounds = function( latLng ) {
		var bounds = new google.maps.LatLngBounds();
		var paths = this.getPaths();
		var path;
		for ( var p = 0; p < paths.getLength(); p++ ) {
			path = paths.getAt( p );
			for ( var i = 0; i < path.getLength(); i++ ) {
				bounds.extend( path.getAt( i ) );
			}
		}
		return bounds;
	};
}

var Status = Status || {};

Status.Map = Status.Map || {};

Status.Map.getTweetCoordinates = function( $, tweet ) {
	if ( tweet.coordinates ) {
		if ( tweet.coordinates.type == "Point" ) {
			return new google.maps.LatLng(
				tweet.coordinates.coordinates[1],
			tweet.coordinates.coordinates[0] );
		}
	}
	if ( tweet.geo ) {
		return false;
	}
	if ( tweet.place ) {
		var coords = [];
		$.each( tweet.place.bounding_box.coordinates[0], function( i, o ) {
			coords.push( new google.maps.LatLng( o[1], o[0] ) );
		});
		var poly = new google.maps.Polygon();
		poly.setPaths( coords );
		return poly.getBounds().getCenter();
	}
	return false;
};

Status.Map.GoogleMap = function ( $, container ) {

	var self = this;
	var options = {
		"zoom" : 1,
		"center" : new google.maps.LatLng( 0, 0 ),
		"mapTypeId" : google.maps.MapTypeId.SATELLITE,
		"mapTypeControl" : false,
		"panControl" : false,
		"zoomControl" : false,
		"streetViewControl" : false
	};

	this.$ = $;
	this.map = new google.maps.Map( container.get( 0 ), options );
};

Status.Map.GoogleMap.prototype.displayTweets = function( tweets ) {
	var self = this;
	var bounds = new google.maps.LatLngBounds();
	this.$.each( tweets, function( i, o ) {
		var coords = Status.Map.getTweetCoordinates( self.$, o );
		if ( coords ) {
			bounds.extend( coords );
			var marker = new google.maps.Marker({
				"map" : self.map,
				"position" : coords,
				"title" : o.text.length <= 40
				? o.text
					: o.text.substring( 0, 37 ) + "..."
			});
			marker.addListener( 'click', function() {
				self.$( Status ).trigger( "status.map.googlemap.tweet-selected", o );
			} );
			self.map.setCenter( bounds.getCenter() );
			self.map.fitBounds( bounds );
		}
	});
};
