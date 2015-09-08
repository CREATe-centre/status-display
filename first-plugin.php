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
add_action('wp_footer','hello_world',1);
function hello_world(){
    ?>
	<link rel="stylesheet" type="text/css" href="/wordpress/wp-content/plugins/first-plugin/page.css" />
	
	<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?libraries=visualization&sensor=true_or_false"></script>
	<script type="text/javascript" src="https://www.google.com/jsapi"></script>
	
	<script type="text/javascript" src="/wordpress/wp-content/plugins/first-plugin/ClassUserBasic.js"></script>
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
					<option selected="selected"></option>
					<option onClick="getRelatedTweetsTree(1)">All</option>
					<option onClick="getRelatedTweetsTree(2)">1 day</option>
					<option onClick="getRelatedTweetsTree(3)">1 week</option>
					<option onClick="getRelatedTweetsTree(4)">2 week</option>
					<option onClick="getRelatedTweetsTree(5)">3 week</option>
					<option onClick="getRelatedTweetsTree(6)">1 month</option>
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
	

	
	var currentUser = null;
	var all=[];
	
	//initial display user's profile and list all the related tweets
	reloadUser();
	//getRelatedTweetsTree(1);
	
	//initialize map and chart
	//MAP SECTION
	var map = new MapClass("map-canvas", "information");
	
	//CHART SECTION
	var chart = new ChartClass('curve_chart', 'information');
	
	
	/*
		Function: reloadUser

		get the user profile and display it
		used function getDataFromRestApis to get user profile
		
		See also:
			<getDataFromRestApis>
	*/
	function reloadUser(){
		getDataFromRestApis("user", "21439144", null, null, function(data){
			data = JSON.parse(data);
			currentUser = new User(data);
			var content = "<ul><b>Current User</b>";
			content+= "<li>@"+currentUser.screenName+"</li>"+
						"<li>following: "+currentUser.friendsCount+"</li>"+
						"<li>follower: "+currentUser.followersCount+"</li>"+
						"<li>favorites: "+currentUser.favoritesCount+"</li>"+
						"</ul>";
			  
			document.getElementById("mainProfile").innerHTML=content;
		});
	}
	
	/*
		Function: getDataFromRestApis

		a general purpose function to get data from twitter rest apis

		Parameters:
			type - type of query to call. Currently, there are 5 type of query:
				"user" - get user profile
				"timeline" - get user tweets
				"follower" - get list of followers
				"retweets" - get list of retweets of a tweet
				"status" - get information on a tweet
			id - tweet id
			username - user screen name
			user_id - user id
			callback - callback function will be called after the data is returned
	*/
	//send request to getdata.php to get the required data, callback function will be called once there is a response
    function getDataFromRestApis(type, id, username, user_id, callback){
        jQuery(function ($) {
            $.get("wp-content/plugins/first-plugin/getdata.php", {'type': type, 'username': username, 'id':id, 'userID':user_id}, function(data){
                callback(data);
            });
        
        });
    }
	
	/*
		Function: getRelatedTweetsTree

		call to php file to get all related tweets after a specific time
		the returned data is then pushed on to other functions to populate the array and display
		
		Parameters:
			options - choose which range of time to get the related tweets:
				1 - all the tweets
				2 - 1 day
				3 - 1 week
				4 - 2 weeks
				5 - 3 weeks
				6 - 1 month
				
		See also:
			<populateData>
			<display>
	*/
    function getRelatedTweetsTree(options){
		document.getElementById("recordedTweets").innerHTML = "";
		all = [];
		
		var date = '';
		var dateObj = '';
		if (options == 2) {
			dateObj = new Date((new Date()).getTime() - 24 * 60 * 60 * 1000);
		} else if (options == 3){
			dateObj = new Date((new Date()).getTime() - 7 * 24 * 60 * 60 * 1000);
		} else if (options == 4){
			dateObj = new Date((new Date()).getTime() - 14 * 24 * 60 * 60 * 1000);
		} else if (options == 5){
			dateObj = new Date((new Date()).getTime() - 21 * 24 * 60 * 60 * 1000);
		} else if (options == 6){
			dateObj = new Date((new Date()).getTime() - 30 * 24 * 60 * 60 * 1000);
		}
		if (dateObj!='') date = dateObj.toUTCString();
        jQuery(function ($) {
			//
			$.get("wp-content/plugins/first-plugin/analyseStream.php", {'date':date}, function(data){
				
				data = JSON.parse(data);
				
				populateData(data);

				display();
			});
		
		});
	}
	
	/*
		Function: populateData

		get the returned data, convert from json to status object, and put into a big array, structured like a tree
		
		Parameters:
			data - the returned array of tweet information formatted as json
		
		See also:
			<convertJsonIntoStatusObj>
	*/
	function populateData(data){
		for (i in data){
			if (i==0){
				var arr = data[i];
				
				for (j in arr){
					all.push(convertJsonIntoStatusObj(arr[j]));
				}
				
			} else {
				var obj = [];
				obj["json"] = JSON.stringify(JSON.parse(data[i][0]["json"]).retweeted_status);
				obj["children"] = data[i];
				all.push(convertJsonIntoStatusObj(obj));
			}
		}
	}
	
	/*
		Function: convertJsonIntoStatusObj

		recursively convert the json component of this object and its children into Status
		
		Parameters:
			original - the original object with json component
	*/
	function convertJsonIntoStatusObj(original){
		
		var obj = [];
		obj ["status"] = new Status(JSON.parse(original["json"]));
		obj["children"] = [];
		if (original["children"]) {
			for (i in original["children"]){
				obj["children"].push(convertJsonIntoStatusObj(original["children"][i]));
			}
			
		}
		return obj;
		
	}
	
	/*
		Function: display

		call a recursive function to display the data stored in `all` array
				
		See also:
			<recursiveList>
	*/
	function display(){
		//-----
		if (all.length>0){
			
			document.getElementById("recordedTweets").innerHTML = recursiveList(all);
		}
		
		
    }
	
	/*
		Function: recursiveList

		recursively search all the object and display as an html list
		
		Parameters:
			array - the array to search
			stack - used to track the location String for each tweet
	*/
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
			
			//continue to recursive deeper if still have children
			if (array[i]["children"].length>0){
				result+="><div id=\""+status.id+"\" onClick=\"displayCurrentStatus(\'"+pos.toString()+"\')\"><button><b>"+status.user.screenName+":</b> "+status.text+"</div>"+recursiveList(array[i]["children"],pos.toString())+"</button>";
			} else {
				result+="id=\""+status.id+"\" onClick=\"displayCurrentStatus(\'"+pos.toString()+"\')\"><button><b>"+status.user.screenName+":</b> "+status.text+"</button>";
				//loadItem(array[i]["order"], array[i]["id"]);
			}
			result+="</li>";
			
		}
		result +="</ul>";
		return result;
		
	}

	/*
		Function: displayCurrentStatus

		display information of a status, show any related information on the map and the chart
		is called when an item is clicked from the related tweet list
		
		Parameters:
			locationString - indicates the status location in the array
	*/
	function displayCurrentStatus(locationString){
		var obj = getObjFromString(locationString);
		
		map.clearMapData();
		map.loadMapData(obj, locationString);
		
		chart.clearChartData();        
		chart.loadChartData(obj, locationString, false);
		chart.drawChart();
		
		document.getElementById("information").innerHTML =generateInformationTable([locationString]);
	}
	
	/*
		Function: getObjFromString

		retrieve the object in the array from locationString
		is called by many functions
		
		Parameters:
			locationString - indicates the status location in the array
	*/
	function getObjFromString(locationString){

		var arr = all;
		var locationArr = locationString.split(",");
		for (var i=0; i<locationArr.length; i++) {
			arr=arr[locationArr[i]];
			if (i+1<locationArr.length)
				arr = arr["children"];
		}
		
		if (arr) return arr;
		else return null;
	}

	/*
		Function: generateStatusInfoFromString

		get status from location string then pass to another function to generate html string containing information of the status
		
		Parameters:
			locationString - indicates the status location in the array
			
		Returns:
			the html string containing information of the status
			
		See also:
			<getObjFromString>
			<generateStatusInfoFromStatus>
	*/
	function generateStatusInfoFromString(locationString){
		var status = getObjFromString(locationString)["status"];
		return generateStatusInfoFromStatus(status);
	}
	
	/*
		Function: generateStatusInfoFromString

		generate status information in the form of html
		
		Parameters:
			status - the status object to analyse
			
		Returns:
			the html string containing information of the status
	*/
	 function generateStatusInfoFromStatus(status){
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
	
	/*
		Function: displayAll

		display all the tweets stored in the array to both the map and the chart
	*/
	function displayAll(){

		map.clearMapData();
		map.loadMapData(all,0);
		
		chart.clearChartData();
		chart.loadChartData(all, 0,false);
		chart.drawChart();
		
	}
	
	/*
		Function: generateInformationTable

		Find all status from the location String array
		then generate information on all of them and put into a table
		
		Parameters:
			array - array of location String
			
		Returns:
			the html string containing information on all the requested statuses
	*/
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
		//search in each group having the same origin
		for (var i=0; i<table.length; i++){
			if (table[i]) {
				
				var showOrigin = false;
				var hasNewRetweets = false;
				var hasNewOrigin = false;
				for(var j=0; j<table[i].length; j++){
					//if a true original tweet
					if (table[i][j].split(",").length==1) {
						originLength++;
						hasNewOrigin = true;
						var rowspan = 1;
						if (all[i]["children"].length > 0)
							var rowspan = all[i]["children"].length;
						
						originContent += "<tr><td rowspan=\""+rowspan+"\" valign=\"top\">"+generateStatusInfoFromString(table[i][j])+"</td>";
						
						//list all the retweets if available
						for(var k=0; k<all[i]["children"].length; k++){
							if (k!=0) originContent +="<tr>";
							originContent += "<td>"+generateStatusInfoFromStatus(all[i]["children"][k]["status"])+"</td></tr>";
						}
						
					} else {
						//if a retweet
						retweetsLength++;
						hasNewRetweets = true;
						retweetsContent+="<tr><td>"+generateStatusInfoFromString(table[i][j])+"</td>";
						//if has not show parent tweet, show it one time then stop
						if (!showOrigin) {
							retweetsContent+="<td rowspan=\""+table[i].length+"\" valign=\"top\">"+generateStatusInfoFromString(i.toString())+"</td>";
							showOrigin = true;
						}
						retweetsContent += "</tr>";
					}
				}
				//separator between each tweets
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
					(ex. Hello World)
				</td>
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