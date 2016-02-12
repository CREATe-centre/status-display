<?php
/**
 * Login page functions.

 * @package status
 */

require_once 'uuid.php';

add_action( 'parse_request', function( $wp ) {
	if ( array_key_exists( 'oauth_token', $wp->query_vars )
			&& array_key_exists( 'oauth_verifier', $wp->query_vars ) ) {
		$oauth_token = $wp->query_vars['oauth_token'];
		$oauth_verifier = $wp->query_vars['oauth_verifier'];
		if ( isset( $_COOKIE['status_id'] ) ) {
			$id = sanitize_text_field( wp_unslash( $_COOKIE['status_id'] ) );
		} else {
			status_header( 401 );
			wp_die();
		}
		$oauth_params = get_transient( $id );
		if ( $oauth_token != $oauth_params['oauth_token'] ) {
			status_header( 401 );
			wp_die();
		}
		$oauth = new OAuth(
			get_option( 'status-twitter-oauth-consumer-key' ),
		get_option( 'status-twitter-oauth-consumer-secret' ));
		$oauth->setToken(
			$oauth_params['oauth_token'],
		$oauth_params['oauth_token_secret'] );
		try {
			$at = $oauth->getAccessToken(
				'https://api.twitter.com/oauth/access_token',
			null, $oauth_verifier, 'POST' );
		} catch (OAuthException $e) {
			status_header( 401 );
			wp_die();
		}

		$name = $at['screen_name'];
		$user = get_user_by( 'login', $name );
		if ( ! $user ) {
			$pw = wp_generate_password( $length = 10 );
			$uid = wp_create_user( $name, $pw, $name );
			$user = get_user_by( 'id', $uid );
		}
		update_user_meta( $user->ID, 'oauth_token', $at['oauth_token'] );
		update_user_meta( $user->ID, 'oauth_token_secret', $at['oauth_token_secret'] );
		wp_set_current_user( $user->ID, $user->user_login );
		wp_set_auth_cookie( $user->ID );
	}
});

add_action( 'wp_ajax_nopriv_status.login' , function () {
	$oauth = new OAuth(
		get_option( 'status-twitter-oauth-consumer-key' ),
	get_option( 'status-twitter-oauth-consumer-secret' ));
	$r = $oauth->getRequestToken(
		'https://api.twitter.com/oauth/request_token',
	site_url());
	$id = UUID::v4();
	setcookie( 'status_id', $id, strtotime( '+1 day' ), '/' );
	set_transient( $id, $r );
	echo esc_url_raw( 'https://api.twitter.com/oauth/authenticate?oauth_token='
	. $r['oauth_token'] );
	wp_die();
} );
?>
