/**
 * Display page Javascript functions.
 *
 * @package status
 */

// Events.
/* status.map.googlemap.tweet-selected */
/* status.timeline.visualisation.tweet-selected */

var Status = Status || {};

jQuery(function($) {

	$( ".legend-entry" ).click( function( e ) {
		var type = $( this ).data( "type" );
		$( "div.timeline g.timeline-element." + type + ">circle" ).fadeToggle();
		$( this ).children( "input" ).prop( "checked", ! $( this ).children( "input" ).prop( "checked" ) );
	});

	new Status.Information.Display( $, $( "#tweet-canvas .information-panel" ) );
	(function () {
		Status.Util.getTimeline( $, function( data ) {
			var tweet_type_counts = new Array();
			var start = new Date();
			var special_retweet_ids = [];
			$.each( data, function( i, o ) {
				o.id = Status.Util.getID( o );
				o.date = Status.Util.parseCreatedAt( o.created_at );
				o.incoming_edges = [];
				o.outgoing_edges = [];
				if (o.event == "FRIEND_RETWEET"
						|| o.event == "FRIEND_OF_FRIEND_RETWEET") {
					special_retweet_ids.push( o.data.id );
				}
				if ( o.date.getTime() < start.getTime() ) {
					start = o.date;
				}
			} );
			var timeline_data = [];
			$.each( data, function( i, o ) {
				if ( ( ! (o.event == "RETWEET"
						&& $.inArray( o.data.id, special_retweet_ids )))
						&& o.event != "RETWEETED_RETWEET") {
					timeline_data.push( o );
					if ( o.event in tweet_type_counts ) {
						tweet_type_counts[o.event]++;
					} else {
						tweet_type_counts[o.event] = 1;
					}
				}
			});

			for ( var e in tweet_type_counts ) {
				var el = $( ".legend-entry." + e + " span" );
				el.text( el.text() + " (" + tweet_type_counts[e] + ")" );
			}

			(new Status.Timeline.Visualisation(
				$, $( "#tweet-canvas>.timeline" ),
			start, timeline_data, true )).redraw()();
		} );
	}) ();
});
