<?php
//this is just a temporary setup for querying data using twitter rest apis
session_start();

//$_SESSION['timestamp']=time();
$type = $_GET['type'];
$username = isset($_GET['username']) ? $_GET['username'] : '';
$tweetid = isset($_GET['id']) ? $_GET['id'] : '';
$userId = isset($_GET['userID']) ? $_GET['userID'] : '';

require_once ('codebird.php');
//session_start();
//assign consumer key and consumer secret
\Codebird\Codebird::setConsumerKey('IZlUGqzt0S6H8SvKGMxOjVddi', 'BYAfnN0a4XcqySyq46FCnCTRkUlxAdUmvjcXZ6eGQy6jD2tbMj'); // static, see 'Using multiple Codebird instances'

$cb = \Codebird\Codebird::getInstance();

// assign access token on each page load
$cb->setToken('1350787526-IVNzzWWmKI7EcVERihizltEOtSacum8EDKSo32e', 'f1Xt4dVJKmN7dehx78Itgy3Njx158S1Ye7C4HMoAFLD7N');


$params['stringify_ids'] = true;
if(isset($_GET['username']) && $username!=null && $username!='') $params['screen_name'] = $username; // App owner - the app has read access 
$params['include_rts'] =  true;
//$params['count'] = 20;
if(isset($_GET['id']) && $tweetid!=null && $tweetid!='') $params['id'] = $tweetid;
$params['id_str'] = $tweetid;
if(isset($_GET['userID']) && $userId!=null && $userId!='') $params['user_id'] = $userId;

//call appropriate function depend on variable 'type'
switch ($type){
case "user":
	$data = (array) $cb->users_show($params);
	break;
case "timeline":
	$data = (array) $cb->statuses_userTimeline($params);
	break;
case "follower":
	$data = (array) $cb->followers_ids($params);
	break;
case "retweets":
	$data = (array) $cb->statuses_retweets_ID($params);
	break;
case "status":

	$data = (array) $cb->statuses_show_ID($params);
	break;
}
unset($data['httpstatus']);
unset($data['rate']);

//print_r ($data);
echo json_encode($data);
    

?>