<?php
//session_start();
set_time_limit (0);
$result = array();
$nextOffset = -1;
$data='';
$count = 0;
$tempResult = '';
$json = '';
$date = isset($_GET['date']) ? $_GET['date'] : '';

/*
	Function: storeTweet

	store the json of the tweet into an array, as a form of ['tweet id', 'parent id', 'json']

	Parameters:
		json - json representation of the tweet
*/
function storeTweet($json){
	global $result;
	$tweetID = $json->{"id_str"};
	if (property_exists($json, "retweeted_status")) {
		$originID = $json->{"retweeted_status"}->{"id_str"};
		$result[] = array('id' => $tweetID, 'parent_id' => $originID, 'json' => json_encode($json));
	} else {
		$result[] = array('id' => $tweetID, 'parent_id' => 0, 'json' => json_encode($json));
	}
}

//make a reference tree from object and array
function buildTree($items) {

	$children = array();
	$delete = array();

	foreach($items as &$item) {
		
		//add pointer to list
		$children[$item['parent_id']][] = &$item;
	}
	unset($item);

	foreach($items as &$item) {
		//point the child to the parent
		if (isset($children[$item['id']])) {
			$item['children'] = $children[$item['id']];
			$delete1[]=$item['id'];
		}
	}

	//delete all the child which has been assigned to parents
	foreach($delete as $del){
		unset($children[$del]);
	}

	//unset unnecessary property
	foreach($items as &$item) {
		unset($item["id"]);
		unset($item["parent_id"]);
	}

	//return $children;

	return $another;
}

/*
	Function: buildTree2

	reorder the array list of tweets into a tree with retweets as children of original tweet

	Parameters:
		items - the list of all the tweets
*/
function buildTree2($items){

	$children = array();
	$another = array();
	$delete = array();


	foreach($items as &$item) {
		
		//mock multi level list, choose a random element that has the same parent as current tweet as a fake parent
		if (rand(1, 100) <= 50 && array_key_exists($item['parent_id'], $children) && count($another[$item['parent_id']])>0 && $item['parent_id']!=0) {
			$another[$children[$item['parent_id']][rand(0, count($children[$item['parent_id']])-1)]["id"]][] = &$item;
		} else {
			$another[$item['parent_id']][] =&$item;
		}
		
		//add pointer to list
		$children[$item['parent_id']][] = &$item;
	}
	unset($item);

	foreach($items as &$item) {
		//point the child to the parent
		if (isset($another[$item['id']])) {
			$item['children'] = $another[$item['id']];
			$delete[]=$item['id'];
		}
	}

	//delete all the child which has been assigned to parents
	foreach($delete as $del){
		unset($another[$del]);
	}

	//unset unnecessary property
	foreach($items as &$item) {
		unset($item["id"]);
		unset($item["parent_id"]);
	}

	//return $children;

	return $another;
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
//return the tree of the tweets
echo json_encode(buildTree2($result));
?>