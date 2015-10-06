<?php
/**
 * This is just a temporary setup for querying data using twitter rest apis
 * @package status
 */

require_once 'util.php';

$type = get_param( 'type' );
$username = get_param( 'username' );
$tweetid = get_param( 'id' );
$userId = get_param( 'userID' );

$consumer_key = 'IZlUGqzt0S6H8SvKGMxOjVddi';
$consumer_secret = 'BYAfnN0a4XcqySyq46FCnCTRkUlxAdUmvjcXZ6eGQy6jD2tbMj';
$access_token = '1350787526-IVNzzWWmKI7EcVERihizltEOtSacum8EDKSo32e';
$access_token_secret = 'f1Xt4dVJKmN7dehx78Itgy3Njx158S1Ye7C4HMoAFLD7N';
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
?>
