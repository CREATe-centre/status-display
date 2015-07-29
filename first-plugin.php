<?php
/*
Plugin Name: My Toolset
Plugin URI:  http://URI_Of_Page_Describing_Plugin_and_Updates
Description: This describes my plugin in a short sentence
Version:     1.5
Author:      John Smith
Author URI:  http://URI_Of_The_Plugin_Author
License:     GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Domain Path: /languages
Text Domain: my-toolset

{Plugin Name} is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.
 
{Plugin Name} is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
 
You should have received a copy of the GNU General Public License
along with {Plugin Name}. If not, see {License URI}.
*/
add_action('twitter_plugin','hello_world',1);

function hello_world(){
//fetch current user profile and timeline
?>
<style type="text/css">
  html, body, #map-canvas { height: 100%; margin: 0; padding: 0;}
</style>
<script type="text/javascript"
  src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCg5pnU_tylzyc_53vAg5IqlSj9U4sjRL4&libraries=visualization&sensor=true_or_false">
</script>
<script type="text/javascript" src="https://www.google.com/jsapi"></script>
<script type="text/javascript" src="/wordpress/wp-content/plugins/first-plugin/ClassUser.js">
</script>
<script type="text/javascript" src="/wordpress/wp-content/plugins/first-plugin/display.js">
</script>

<table border="2">
    <tr>
        <td valign="top">
            <button id="loadUser" onClick="loadUser()">Show User</button>
            <div id="displayContainer" style="min-width: 300px; min-height: 600px">
                <div>
                    Username: <input type="text" id="username" value="isatvofficial" style="max-width:125px">
                    <button id="home" onClick="loadNewUser()">set user</button>
                </div>
                <button id="home" onClick="showCurrentUser()">home</button>
                <button id="home" onClick="reloadUser()">Reload user</button>
                <div id="display"></div>
                <select id="select">
                    <option></option>
                    <option value="1 hour" onClick="showCompare()">1 hour</option>
                    <option value="1 day" onClick="showCompare()">1 day</option>
                    <option value="1 week" onClick="showCompare()">1 week</option>
                </select>
                <div id="compare"></div>
            </div>
        </td>
        <td valign="top">
            <button id="loadMap" onClick="loadMap()">Show Map</button>
            <div id="mapContainer" style="min-width: 400px; min-height: 600px">
            <div id="map-canvas" style="width: 320px; height: 480px;"></div>
            <div >
                <button id="home" onClick="updateMap()">Update Map</button>
                <button onclick="(heatT && markerT)?setDataMap(null):setDataMap(map)" >Toggle all</button>
                <button onclick="heatT?setHeatDataMap(null):setHeatDataMap(map)">Toggle heat</button>
                <button onclick="markerT?setMarkerDataMap(null):setMarkerDataMap(map)">Toggle markers</button>
            </div>
            </div>
        </td>
        <td valign="top">
            <button id="loadChart" onClick="loadChart()">Show Chart</button>
            <div id="chartContainer" style="min-width: 500px; min-height: 600px">
                <div id="curve_chart" style="width: 900px; height: 500px"></div>
                <p><b id="list_title">Retweeters at minutes after origin:</b></p>
                <ol id="list_retweeters">

                </ol>
            </div>
        </td>
    </tr>
</table> 


<script type="text/javascript">
document.getElementById("displayContainer").style.visibility='hidden';
function loadUser(){
    document.getElementById("displayContainer").style.visibility='visible';
    document.getElementById("loadUser").style.display='none';
}

//send request to getdata.php to get the required data, callback function will be called once there is a response, just a placeholder
function getData(type, id, username, user_id, callback){
    jQuery(function ($) {
        $.get("wp-content/plugins/first-plugin/getdata.php", {'type': type, 'username': username, 'id':id, 'userID':user_id}, function(data){
            callback(data);
        });
    
    });
}

</script>

<script type="text/javascript" src="/wordpress/wp-content/plugins/first-plugin/userInfoSection.js">
</script>

<script type="text/javascript">
document.getElementById("mapContainer").style.visibility='hidden';
function loadMap(){
    document.getElementById("mapContainer").style.visibility='visible';
    document.getElementById("loadMap").style.display='none';
}
  //google.maps.event.addDomListener(window, 'load', initialize);
</script>

<script type="text/javascript" src="/wordpress/wp-content/plugins/first-plugin/mapSection.js">
</script>
  
  
<!-- chart drawing test area -->


<script type="text/javascript">
document.getElementById("chartContainer").style.visibility='hidden';
function loadChart(){
    document.getElementById("chartContainer").style.visibility='visible';
    document.getElementById("loadChart").style.display='none';
}
</script>

<script type="text/javascript" src="/wordpress/wp-content/plugins/first-plugin/chartSection.js">
</script>

<?php

}


/* Runs when plugin is activated */
register_activation_hook(__FILE__,'hello_world_install'); 

/* Runs on plugin deactivation*/
register_deactivation_hook( __FILE__, 'hello_world_remove' );

function hello_world_install() {
/* Creates new database field */
add_option("hello_world_data", 'Default', '', 'yes');
}

function hello_world_remove() {
/* Deletes the database field */
delete_option('hello_world_data');
}

if ( is_admin() ){

    /* Call the html code */
    add_action('admin_menu', 'hello_world_admin_menu');

    function hello_world_admin_menu() {
        add_options_page('Hello World', 'Hello World', 'administrator',
        'hello-world', 'hello_world_html_page');
    }
}


function hello_world_html_page() {
?>
<div>
<h2>Hello World Options</h2>

<form method="post" action="options.php">
<?php wp_nonce_field('update-options'); ?>

<table width="510">
<tr valign="top">
<th width="92" scope="row">Enter Text</th>
<td width="406">
<input name="hello_world_data" type="text" id="hello_world_data"
value="<?php echo get_option('hello_world_data'); ?>" />
(ex. Hello World)</td>
</tr>
</table>

<input type="hidden" name="action" value="update" />
<input type="hidden" name="page_options" value="hello_world_data" />

<p>
<input type="submit" value="<?php _e('Save Changes') ?>" />
</p>

</form>
</div>
<?php
}
?>