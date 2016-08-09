<?php
/**
 * Import functions.
 *
 * @package status
 */

/**
 * Search the database for a Tweet.
 *
 * @param integer $id Tweet ID.
 * @return mixed The database row ID, or false if not found.
 */
function find_tweet_by_id( $id ) {
	global $current_user;
	global $wpdb;
	$results = $wpdb->get_results( $wpdb->prepare(
	'SELECT * FROM ' . $wpdb->prefix . 'twitter_data WHERE user_id = %d ORDER BY created_at DESC', $current_user->ID ) );
	foreach ( $results as $result ) {
		$payload = json_decode( $result->data, true );
		if ( isset( $payload['id'] ) && $payload['id'] == $id ) {
			return $result->ID;
		}
	}
	return false;
}

/**
 * Find an analytics row by tweet ID.
 *
 * @param integer $tweet_id The tweet id.
 * @return mixed The row ID, or false if not found.
 */
function find_analytics_by_tweet_id( $tweet_id ) {
	global $wpdb;
	$id = $wpdb->get_var( $wpdb->prepare( 'SELECT * FROM '
	. $wpdb->prefix . 'twitter_analytics WHERE status_id = %d', $tweet_id ) );
	return null != $id ? $id : false;
}

if ( ( $fp = fopen( $_FILES['data']['tmp_name'], 'r' ) ) !== false ) {
	global $wpdb;
	fgetcsv( $fp );
	while ( ( $data = fgetcsv( $fp ) ) !== false ) {
		$str = '';
		$tweet_id = find_tweet_by_id( $data[0] );
		if ( false == $tweet_id ) {
			continue;
		}
		for ( $i = 4; $i < count( $data ); $i++ ) {
			if ( 6 == $i || 24 == $i ) {
				continue;
			}
			$val = '-' == $data[ $i ] ? 0 : $data[ $i ];
			$str .= ',' . $val;
		}
		$an_id = find_analytics_by_tweet_id( $tweet_id );

		if ( false != $an_id ) {
			$wpdb->delete( $wpdb->prefix . 'twitter_analytics', array( 'ID' => $an_id ) );
		}
		$sql = $wpdb->prepare( 'INSERT INTO ' . $wpdb->prefix . 'twitter_analytics VALUES (NULL, %d$str)', $tweet_id );
		$wpdb->query( $sql ); // WPCS: unprepared SQL ok.
	}
	fclose( $fp );
}

?>
