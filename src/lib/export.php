<?php
header( 'Content-Type: application/bzip2' );
header( 'Content-Disposition: attachment; filename="data.json.bz2"' );
global $current_user;
global $wpdb;
$events = $wpdb->get_results( $wpdb->prepare(
	'SELECT event, data, created_at FROM ' . $wpdb->prefix
. 'twitter_data WHERE user_id = %d', $current_user->ID ) );
foreach ( $events as $result ) {
	$result->data = json_decode( $result->data );
}
echo bzcompress( json_encode( $events ) );
wp_die();
?>
