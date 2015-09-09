<?php
//session_start();
//set_time_limit (0);
$result = array();
$data='';
$tempResult = '';
$json = '';
$date = isset($_GET['date']) ? $_GET['date'] : '';
$userID = isset($_GET['userID']) ? $_GET['userID'] : '';
$page = isset($_GET['page']) ? $_GET['page'] : 1;
$originPerPage = 10;

$origin = array();

/*
	Function: storeTweet

	store item in an orderly manner, retweets will become children of origin tweet
	
	Parameters:
		json - json representation of the tweet
*/
function storeTweet($json){
	global $result;
	global $origin;
	$tweetID = $json->{"id_str"};
	$newItem = array('json' => json_encode($json), 'children'=>array());
	
	//if have parent, become to the children of that parent
	if (property_exists($json, "retweeted_status")) {
		$originID = $json->{"retweeted_status"}->{"id_str"};
		
		//$result[] = array('id' => $tweetID, 'parent_id' => $originID, 'json' => json_encode($json));
		//TODO: make random lower level child: recursive loop here until no more children or decided to stay child at that level
		//if parent not stored yet, make new item represent the parent and store
		if (!isset($origin[$originID])) {
			$tempItem = array('json' => json_encode($json->{"retweeted_status"}), 'children'=>array());
			$result[] = &$tempItem;
			$origin[$originID] = &$tempItem;
		} else {
			//if parent exist, randomly have a chance to become a child of its children
			
		}
		//add reference of the tweet to its parent
		$parent = &$origin[$originID];
		$parent['children'][]= &$newItem;
		
	} else {
		//add reference of the tweet to the result array if have no parent
		$result[] = &$newItem;
		
	}
	//add reference of current tweet to the list of origin (for ease of search, assuming any tweet can have children)
	$origin[$tweetID] = &$newItem;
}

//set up parameters to access the database
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "wordpress";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

//setup sql command
$sql = "SELECT * FROM data";
if ($date!='') {
	
	$timestamp = strtotime($date);
	$date = date("Y-m-d", $timestamp);
	$sql .= " WHERE Date>= '".$date."'";
	
}

//send sql command to database
$resultdb = $conn->query($sql);

if ($resultdb) {
	
	while($row = $resultdb->fetch_assoc()) {
		//gradually read each row
		$data = $row["data"];
		
		//get json for each status, then store in current array
		preg_match_all("#\*\*\*\*\*\r?\n(?!New listener|\r?\n)(\{.+\})\r?\n\*\*\*\*\*#", $data, $tempResult);
		
		for($i=0; $i<count($tempResult[1]); $i++) {
			$json = json_decode($tempResult[1][$i]);
			//make sure the json is that of a tweet and the either the poster is KTHopkins or have tag KTHopkins
			// && ($json->{"user"}->{"id"}==21439144 || strpos($json->{"text"},"@KTHopkins"))
			if (property_exists($json, "created_at"))
			{
				storeTweet($json);
			}
		}
		
	}
}
//close connection
$conn->close();

$arrayPage = array_slice($result, $originPerPage*($page-1), $originPerPage);
$totalPage = ceil( count($result) / $originPerPage);
//return the tree of the tweets
echo json_encode(array_merge([$totalPage],$arrayPage));
?>