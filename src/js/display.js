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
	/*var map = new Status.Map.GoogleMap( $, $( "#tweet-canvas>.map" ) );*/

	Status.Profile.get( $, function( data ) {
		$( "#tweet-canvas .profile" )
			.append( Status.Profile.draw( $, data ) );
	});
	new Status.Information.Display( $, $( "#tweet-canvas .information-panel" ) );
	(function () {
		Status.Util.getTimeline( $, function( data ) {
			var start = new Date();
			var special_retweet_ids = [];
			$.each( data, function( i, o ) {
				o.id = Status.Util.getID(o);
				o.date = Status.Util.parseCreatedAt( o.created_at );
				o.incoming_edges = [];
				o.outgoing_edges = [];
				if(o.event == "FRIEND_RETWEET" 
						|| o.event == "FRIEND_OF_FRIEND_RETWEET") {
					special_retweet_ids.push(o.data.id);
				}
				if ( o.date.getTime() < start.getTime() ) {
					start = o.date;
				}
			} );
			var timeline_data = [];
			$.each( data, function( i, o ) {
				if(!(o.event == "RETWEET" 
						&& $.inArray(o.data.id, special_retweet_ids))) {
					timeline_data.push(o);
				}
			});
			(new Status.Timeline.Visualisation(
				$, $( "#tweet-canvas>.timeline" ),
			start, timeline_data, true )).redraw()();
		} );
	}) ();
});
