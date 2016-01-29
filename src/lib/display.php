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
			wp_unslash( $_POST['verify'] ) ), 'verify' )
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
		get_option( 'status-twitter-oauth-consumer-key' ),
	get_option( 'status-twitter-oauth-consumer-secret' ) );
	$cb = \Codebird\Codebird::getInstance();
	$cb->setToken(
		get_user_meta( $current_user->ID, 'oauth_token', true ),
	get_user_meta( $current_user->ID, 'oauth_token_secret', true ) );
	return $cb;
}

function get_tweets( $get ) {
	global $current_user;
	$cb = get_codebird_instance();
	$raw = $get( $cb, $current_user );
	$tweets = array();
	foreach ( $raw as $key => $val ) {
		if ( is_int( $key ) ) {
			array_push( $tweets, $val );
		}
	}
	header( 'Content-Type: application/json' );
	echo json_encode( $tweets );
	wp_die();
}

add_action( 'wp_ajax_status.get_tweets' , function () {
	$count = get_param( 'count' );
	if ( ! $count ) {
		status_header( 400 );
		wp_die();
	}
	get_tweets( function( $cb, $user ) {
		return (array) $cb->statuses_userTimeline( array(
			'screen_name' => $user->display_name,
			'trim_user' => false,
			'count' => intval( $count ),
		) );
	} );
} );

add_action( 'wp_ajax_status.get_retweets' , function () {
	$tweet_id = get_param( 'tweet_id' );
	$count = get_param( 'count' );
	if ( ! $tweet_id || ! $count ) {
		status_header( 400 );
		wp_die();
	}
	get_tweets( function( $cb, $user ) use ( $tweet_id ) {
		return (array) $cb->statuses_retweets_ID(
		'id=' . $tweet_id . '$count=' . $count );
	} );
} );

add_action( 'wp_ajax_status.get_mentions' , function () {
	$count = get_param( 'count' );
	if ( ! $count ) {
		status_header( 400 );
		wp_die();
	}
	get_tweets( function( $cb, $user ) {
		return (array) $cb->statuses_mentionsTimeline( array(
			'trim_user' => false,
			'count' => intval( $count ),
		) );
	} );
} );

add_action( 'wp_ajax_status.get_timeline', function() {
	global $current_user;
	global $wpdb;
	header( 'Content-Type: application/json' );
	$results = $wpdb->get_results( $wpdb->prepare(
		'SELECT event, data, created_at FROM ' . $wpdb->prefix
	. 'twitter_data WHERE user_id = %d', $current_user->ID ) );
	foreach ( $results as $result ) {
		$result->data = json_decode( $result->data );
	}
	echo json_encode( $results );
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
