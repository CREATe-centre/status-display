//clear data related to the map
function clearMapData(){
    setDataMap(null);
    markers=[];
    heatmap='';
    latlngbounds = new google.maps.LatLngBounds();
    coorsList = [];
}

function loadMapData(data){
    processedLocationCount = 0;
    for (var i=0; i<data.length; i++){
        //Note: geocode run asynchronous, javascript may execute other command before the result is returned
        
        //if the data contain location info, call request to convert it to coordinates before loading into the data set
        if (data[i].location || (!data[i].coordinates && data[i].user.location)){
            var currLocation = data[i].location || data[i].user.location;
            geocoder.geocode( { 'address': currLocation}, function(results, status) {
                processedLocationCount++;
                if (status == google.maps.GeocoderStatus.OK) {
                    //push new coordinates to the list
                    coorsList.push(results[0].geometry.location);
                    //set new marker at the coordinate
                    var marker = new google.maps.Marker({
                        position: results[0].geometry.location
                    });
                    markers.push(marker);
                    //add coordinate to bound for display purpose
                    latlngbounds.extend(results[0].geometry.location);
                    
                } else {
                    //report error in case of failure
                    alert(status);
                }
                //if this is the last of the data, update
                if (processedLocationCount==data.length)
                    updateMap();
            });
        } else if (data[i].coordinates){
            //if coordinates are already available, then use them directly
            processedLocationCount++;
            var currLatLng = new google.maps.LatLng(data[i].coordinates[0], data[i].coordinates[1]);
            //push new coordinates to the list
            coorsList.push(currLatLng);
            //set new marker at the coordinate
            var marker = new google.maps.Marker({
                position: currLatLng
            });
            markers.push(marker);
            //add coordinate to bound for display purpose
            latlngbounds.extend(currLatLng);
            //if this is the last of the data, update
            if (processedLocationCount==data.length) updateMap();
        } else {
            //if this is the last of the data, update
            processedLocationCount++;
            if (processedLocationCount==data.length)
                updateMap();
        }
        
    }
}
//update map view: focus on the markers, load heatmap data, and show
function updateMap(){

    mapFocus();
    if (heatmap=='' || !heatmap)
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: coorsList
        });
    
    setDataMap(map);
}

//make map focus on markers points
function mapFocus(){
    map.setCenter(latlngbounds.getCenter());
    map.fitBounds(latlngbounds);
}

//set display map for heatmap and markers
function setDataMap(vmap){
    setHeatDataMap(vmap);
    setMarkerDataMap(vmap);
}
//set display map for heatmap
function setHeatDataMap(vmap){
    if (vmap==null) heatT = false;
    else heatT=true;
    heatmap.setMap(vmap);
    mapFocus();
}
//set display map for markers
function setMarkerDataMap(vmap){
    if (vmap==null) markerT = false;
    else markerT=true;
    for (var i=0; i<markers.length; i++){
        markers[i].setMap(vmap);
    }
    mapFocus();
}


