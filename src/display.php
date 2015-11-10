<?php
/**
 * Display page.
 * @package status
 */

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
	<div class="profile"></div>
	<div class="information-panel"></div>
	<div class="map"></div>
</div>
<div id="retweet-canvas" class="canvas" style="display: none;">
	<div class="timeline"></div>
	<div class="map"></div>
</div>
<?php get_footer(); ?>
