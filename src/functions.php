<?php
/**
 * WordPress function file.

 * @package status
 */

$_SERVER['HTTPS'] = true;

wp_register_style( 'status',
get_stylesheet_directory_uri() . '/style.css', array(), '1.0.0' );
wp_enqueue_style( 'font-open-san',
'//fonts.googleapis.com/css?family=Open+Sans', array(), 'latest' );

add_filter( 'show_admin_bar', function() {
	return false;
} );

add_action( 'admin_init', function() {
	register_setting(
		'status-options',
		'status-twitter-oauth-consumer-key',
	'sanitize_text_field' );
	register_setting(
		'status-options',
		'status-twitter-oauth-consumer-secret',
	'sanitize_text_field' );
	register_setting(
		'status-options',
		'status-google-maps-api-key',
	'sanitize_text_field' );
	add_settings_section(
		'status-twitter-oauth',
		'Twitter oAuth Settings',
		function () { return ''; },
	'status-options');
	add_settings_field(
		'status-twitter-oauth-consumer-key',
		'Consumer Key',
		function() {
			$option = get_option( 'status-twitter-oauth-consumer-key' );
			echo '<input id="status-twitter-oauth-consumer-key" name="status-twitter-oauth-consumer-key" size="40" type="text" value="'
			. esc_attr( $option ) . '" />';
		},
		'status-options',
	'status-twitter-oauth');
	add_settings_field(
		'status-twitter-oauth-consumer-secret',
		'Consumer Secret',
		function() {
			$option = get_option( 'status-twitter-oauth-consumer-secret' );
			echo '<input id="status-twitter-oauth-consumer-secret" name="status-twitter-oauth-consumer-secret" size="40" type="text" value="'
					. esc_attr( $option ) . '" />';
		},
		'status-options',
	'status-twitter-oauth');
	add_settings_section(
		'status-google',
		'Google Settings',
		function () { return ''; },
	'status-options');
	add_settings_field(
		'status-google-maps-api-key',
		'Maps API Key',
		function() {
			$option = get_option( 'status-google-maps-api-key' );
			echo '<input id="sstatus-google-maps-api-key" name="status-google-maps-api-key" size="40" type="text" value="'
					. esc_attr( $option ) . '" />';
		},
		'status-options',
	'status-google');
} );

add_action( 'admin_menu', function() {
	add_options_page(
		'Status Settings',
		'Status',
		'manage_options',
		'status-options',
		$f = function() {
			include 'lib/settings.php';
		}
	);
} );

add_filter( 'template_include', function( $template ) {
	if ( is_user_logged_in() ) {
		return locate_template( array( 'display.php' ) );
	} else {
		return locate_template( array( 'login.php' ) );
	}
}, 99 );

add_filter( 'query_vars', function( $vars ) {
	$vars[] = 'oauth_token';
	$vars[] = 'oauth_verifier';
	return $vars;
});

add_action( 'init', function() {
	if ( is_user_logged_in() ) {
		if ( strpos( parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ), 'data.json' ) ) {
			include 'lib/export.php';
		} else if ( strpos( parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ), 'analytics.php' )
				&& isset( $_FILES['data'] ) ) {
			include 'lib/import.php';
			include 'lib/display.php';
		} else {
			include 'lib/display.php';
		}
	} else {
		include 'lib/login.php';
	}
});
?>
