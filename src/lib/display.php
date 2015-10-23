<?php
function get_param( $name ) {
	return array_key_exists($name, $_POST )
	? sanitize_text_field( wp_unslash( $_POST[ $name ] ) )
	: '';
}

add_action( 'wp_ajax_status.getdata' , function () {
	$type = get_param( 'type' );
	$username = get_param( 'username' );
	$tweetid = get_param( 'id' );
	$userId = get_param( 'userID' );
	
	$consumer_key = TWITTER_CONSUMER_KEY;
	$consumer_secret = TWITTER_CONSUMER_SECRET;
	global $current_user;
	$access_token = get_user_meta($current_user->ID, 'oauth_token', true);
	$access_token_secret = get_user_meta($current_user->ID, 'oauth_token_secret', true);
	require_once 'codebird.php';
	\Codebird\Codebird::setConsumerKey( $consumer_key, $consumer_secret );
	$cb = \Codebird\Codebird::getInstance();
	$cb->setToken( $access_token, $access_token_secret );
	
	$params['stringify_ids'] = true;
	if ( ! empty( $username ) ) {
		$params['screen_name'] = $username;
	}
	$params['include_rts'] = true;
	if ( ! empty( $tweetid ) ) {
		$params['id'] = $tweetid;
	}
	$params['id_str'] = $tweetid;
	if ( ! empty( $userId ) ) {
		$params['user_id'] = $userId;
	}
	switch ( $type ) {
		case 'user':
			$data = (array) $cb->users_show( $params );
			break;
		case 'timeline':
			$data = (array) $cb->statuses_userTimeline( $params );
			break;
		case 'follower':
			$data = (array) $cb->followers_ids( $params );
			break;
		case 'retweets':
			$data = (array) $cb->statuses_retweets_ID( $params );
			break;
		case 'status':
			$data = (array) $cb->statuses_show_ID( $params );
			break;
	}
	unset( $data['httpstatus'] );
	unset( $data['rate'] );
	echo json_encode( $data );
	wp_die();
} );

add_action( 'wp_ajax_status.analysestream' , function () {

	wp_die();
} );

function get_codebird_instance() {
	require_once 'codebird.php';
	global $current_user;
	\Codebird\Codebird::setConsumerKey( 
			TWITTER_CONSUMER_KEY,
			TWITTER_CONSUMER_SECRET );
	$cb = \Codebird\Codebird::getInstance();
	$cb->setToken(
			get_user_meta($current_user->ID, 'oauth_token', true),
			get_user_meta($current_user->ID, 'oauth_token_secret', true) );
	return $cb;
}

add_action( 'wp_ajax_status.get_profile' , function () {
	global $current_user;
	$cb = get_codebird_instance();
	$data = (array) $cb->users_show( array(
			'screen_name' => $current_user->display_name,
	) );
	header('Content-Type: application/json');
	echo json_encode( $data );
	wp_die();
} );
?>
