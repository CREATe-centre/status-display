/**
 * Display page Javascript functions.
 *
 * @package status
 */

// Events.
/* status.timeline.visualisation.tweet-selected */

var Status = Status || {};

jQuery(function($) {

	(function () {
		Status.Util.getTimeline( $, function( data ) {
			var tweet_type_counts = new Array();
			var start = new Date();
			var special_retweet_ids = [];
			$.each( data.events, function( i, o ) {
				o.id = Status.Util.getID( o );
				o.date = Status.Util.parseCreatedAt( o.created_at );
				if (o.event == "FRIEND_RETWEET"
						|| o.event == "FRIEND_OF_FRIEND_RETWEET") {
					special_retweet_ids.push( o.data.id );
				}
				if ( o.date.getTime() < start.getTime() ) {
					start = o.date;
				}
			} );
			var timeline_data = [];
			$.each( data.events, function( i, o ) {
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

			$( Status ).bind( "status.timeline.visualisation.updated",
				function( event, timeline, height, radius) {
						$( ".legend-entry" ).css( {
							"height" : height + "px"
						} )
						$( ".sidebar" ).css( {
							"top" : ( ( 30 - radius ) + timeline.padding ) + "px"
						} )
				}
			);

			$( "#action-upload" ).click( function() {
				$( "#upload-form" ).modal({onOpen: function (dialog) {
					dialog.overlay.fadeIn('fast', function () {
						dialog.container.fadeIn('fast', function () {
							dialog.data.fadeIn( 'fast' );
						});
					});
				}});
			} );

			(new Status.Timeline.Visualisation(
				$, $( "#tweet-canvas>.timeline" ),
			start, timeline_data, data.links )).redraw()();
		} );
	}) ();
});
