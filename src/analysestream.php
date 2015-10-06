<?php
/**
 * Analyse a Twitter stream.
 * @package status
 */

require_once 'util.php';

$result = array();
$data = '';
$tempResult = '';
$json = '';
$date = get_param( 'date' );
$userID = get_param( 'userID' );
$page = get_param( 'page' );
if ( empty( $page ) ) {
	$page = 1;
}
$originPerPage = 10;
$origin = array();

/**
 * Store item in an orderly manner, retweets will become children of origin tweet.
 * @param object $json representation of the tweet.
 */
function store_tweet( $json ) {
	global $result;
	global $origin;
	$tweetID = $json->{ 'id_str' };
	$newItem = array( 'json' => json_encode( $json ), 'children' => array() );

	// If have parent, become to the children of that parent.
	if ( property_exists( $json, 'retweeted_status' ) ) {
		$originID = $json->{ 'retweeted_status' }->{ 'id_str' };

		// If parent not stored yet, make new item represent the parent and store.
		if ( ! isset( $origin[ $originID ] ) ) {
			// Because this tweet is not originally recorded in the database, therefore property 'notRecored' was added to mark this.
			$tempItem = array(
					'notRecorded' => true,
					'json' => json_encode( $json->{ 'retweeted_status' } ),
					'children' => array(),
			);
			$tempItem['children'][] = &$newItem;
			$result[] = &$tempItem;
			$origin[ $originID ] = &$tempItem;
		} else {
			// If parent exist, randomly have a chance to become a child of its children.
			recursively_assign_children( $origin[ $originID ], $newItem );
		}
		// Add reference of the tweet to its parent.
	} else {
		// Add reference of the tweet to the result array if have no parent.
		$result[] = &$newItem;
	}
	// Add reference of current tweet to the list of origin (for ease of search, assuming any tweet can have children).
	$origin[ $tweetID ] = &$newItem;
}

/**
 * Currently, multi level retweet has not been implemented yet, this is a temporary solution for testing and displaying
 * recursively go deeper and deeper and random assign current child to a level of the parent
 * there is a 50% chance that the child will be assign for each level.
 * @param mixed $parentReference Reference to parent tweet array.
 * @param mixed $childReference Reference to child tweet array.
 */
function recursively_assign_children( &$parentReference, &$childReference ) {
	if ( count( $parentReference['children'] ) > 0 && rand( 1, 100 ) <= 50 ) {
		// Randomly choose a children to continue the search process.
		recursively_assign_children( $parentReference['children'][ rand( 0, count( $parentReference['children'] ) - 1 ) ], $childReference );
	} else {
		// Assign to this level.
		$parentReference['children'][] = &$childReference;
	}
}

// Set up parameters to access the database.
$servername = 'localhost';
$username = 'root';
$password = '';
$dbname = 'wordpress';

$conn = new mysqli( $servername, $username, $password, $dbname );
if ( $conn->connect_error ) {
	die( 'Connection failed: ' . esc_html( $conn->connect_error ) );
}

$sql = 'SELECT * FROM data';
if ( ! empty( $date ) ) {
	$timestamp = strtotime( $date );
	$date = date( 'Y-m-d', $timestamp );
	$sql .= ' WHERE Date>= \'' . $date . '\'';
}
$resultdb = $conn->query( $sql );

if ( $resultdb ) {
	while ( $row = $resultdb->fetch_assoc() ) {
		$data = $row['data'];
		// Get json for each status, then store in current array.
		preg_match_all( "#\*\*\*\*\*\r?\n(?!New listener|\r?\n)(\{.+\})\r?\n\*\*\*\*\*#", $data, $tempResult );
		for ( $i = 0; $i < count( $tempResult[1] ); $i++ ) {
			$json = json_decode( $tempResult[1][ $i ] );

			/*
			 * Make sure the json is that of a tweet and the either the poster is KTHopkins or have tag KTHopkins
			 * && ($json->{"user"}->{"id"}==21439144 || strpos($json->{"text"},"@KTHopkins")).
			 */
			if ( property_exists( $json, 'created_at' ) ) {
				store_tweet( $json );
			}
		}
	}
}
$conn->close();
$arrayPage = array_slice( $result, $originPerPage * ( $page - 1 ), $originPerPage );
$totalPage = ceil( count( $result ) / $originPerPage );
echo json_encode( array_merge( [ $totalPage ] ,$arrayPage ) );
?>
