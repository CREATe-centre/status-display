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
							"height" : height + "px",
							"line-height" : height + "px"
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

			var circles = $( ".timeline-element > circle" );
			var randomCircle = circles.eq( Math.floor( Math.random() * circles.length ) );
			var lines = $( ".link > line" );
			var randomLine = lines.eq( Math.floor( Math.random() * lines.length ) );

			var tour = new Tour( {
				"name" : "help-tour",
				"debug" : false,
				"steps" : [
				{
					"orphan" : true,
					"title" : "Welcome",
					"content" : "Welcome to Status, follow this guide for a quick introduction to the platform."
				},{
					"orphan" : true,
					"title" : "Timeline",
					"content" : "The timeline shows your Tweets along with interactions you and others have had on Twitter."
				},{
					"orphan" : true,
					"title" : "Timeline",
					"content" : "You can click and drag to scroll the timeline, or use the mouse scroll wheel to zoom in and out."
				},{
					"element" : "#tweet-canvas > ul",
					"title" : "Legend",
					"content" : "Interactions are grouped and categorised on the vertical axis.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.FOLLOWED_YOU",
					"title" : "Started Following You",
					"content" : "Indicates when someone new started following you.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.YOU_UNFAVOURITED",
					"title" : "Tweet You Unfavourited",
					"content" : "Indicates that you unfavourited someone elses Tweet that you had previously favourited.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.YOU_FAVOURITED",
					"title" : "Tweet You Favourited",
					"content" : "Indicates that you favourited someone elses Tweet.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.UNFAVOURITED_YOU",
					"title" : "Your Tweet Was Unfavourited",
					"content" : "Someone unfavourited one of your Tweets that they had previously favourited.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.FAVOURITED_YOU",
					"title" : "Your Tweet Was Favourited",
					"content" : "Some favourited one of your Tweets.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.FAVOURITED_RETWEET",
					"title" : "Your Retweet Was Favourited",
					"content" : "You retweeted a Tweet, which someone else then favourited.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.QUOTED_TWEET",
					"title" : "Quoted Tweet",
					"content" : "Someone quoted one of your Tweets.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.TWEET",
					"title" : "Your Tweet",
					"content" : "Tweets you have made.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.MENTION",
					"title" : "Mention",
					"content" : "Someone else mentioned you in a Tweet.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.FRIEND_RETWEET",
					"title" : "Retweet by a Friend",
					"content" : "Your Tweet was retweeted by someone you are following.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.FRIEND_OF_FRIEND_RETWEET",
					"title" : "Retweet by a Friend of a Friend",
					"content" : "Your Tweet was retweeted by someone you are not following, but who is following someone you are following.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.RETWEET",
					"title" : "General Retweet",
					"content" : "You Tweet was retweeted by someone.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.YOU_FOLLOWED",
					"title" : "You Started Following",
					"content" : "You started following someone.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.YOU_UNFOLLOWED",
					"title" : "You Stopped Following",
					"content" : "You stopped following someone.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.BLOCK",
					"title" : "You Blocked a User",
					"content" : "You blocked a user.",
					"placement" : "right"
				},{
					"element" : "#tweet-canvas > ul > li.legend-entry.UNBLOCK",
					"title" : "You Unblocked a User",
					"content" : "You unblocked a user.",
					"placement" : "right"
				},{
					"element" : randomCircle,
					"title" : "Data point",
					"content" : "Clicking on a data point (circle) brings up more information.",
					"placement" : "right"
				},{
					"element" : randomLine,
					"title" : "Link",
					"content" : "Links show relationships between data points.",
					"placement" : "right"
				},{
					"element" : "#action-upload",
					"title" : "Upload Analytics",
					"content" : "Click the upload link to upload analytics data exported from Twitter.",
					"placement" : "left"
				},{
					"element" : "#action-logout",
					"title" : "Sign out",
					"content" : "Click this link to sign out.",
					"placement" : "left"
				},{
					"element" : "#action-help",
					"title" : "Get help",
					"content" : "Click the help link to load this guide at any time.",
					"placement" : "left"
				} ]
			});
			tour.init();
			$( '#action-help' ).click( function() {
				tour.restart();
			} );
			tour.start();
		} );
	}) ();
});
