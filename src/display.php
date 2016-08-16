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
wp_enqueue_style( 'bootstrap-tour',
'//cdnjs.cloudflare.com/ajax/libs/bootstrap-tour/0.11.0/css/bootstrap-tour-standalone.min.css', array( 'status' ), '0.11.0');
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
wp_enqueue_script( 'jquery-actual',
'//cdnjs.cloudflare.com/ajax/libs/jquery.actual/1.0.18/jquery.actual.min.js', array( 'jquery' ), '1.0.18' );
wp_enqueue_script( 'status_profile', $url_prefix . '/js/profile.js', array(), '1.0.0' );
wp_enqueue_script( 'status_timeline', $url_prefix . '/js/timeline.js', array(), '1.0.0' );
wp_enqueue_script( 'status_util', $url_prefix . '/js/util.js', array(), '1.0.0' );
wp_enqueue_script( 'status_information', $url_prefix . '/js/information.js',
array( 'jquery-actual' ), '1.0.0' );
wp_enqueue_script( 'jquery-effects-fade' );
wp_enqueue_script( 'jquery-effects-pulsate' );
wp_enqueue_script( 'jquery-simplemodal',
	'//cdnjs.cloudflare.com/ajax/libs/simplemodal/1.4.4/jquery.simplemodal.min.js',
array( 'jquery' ), '1.4.4' );
wp_enqueue_script( 'status_display',
	get_stylesheet_directory_uri() . '/js/display.js',
array( 'jquery' ), '1.0.0', true );
wp_enqueue_script( 'bootstrap-tour',
'//cdnjs.cloudflare.com/ajax/libs/bootstrap-tour/0.11.0/js/bootstrap-tour-standalone.min.js', array( 'jquery' ), '0.11.0' );
wp_localize_script( 'status_display', 'statusConfig', array(
		'ajaxurl' => admin_url( 'admin-ajax.php' ),
		'verify' => wp_create_nonce( 'verify' ),
));
get_header();
?>
<div id="tweet-canvas" class="canvas">
	<div class="timeline"></div>
	<ul class="sidebar legend">
		<li class="legend-entry FOLLOWED_YOU" data-type="FOLLOWED_YOU">
			<span>Started Following You</span>
		</li>
		<li class="legend-entry YOU_UNFAVOURITED" data-type="YOU_UNFAVOURITED">
			<span>Tweet You Unfavourited</span>
		</li>
		<li class="legend-entry YOU_FAVOURITED" data-type="YOU_FAVOURITED">
			<span>Tweet You Favourited</span>
		</li>
		<li class="legend-entry UNFAVOURITED_YOU" data-type="UNFAVOURITED_YOU">
			<span>Your Tweet Was Unfavourited</span>
		</li>
		<li class="legend-entry FAVOURITED_YOU" data-type="FAVOURITED_YOU">
			<span>Your Tweet Was Favourited</span>
		</li>
		<li class="legend-entry FAVOURITED_RETWEET" data-type="FAVOURITED_RETWEET">
			<span>Your Retweet Was Favourited</span>
		</li>
		<li class="legend-entry QUOTED_TWEET" data-type="QUOTED_TWEET">
			<span>Quoted Tweet</span>
		</li>		
		<li class="legend-entry TWEET" data-type="TWEET">
			<span>Your Tweet</span>
		</li>
		<li class="legend-entry MENTION" data-type="MENTION">
			<span>Mention</span>
		</li>
		<li class="legend-entry FRIEND_RETWEET" data-type="FRIEND_RETWEET">
			<span>Retweet by a Friend</span>
		</li>
		<li class="legend-entry FRIEND_OF_FRIEND_RETWEET" data-type="FRIEND_OF_FRIEND_RETWEET">
			<span>Retweet by a Friend of a Friend</span>
		</li><li class="legend-entry RETWEET" data-type="RETWEET">
			<span>General Retweet</span>
		</li>
		<li class="legend-entry YOU_FOLLOWED" data-type="YOU_FOLLOWED">
			<span>You Started Following</span>
		</li>
		<li class="legend-entry YOU_UNFOLLOWED" data-type="YOU_UNFOLLOWED">
			<span>You Stopped Following</span>
		</li>
		<li class="legend-entry BLOCK" data-type="BLOCK">
			<span>You Blocked a User</span>
		</li>
		<li class="legend-entry UNBLOCK" data-type="UNBLOCK">
			<span>You Unblocked a User</span>
		</li>
	</ul>
	<div class="actions">
		<a href="#" id="action-help">
			<img src="<?php bloginfo( 'stylesheet_directory' ); ?>/img/help.png" 
					alt="Help" title="Help" />
		</a>
		<br />
		<a href="#" id="action-upload">
			<img src="<?php bloginfo( 'stylesheet_directory' ); ?>/img/upload.png" 
					alt="Upload analytics" title="Upload Twitter analytics file" />
		</a>
		<br />
		<a id="action-logout" href="<?php echo esc_url( wp_logout_url( home_url() ) ); ?>">
			<img src="<?php bloginfo( 'stylesheet_directory' ); ?>/img/logout.png" 
					alt="Sign out" title="Sign out" />
		</a>
	</div>	
</div>
<div id="upload-form" style="display: none;">
	<h2>Upload Analytics Data</h2>
	<p>
		You can add extra analytics data to the timeline by uploading 
		data exported from <a class="external" target="_blank" 
				href="https://analytics.twitter.com">https://analytics.twitter.com</a>.
	</p>
	<form action="analytics.php" method="post" enctype="multipart/form-data">
		<input type="file" name="data" />
		<input type="submit" value="Upload" />
	</form>
</div>
<?php get_footer(); ?>
