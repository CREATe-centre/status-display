/**
 * Display page Javascript functions.
 *
 * @package status
 */

// Events.
/* status.map.googlemap.tweet-selected */
/* status.timeline.visualisation.tweet-selected */
/* status.information.display.show-retweets */

var Status = Status || {};

jQuery(function($) {

	var map = new Status.Map.GoogleMap( $, $( "#tweet-canvas>.map" ) );

	Status.Profile.get( $, function( data ) {
		$( "#tweet-canvas>.profile" )
			.append( Status.Profile.draw( $, data ) );
	});

	new Status.Information.Display( $, $( "#tweet-canvas>.information-panel" ) );

	$( Status ).bind( "status.timeline.visualisation.created" , function( event, timeline ) {
		$( "div.controls div.zoom-in" ).click(function () {
			timeline.zoom.scale( 1.1 ).event( timeline.display );
		});
		$( "div.controls div.zoom-out" ).click(function () {
			timeline.zoom.scale( 0.9 ).event( timeline.display );
		});
	} );

	(function () {
		var count = 20;
		Status.Util.getTweets( $, count, function( tweets ) {
			$.each( tweets, function( i, o ) {
				o.type = "tweet";
			});
			Status.Util.getMentions( $, count, function( mentions ) {
				$.each( mentions, function( i, o ) {
					o.type = "mention";
				});
				var data = tweets.concat( mentions );
				var start = new Date();
				$.each( data, function( i, o ) {
					o.date = Status.Util.parseCreatedAt( o.created_at );
					if ( o.date.getTime() < start.getTime() ) {
						start = o.date;
					}
				} );
				(new Status.Timeline.Visualisation(
					$, $( "#tweet-canvas>.timeline" ),
				start, data, true )).redraw()();
				map.displayTweets( data );
			});
		})
	}) ();

});
