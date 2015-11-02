<?php
/**
 * Display page.
 * @package status
 */

$url_prefix = get_stylesheet_directory_uri();
wp_enqueue_style( 'status_display',
$url_prefix . '/css/display.css', array( 'status' ), '1.0.0');
wp_enqueue_script( 'google-maps-api',
	'//maps.googleapis.com/maps/api/js?libraries=visualization&sensor=false&key='
. get_option( 'status-google-maps-api-key' ), array(), 'latest' );
wp_enqueue_script( 'google-js-api', '//www.google.com/jsapi', array(), 'latest' );
wp_enqueue_script( 'moment-js',
$url_prefix . '/js/moment.min.js', array(), '2.10.6' );
wp_enqueue_script( 'moment-js-range',
	'//cdnjs.cloudflare.com/ajax/libs/moment-range/2.0.3/moment-range.min.js',
array( 'moment-js' ), '2.0.3' );
wp_enqueue_script( 'jquery-effects-fade' );
wp_enqueue_script( 'd3',
'//cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js', array(), '3.5.6' );
wp_enqueue_script( 'timeline', $url_prefix . '/js/timeline.js', array(), '1.0.0' );
wp_enqueue_script( 'status_map', $url_prefix . '/js/map.js', array(), '1.0.0' );
wp_enqueue_script( 'status_display',
	get_stylesheet_directory_uri() . '/js/display.js',
array( 'jquery' ), '1.0.0', true );
wp_localize_script( 'status_display', 'status_config', array(
		'ajaxurl' => admin_url( 'admin-ajax.php' ),
		'verify' => wp_create_nonce( 'verify' ),
));
get_header();
?>
<div id="profile_container" style="display: none;"></div>
<div class="clear"></div>
<div id="timeline" style="display: none;">	
</div>
<?php get_footer(); ?>
