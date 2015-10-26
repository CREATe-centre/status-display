<?php
/**
 * Display page functions.
 * @package status
 */

/**
 * Extract a POST parameter.
 * @param string $name Parameter name.
 * @return mixed the parameter, or false if non-existant
 */
function get_param( $name ) {
	return isset( $_POST['verify'] )
			&& wp_verify_nonce( sanitize_text_field(
			wp_unslash( $_POST['verify'] ) ), 'display' )
			&& isset( $_POST[ $name ] )
	? sanitize_text_field( wp_unslash( $_POST[ $name ] ) )
	: false;
}

/**
 * Returns an initialized Codebird instance.
 * @return mixed initialized Codebird instance
 */
function get_codebird_instance() {
	require_once 'codebird.php';
	global $current_user;
	\Codebird\Codebird::setConsumerKey(
		TWITTER_CONSUMER_KEY,
	TWITTER_CONSUMER_SECRET );
	$cb = \Codebird\Codebird::getInstance();
	$cb->setToken(
		get_user_attribute( $current_user->ID, 'oauth_token' ),
	get_user_attribute( $current_user->ID, 'oauth_token_secret' ) );
	return $cb;
}

add_action( 'wp_ajax_status.get_tweets' , function () {
	global $current_user;
	$cb = get_codebird_instance();
	$raw = (array) $cb->statuses_userTimeline( array(
			'screen_name' => $current_user->display_name,
			'trim_user' => true,
			'count' => 200,
	) );
	$tweets = array();
	foreach ( $raw as $key => $val ) {
		if ( is_int( $key ) ) {
			array_push( $tweets, $val );
		}
	}
	header( 'Content-Type: application/json' );
	echo json_encode( $tweets );
	wp_die();
} );

add_action( 'wp_ajax_status.get_profile' , function () {
	global $current_user;
	$cb = get_codebird_instance();
	$data = (array) $cb->users_show( array(
			'screen_name' => $current_user->display_name,
	) );
	header( 'Content-Type: application/json' );
	echo json_encode( $data );
	wp_die();
} );
?>
