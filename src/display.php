<?php
/**
 * Display page.
 * @package status
 */

$url_prefix = get_stylesheet_directory_uri();
wp_enqueue_style( 'status_display',
$url_prefix . '/css/display.css', array( 'status' ), '1.0.0');
wp_enqueue_script( 'google-maps-api',
	'//maps.googleapis.com/maps/api/js?libraries=visualization&sensor=false&key='
. GOOGLE_MAPS_API_KEY, array(), 'latest' );
wp_enqueue_script( 'google-js-api', '//www.google.com/jsapi', array(), 'latest' );
wp_enqueue_script( 'status_map', $url_prefix . '/js/map.js', array(), '1.0.0' );
wp_enqueue_script( 'status_display',
	get_stylesheet_directory_uri() . '/js/display.js',
array( 'jquery' ), '1.0.0', true );
wp_localize_script( 'status_display', 'status_config', array(
		'ajaxurl' => admin_url( 'admin-ajax.php' ),
));
get_header();
?>
<div id="profile_container">
</div>
<div class="clear"></div>
<div id="timeline">	
</div>
<!--<table class="border">
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
</table>-->
<?php get_footer(); ?>
