<?php
/**
 * Display page.

 * @package status
 */

if ( ! empty( get_query_var( 'oauth_token', null ) ) ) {
	header( 'Location: ' . get_site_url() );
	die();
}

$url_prefix = get_stylesheet_directory_uri();
wp_enqueue_style( 'status_display',
$url_prefix . '/css/display.css', array( 'status' ), '1.0.0');
wp_enqueue_script( 'google-maps-api',
	'//maps.googleapis.com/maps/api/js?libraries=visualization&key='
. get_option( 'status-google-maps-api-key' ), array(), 'latest' );
wp_enqueue_script( 'google-js-api', '//www.google.com/jsapi', array(), 'latest' );
wp_enqueue_script( 'moment-js',
'//cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js', array(), '2.10.6' );
wp_enqueue_script( 'moment-js-range',
	'//cdnjs.cloudflare.com/ajax/libs/moment-range/2.0.3/moment-range.min.js',
array( 'moment-js' ), '2.0.3' );
wp_enqueue_script( 'd3',
'//cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js', array(), '3.5.6' );
wp_enqueue_script( 'status_profile', $url_prefix . '/js/profile.js', array(), '1.0.0' );
wp_enqueue_script( 'status_timeline', $url_prefix . '/js/timeline.js', array(), '1.0.0' );
wp_enqueue_script( 'status_map', $url_prefix . '/js/map.js', array(), '1.0.0' );
wp_enqueue_script( 'status_util', $url_prefix . '/js/util.js', array(), '1.0.0' );
wp_enqueue_script( 'status_information', $url_prefix . '/js/information.js', array(), '1.0.0' );
wp_enqueue_script( 'status_display',
	get_stylesheet_directory_uri() . '/js/display.js',
array( 'jquery' ), '1.0.0', true );
wp_localize_script( 'status_display', 'statusConfig', array(
		'ajaxurl' => admin_url( 'admin-ajax.php' ),
		'verify' => wp_create_nonce( 'verify' ),
));
get_header();
?>
<div id="tweet-canvas" class="canvas">
	<div class="timeline"></div>
	<div class="sidebar">
		<div class="legend">
			<h3>KEY</h3>
			<ul>
				<li class="legend-entry TWEET" data-type="TWEET">
					<input type="checkbox" checked="checked" />
					<span>Your Tweet</span>
				</li>
				<li class="legend-entry MENTION" data-type="MENTION">
					<input type="checkbox" checked="checked" />
					<span>Mention</span>
				</li>
				<li class="legend-entry QUOTED_TWEET" data-type="QUOTED_TWEET">
					<input type="checkbox" checked="checked" />
					<span>Quoted Tweet</span>
				</li>
				<li class="legend-entry RETWEET" data-type="RETWEET">
					<input type="checkbox" checked="checked" />
					<span>General Retweet</span>
				</li>
				<li class="legend-entry FRIEND_RETWEET" data-type="FRIEND_RETWEET">
					<input type="checkbox" checked="checked" />
					<span>Retweet by a Friend</span>
				</li>
				<li class="legend-entry FRIEND_OF_FRIEND_RETWEET" data-type="FRIEND_OF_FRIEND_RETWEET">
					<input type="checkbox" checked="checked" />
					<span>Retweet by a Friend of a Friend</span>
				</li>
				<li class="legend-entry YOU_FAVOURITED" data-type="YOU_FAVOURITED">
					<input type="checkbox" checked="checked" />
					<span>Tweet You Favourited</span>
				</li>
				<li class="legend-entry YOU_UNFAVOURITED" data-type="YOU_UNFAVOURITED">
					<input type="checkbox" checked="checked" />
					<span>Tweet You Unfavourited</span>
				</li>
				<li class="legend-entry FAVOURITED_YOU" data-type="FAVOURITED_YOU">
					<input type="checkbox" checked="checked" />
					<span>Your Tweet Was Favourited</span>
				</li>
				<li class="legend-entry UNFAVOURITED_YOU" data-type="UNFAVOURITED_YOU">
				<input type="checkbox" checked="checked" />
					<span>Your Tweet Was Unfavourited</span>
				</li>
				<li class="legend-entry FAVOURITED_RETWEET" data-type="FAVOURITED_RETWEET">
					<input type="checkbox" checked="checked" />
					<span>Your Retweet Was Favourited</span>
				</li>
				<li class="legend-entry YOU_FOLLOWED" data-type="YOU_FOLLOWED">
					<input type="checkbox" checked="checked" />
					<span>You Started Following</span>
				</li>
				<li class="legend-entry FOLLOWED_YOU" data-type="FOLLOWED_YOU">
					<input type="checkbox" checked="checked" />
					<span>Started Following You</span>
				</li>
				<li class="legend-entry YOU_UNFOLLOWED" data-type="YOU_UNFOLLOWED">
					<input type="checkbox" checked="checked" />
					<span>You Stopped Following</span>
				</li>
				<li class="legend-entry BLOCK" data-type="BLOCK">
					<input type="checkbox" checked="checked" />
					<span>You Blocked a User</span>
				</li>
				<li class="legend-entry UNBLOCK" data-type="UNBLOCK">
					<input type="checkbox" checked="checked" />
					<span>You Unblocked a User</span>
				</li>
			</ul>
		</div>
		<div class="actions">
			<h3>Actions</h3>
			<ul>
				<li><a href="<?php echo esc_url( wp_logout_url( home_url() ) ); ?>">Sign out</a></li>
				<li><a href="<?php echo esc_url( site_url( '/data.json.bz2' ) ); ?>"
				    title="Use this to download your Twitter data into a plain text file.  The text of your tweets will be stored, including any linked URLs, along with data from your Twitter user profile and location information, if this is enabled on the device you tweet from.  Tweets and user data of other people who have mentioned you in a tweet, or retweeted or favourited one of your tweets, will also be included.">Export my data</a></li>
			</ul>
		</div>
		<div class="information-panel"></div>
		<div class="profile"></div>
		<div class="map"></div>
	</div>
</div>
<!-- <div>What does this do?

Use this button to download your Twitter data into a plain text file.  The text of your tweets will be stored, including any linked URLs, along with data from your Twitter user profile and location information, if this is enabled on the device you tweet from.  Tweets and user data of other people who have mentioned you in a tweet, or retweeted or favourited one of your tweets, will also be included.
</div> -->

<?php get_footer(); ?>
