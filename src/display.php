<?php
/**
 * Display page.
 * @package status
 */

$url_prefix = get_stylesheet_directory_uri();
wp_enqueue_style( 'status_display',
$url_prefix . '/css/display.css', array( 'status' ), '1.0.0');
wp_enqueue_script( 'google-maps-api',
	'https://maps.googleapis.com/maps/api/js?libraries=visualization&sensor=false&key='
. GOOGLE_MAPS_API_KEY, array());
wp_enqueue_script( 'google-js-api', 'https://www.google.com/jsapi', array(), '1.0.0' );
wp_enqueue_script( 'status_userbasic', $url_prefix . '/js/user_basic.js', array(), '1.0.0' );
wp_enqueue_script( 'status_chart', $url_prefix . '/js/chart.js', array(), '1.0.0' );
wp_enqueue_script( 'status_map', $url_prefix . '/js/map.js', array(), '1.0.0' );
wp_enqueue_script( 'status_display',
	get_stylesheet_directory_uri() . '/js/display.js',
array( 'jquery' ), '1.0.0', true );
wp_localize_script( 'status_display', 'status_config', array(
		'ajaxurl' => admin_url( 'admin-ajax.php' ),
));
get_header();
?>
<table class="border">
	<tr>
		<td id="mainProfileContainer" style="min-width: 300px; min-height: 600px" valign="top">
			<div class="center"><b>CURRENT USER INFO</b></div>
			<button id="reload" onClick="reloadUser()">Reload User</button>
			<div id="mainProfile"></div>
		</td>
		<td id="recordedTweetsContainer" style="height: 700px" valign="top">
			<div class="center"><b>RECENT RELATED TWEETS</b></div>
			<select id="select" onchange="selectRecentRelated();">
				<option value="0" selected="selected"></option>
				<option value="1">All</option>
				<option value="2">1 day</option>
				<option value="3">1 week</option>
				<option value="4">2 week</option>
				<option value="5">3 week</option>
				<option value="6">1 month</option>
			</select>
			<div>
				<button id="prevPage" type="button" onClick="getRelatedTweetsTree(currentOption, currentPage-1)">&lt;=</button>
				<b id="p">--</b>
				<button id="nextPage" type="button" onClick="getRelatedTweetsTree(currentOption, currentPage+1)">=&gt;</button>
			</div>
			<div id="recordedTweets" style="height: 600px; overflow: scroll"></div>	
		</td>
	</tr>
	<tr>
		<td class="center" colspan="2" style="min-width: 300px; min-height: 600px">
			<div class="center"><b>INFORMATION</b></div>
			<div id="information"></div>
		</td>
	</tr>
	<tr id="displayContainer">
		<td>
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
<?php get_footer(); ?>
