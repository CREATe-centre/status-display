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
add_action('wp_footer','hello_world3',1);
function hello_world3(){
    ?>
	<script type="text/javascript" src="/wordpress/wp-content/plugins/first-plugin/ClassUserBasic.js"></script>
<!--
    <script type="text/javascript"
  src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCg5pnU_tylzyc_53vAg5IqlSj9U4sjRL4&libraries=visualization&sensor=true_or_false">
</script>
-->
	<link rel="stylesheet" type="text/css" href="/wordpress/wp-content/plugins/first-plugin/page.css" />
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?libraries=visualization&sensor=true_or_false"></script>
	<script type="text/javascript" src="https://www.google.com/jsapi"></script>
	<script type="text/javascript" src="/wordpress/wp-content/plugins/first-plugin/ClassChart.js"></script>
	<script type="text/javascript" src="/wordpress/wp-content/plugins/first-plugin/ClassMap.js"></script>
	
	<table class="border">
		<tr>
			<td id="mainProfileContainer" style="min-width: 300px; min-height: 600px" valign="top">
				<div class="center"><b>CURRENT USER INFO</b></div>
				<button id="reload" onClick="reloadUser()">Reload User</button>
				<div id="mainProfile"></div>
					
				</div>
			</td>
			<td id="recordedTweetsContainer" >
				<div class="center"><b>RECENT RELATED TWEETS</b></div>
				<select id="select">
                    <option></option>
                    <option value="1 hour" onClick="">1 hour</option>
                    <option value="1 day" onClick="">1 day</option>
                    <option value="1 week" onClick="">1 week</option>
                </select>
				<div id="recordedTweets" style="max-height: 600px; overflow: scroll"></div>
				
			</td>
		</tr>
		<tr>
			<td class="center" colspan="2" style="min-width: 300px; min-height: 600px">
				<div class="center"><b>INFORMATION</b></div>
				<div id="information"></div>
			</td>
		</tr>
		<tr id="displayContainer">
			<td >
				<div class="center"><b>MAP</b></div>
				<div id="mapContainer" style="min-width: 400px; min-height: 600px">
					<div id="map-canvas" style="width: 320px; height: 480px;"></div>
					<div >
						<button id="home" onClick="map.updateMap()">Update Map</button>
						<button onclick="map.toogleAll()" >Toggle all</button>
						<button onclick="map.toogleHeatMap()">Toggle heat</button>
						<button onclick="map.toogleMarker()">Toggle markers</button>
						<button onclick="map.clearMapData()">Clear</button>
						<button onclick="displayAll()">ALL</button>
					</div>
				</div>
			</td>
			<td>
				<div class="center"><b>CHART</b></div>
				<div id="chartContainer" style="min-width: 500px; min-height: 600px">
					<div id="curve_chart" style="width: 900px; height: 500px"></div>
				</div>
			</td>
		</tr>
		
	</table>
	
	<script type="text/javascript">
	//send request to getdata.php to get the required data, callback function will be called once there is a response
    function getData(type, id, username, user_id, callback){
        jQuery(function ($) {
            $.get("wp-content/plugins/first-plugin/getdata.php", {'type': type, 'username': username, 'id':id, 'userID':user_id}, function(data){
                callback(data);
            });
        
        });
    }
	
	var currentUser = null;
	var all=[];
	
	//initial display user's profile and list all the related tweets
	reloadUser();
	getTweetsTree();
	
	//reload the user profile display when call
	function reloadUser(){
		getData("user", "21439144", null, null, function(data){
			data = JSON.parse(data);
			currentUser = new User();
			currentUser.loadBasicData(data);
			var content = "<ul><b>Current User</b>";
			content+= "<li>@"+currentUser.screenName+"</li>"+
			  "<li>following: "+currentUser.friendsCount+"</li>"+
			  "<li>follower: "+currentUser.followersCount+"</li>"+
			  "<li>favorites: "+currentUser.favoritesCount+"</li>"+
			  "</ul>";
			  
			document.getElementById("mainProfile").innerHTML=content;
		});
	}
	
	//initialize map and chart
	//MAP SECTION
	var map = new MapClass("map-canvas", "information");
	//CHART SECTION
	var chart = new ChartClass('curve_chart', 'information');
	
	//populate data into the large array
	function populateData(data){
		for (i in data){
			if (i==0){
				var arr = data[i];
				
				for (j in arr){
					all.push(getObj(arr[j]));
				}
				
			} else {
				var obj = [];
				obj["json"] = JSON.stringify(JSON.parse(data[i][0]["json"]).retweeted_status);
				obj["childs"] = data[i];
				all.push(getObj(obj));
			}
		}
	}
	
	//recursively convert current data and all its children into obj
	function getObj(ar){
		
		var obj = [];
		obj ["status"] = new Status(JSON.parse(ar["json"]));
		obj["childs"] = [];
		if (ar["childs"]) {
			for (i in ar["childs"]){
				obj["childs"].push(getObj(ar["childs"][i]));
			}
			
		}
		return obj;
		
	}
	
	//call to server to get all related tweets
    function getTweetsTree(){
        jQuery(function ($) {
            $.get("wp-content/plugins/first-plugin/analyseStream.php", function(data){
                
                data = JSON.parse(data);
				
				populateData(data);

                display();
            });
        
        });
    }
	
	//call to display all the related tweets
	function display(){
        //-----
        if (all.length>0){
			
            document.getElementById("recordedTweets").innerHTML = recursiveList(all);
        }
		
		
    }
	
	//recursively traverse all the tweets and display them accordingly
	function recursiveList(array, stack="-1"){
        var result="<ul>";
        var stackArr = [];
        if (stack!=-1) {
            stackArr = stack.split(",");
        }
        
        for (var i=0; i<array.length; i++){
            var pos = [];
            if (stack!=-1) pos = stackArr.slice();
            pos.push(i);
			
            var status = array[i]["status"];
            result+="<li ";
            
            if (array[i]["childs"]){
                result+="><div id=\""+status.id+"\" onClick=\"displayCurrentStatus(\'"+pos.toString()+"\')\"><button><b>"+status.user.screenName+":</b> "+status.text+"</div>"+recursiveList(array[i]["childs"],pos.toString())+"</button>";
            } else {
                result+="id=\""+status.id+"\" onClick=\"displayCurrentStatus(\'"+pos.toString()+"\')\"><button><b>"+status.user.screenName+":</b> "+status.text+"</button>";
                //loadItem(array[i]["order"], array[i]["id"]);
            }
            result+="</li>";
            
        }
        result +="</ul>";
        return result;
        
    }

	//display the information, location, and chart of current status
	function displayCurrentStatus(locationString){
        var obj = getObjFromLocation(locationString);
		
        map.clearMapData();
        map.loadMapData(obj, locationString);
        
		chart.clearChartData();        
        chart.loadChartData(obj, locationString, false);
        chart.drawChart();
		
		document.getElementById("information").innerHTML =generateInformationTable([locationString]);
		
		//displayStatusInformation(arr);
        //map.updateMap();
    }
	
	//get obj at the location string
	function getObjFromLocation(locationString){
		//var status = '';
		
		var arr = all;
		var locationArr = locationString.split(",");
		for (var i=0; i<locationArr.length; i++) {
			arr=arr[locationArr[i]];
			if (i+1<locationArr.length)
				arr = arr["childs"];
		}
		
		//if (arr) status = arr["status"];
		if (arr) return arr;
		else return null;
	}
    
    //generate info of a status from a location string
    function generateStatusInfo(locationString){
		var status = getObjFromLocation(locationString)["status"];
        return generateStatusInfo2(status);
    }
	
	//generate info of a status from the status obj
	 function generateStatusInfo2(status){
		var response = "<ul><b>Poster info</b>";
        response += "<li>screen name: "+status.user.screenName+"</li>" +
					"<li>following: "+status.user.friendsCount+"</li>"+
					"<li>follower: "+status.user.followersCount+"</li></ul><ul><b>Tweet info</b>"+
                    "<li>tweet time: "+status.createdAt +"</li>";
        if (status.location)
            response += "<li>status location: "+status.location+"</li>";
        if (status.coordinates)
            response += "<li>status coordinates: "+status.coordinates[0]+", "+status.coordinates[1]+"</li>";
        if (status.user.location)
            response += "<li>user location: "+status.user.location+"</li>";
        response += "<li>tweet text: "+status.text+"</li></ul>";
        return response;
	 }
	
	//load map and chart for all the tweets
	function displayAll(){

		map.clearMapData();
		map.loadMapData(all,0);
		
		chart.clearChartData();
		chart.loadChartData(all, 0,false);
		chart.drawChart();
		
	}
	
	//TODO: fix table display, optimize
	function generateInformationTable(array){
		var table = [];
		//group all the tweets that has the same origin
		for (var i=0; i<array.length; i++){
			var originString = array[i].split(",")[0];
			if (!table[parseInt(originString)]){
				table[parseInt(originString)] = [array[i]];
			} else {
				table[parseInt(originString)].push(array[i]);
			}
		}
		
		var retweetsContent="<tr><th class=\"center\">retweets</th><th class=\"center\">originate from</th></tr>";
		var originContent="<tr><th class=\"center\">origin tweets</th><th class=\"center\">has direct retweets</th></tr>";
		var originLength=0;
		var retweetsLength=0;
		for (var i=0; i<table.length; i++){
			if (table[i]) {
				var showOrigin = false;
				var hasNewRetweets = false;
				var hasNewOrigin = false;
				for(var j=0; j<table[i].length; j++){
					if (table[i][j].split(",").length==1) {
						originLength++;
						hasNewOrigin = true;
						var rowspan = 1;
						if (all[i]["childs"].length > 0)
							var rowspan = all[i]["childs"].length;
						
						originContent += "<tr><td rowspan=\""+rowspan+"\" valign=\"top\">"+generateStatusInfo(table[i][j])+"</td>";
						if (all[i]["childs"]) {
							for(var k=0; k<all[i]["childs"].length; k++){
								if (k!=0) originContent +="<tr>";
								originContent += "<td>"+generateStatusInfo2(all[i]["childs"][k]["status"])+"</td></tr>";
							}
						}
					} else {
						retweetsLength++;
						hasNewRetweets = true;
						retweetsContent+="<tr><td>"+generateStatusInfo(table[i][j])+"</td>";
						if (!showOrigin) {
							retweetsContent+="<td rowspan=\""+table[i].length+"\" valign=\"top\">"+generateStatusInfo(i.toString())+"</td>";
							showOrigin = true;
						}
						retweetsContent += "</tr>";
					}
				}
				if (hasNewRetweets)
					retweetsContent += "<tr><td colspan=\"2\"  class=\"center\">---------------</td></tr>";
				if (hasNewOrigin)
					originContent += "<tr><td colspan=\"2\"  class=\"center\">---------------</td></tr>";
			}
		}
		
		var content = "<table>";
		if (retweetsLength>0) {
			content+=retweetsContent;
		}
		if (originLength>0){
			content += originContent;
		}
		content += "</table>";
		return content;
	}
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