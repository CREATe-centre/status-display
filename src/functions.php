<?php
/**
 * WordPress function file.
 * @package status
 */

require_once 'lib/config.php';

wp_register_style( 'status',
get_stylesheet_directory_uri() . '/style.css', array(), '1.0.0' );

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
		include 'lib/display.php';
	} else {
		include 'lib/login.php';
	}
});
?>
