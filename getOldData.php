<?php 
//this is a mock setup to get user's old data
//currently load txt files, real one would probably load from database
session_start();
$type = $_GET['type'];
$respond = '';
switch($type) {
    case 'oldUserData':
        $respond = file_get_contents('testUser.txt');
        break;
    case 'oldTimelineData':
        $respond=file_get_contents('testTimeline.txt');
        break;
    case 'oldFollowerData':
        $respond=file_get_contents('testFollowers.txt');
        break;    
    case 'newUserData':
        $respond=file_get_contents('testNewUser.txt');
        break;
    case 'newTimelineData':
        $respond=file_get_contents('testNewTimeline.txt');
        break;
}
echo $respond;
?>