<?php
//session_start();
set_time_limit (0);
$result = array();
$nextOffset = -1;
$data='';
$count = 0;
$tempResult = '';
$json = '';
//

function storeTweet2($json){
    global $result;
    $tweetID = $json->{"id_str"};
    if (property_exists($json, "retweeted_status")) {
        $originID = $json->{"retweeted_status"}->{"id_str"};
        //$result[] = array('id' => $tweetID, 'parent_id' => $originID, 'order' => $order);
        $result[] = array('id' => $tweetID, 'parent_id' => $originID, 'json' => json_encode($json));
        //$count++;
        //echo $id;
    } else {
        //$result[] = array('id' => $tweetID, 'parent_id' => 0, 'order' => $order);
        $result[] = array('id' => $tweetID, 'parent_id' => 0, 'json' => json_encode($json));
    }
}

//make a reference tree from object and array
function buildTree($items) {

    $childs = array();
	$another = array();
    $delete1 = array();
	$delete2 = array();

    foreach($items as &$item) {
		
		//mock multi level list, choose a random element that has the same parent as current tweet as a fake parent
		if (rand(1, 100) <= 50 && array_key_exists($item['parent_id'], $childs) && count($another[$item['parent_id']])>0 && $item['parent_id']!=0) {
			$another[$childs[$item['parent_id']][rand(0, count($childs[$item['parent_id']])-1)]["id"]][] = &$item;
		} else {
			$another[$item['parent_id']][] =&$item;
		}
		
		//add pointer to list
		$childs[$item['parent_id']][] = &$item;
	}
    unset($item);

    foreach($items as &$item) {
        //point the child to the parent
		if (isset($childs[$item['id']])) {
            $item['childs'][] = $childs[$item['id']];
            $delete1[]=$item['id'];
        }
		
		
		//same as normal array
		if (isset($another[$item['id']])) {
            $item['childs'][] = $another[$item['id']];
            $delete2[]=$item['id'];
        }
    }
    
	//delete all the child which has been assigned to parents
    foreach($delete1 as $del){
        unset($childs[$del]);
    }
	
	
	foreach($delete2 as $del){
        unset($another[$del]);
    }
    
	//unset unnecessary property
    foreach($items as &$item) {
        unset($item["id"]);
        unset($item["parent_id"]);
    }
    
    //return $childs;
	
	return $another;
}


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

$sql = "SELECT * FROM data";
$result1 = $conn->query($sql);
/*
if ($result1->num_rows > 0) {
    // output data of each row
    while($row = $result1->fetch_assoc()) {
        echo "id: " . $row["id"]. " - Name: " . $row["firstname"]. " " . $row["lastname"]. "<br>";
    }
} else {
    echo "0 results";
}*/
$conn->close();


//gradually read ten million words at a time, get json for each status, then store in current array
while(true){
    
    $data = file_get_contents("twitter/data.json",false,null,$nextOffset,10000000);
    if ($data==='') {
        //echo "end of file";
        break;
    }
    preg_match_all("#\*\*\*\*\*\n(?!New listener|\n)(\{.+\})\n\*\*\*\*\*#", $data, $tempResult);
    
    for($i=0; $i<count($tempResult[1]); $i++) {
        $json = json_decode($tempResult[1][$i]);
        //make sure the json is that of a tweet and the either the poster is KTHopkins or have tag KTHopkins
        if (property_exists($json, "created_at") && ($json->{"user"}->{"id"}==21439144 || strpos($json->{"text"},"@KTHopkins")))
		{
            storeTweet2($json);
		}
    }
    
    $nextOffset += strrpos($data, "*****");
    if (strrpos($data, "*****")<=5) break;
}

echo json_encode(buildTree($result));







?>