/*
	Class: MapClass
	
	handle the display of google map
*/
function MapClass(elementID, tagSelection){
	var self = this;
	
	this.markers =[];
	this.coorsList = [];
	this.flightPathList = [];
	this.locationStringList = [];

	this.heatMap = '';
	this.tagSelection = tagSelection;
	this.latlngbounds = new google.maps.LatLngBounds();

	this.heatStatus=false;
	this.markerStatus=false;
	this.flightPathStatus=false;

	//variable counting the number of data streams being processed
	this.beingProcessed = 0;
	
	var mapOptions = {
		zoom: 5,
		center: new google.maps.LatLng(0, 0),
		//mapTypeId: google.maps.MapTypeId.SATELLITE
	}
	//initialize map and geocoder
	this.map = new google.maps.Map(document.getElementById(elementID), mapOptions); 
	this.geocoder = new google.maps.Geocoder();

	/*
		Function: clearMapData

		Clear all data used to displaying on the map:
			all markers array, heat map, location String array, lat lng bound, coordinates array, flight path array.
	*/
	this.clearMapData = function(){
		self.showMap(false);
		for (var i=0; i<self.markers.length; i++){
			self.markers[i].setMap(null);
			delete self.markers[i];
			self.markers.splice(i,1);
			i--;
		}
		
		self.locationStringList = [];
		self.heatMap='';
		self.latlngbounds = new google.maps.LatLngBounds();
		self.coorsList = [];
		
		for (var i =0; i<self.flightPathList.length; i++){
			self.flightPathList[i].setMap(null);
			delete self.flightPathList[i];
			self.flightPathList.splice(i,1);
			i--;
		}
    }
	
	/*
		Function: loadMapData
		
		Pass the input data into CoordinateClass for retrieving the coordinates of each tweet.
		A callback function 'putDataToMap' is passed into the CoordinateClass so the coordinates will be returned here after retrieved.
		
		Parameters:
			data - either a tweet object ( array of ['status', 'children']) or an array of tweet objects
			locationString - location string of the 'data' object or the first element of 'data' array
			
		See also:
			<putDataToMap>
	*/
	this.loadMapData = function(data, locationString) {
		if (self.beingProcessed <= 0)
		{
			self.finshed=false;
			//if obj is an array
			if (!data.length) {
				data = [data];
			}
			self.beingProcessed = data.length;
			for(var i=0; i<data.length; i++){
				
				var coorClass = new CoordinateClass(data[i], (parseInt(locationString)+i).toString(), self.geocoder, self.putDataToMap);
				coorClass.startProcess();
			}
		}
    }
	
	/*
		Function: putDataToMap

		This is a callback function. It will be called when the coordinates are successfully retrieved.
		This function pass the coordinates onto different functions to stored and display

		Parameters:
			sourceCoor - the coordinates of the source Tweet
			coorList - the coordinates of the retweets of the source Tweet
			finished - is the current class finished with finding coordinate of all the tweets
		
		See also:
			<saveCoordinates>
			<saveFlightPath>
	*/
	this.putDataToMap = function(sourceCoor, coorList, finished = false){
		if (finished) {
			self.beingProcessed--;
		}
		
		if (sourceCoor.length>0)
			self.saveCoordinates(sourceCoor, sourceCoor[2], true);
		for (var i=0; i<coorList.length; i++) {
			self.saveCoordinates(coorList[i], coorList[i][2], false);
		}
		if (sourceCoor.length>0 && coorList.length>0) self.saveFlightPath(sourceCoor, coorList);
		if (self.beingProcessed <= 0) self.updateMap();
	}
	
	/*
		Function: saveFlightPath

		From the input, store the flight path drawing from the source to the retweets
		This is then put into the flight path array for displaying later.

		Parameters:
			sourceCoor - the coordinates of the source Tweet
			coorList - the coordinates of the retweets of the source Tweet
	*/
	this.saveFlightPath = function(sourceCoor, coorList){
		for (var i=0; i<coorList.length; i++){
			if (sourceCoor[0] != coorList[i][0] && sourceCoor[1] != coorList[i][1]) {
				var flightPlanCoordinates = [
					{lat: sourceCoor[0], lng: sourceCoor[1]},
					{lat: coorList[i][0], lng: coorList[i][1]}
				];
				
				var lineSymbol = {
					path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
				};

				
				var flightPath = new google.maps.Polyline({
					path: flightPlanCoordinates,
					icons: [{
						icon: lineSymbol,
						offset: '100%'
					}],
					geodesic: false,
					strokeColor: '#FF0000',
					strokeOpacity: 1.0,
					strokeWeight: 2
				});
				
				self.flightPathList.push(flightPath);
				
			}
		}
	}
	
	/*
		Function: saveCoordinates

		save coordinates into a coordinates array
		save location String to a location String array
		create a marker at the coordinates and save it to markers array
			set a click listener to the marker, display the content of all the tweets at that location
		All of these arrays will be used to display informations on the map

		Parameters:
			coordinate - the coordinates of this tweet
			locationString - the location string of this tweet
	*/
	this.saveCoordinates = function(coordinate, locationString){

        var found =false;
        //if (coorsList
		var currLatLng = new google.maps.LatLng(coordinate[0], coordinate[1]);
        for(var i=0; i<self.coorsList.length; i++){
			
            if (self.coorsList[i].G ==currLatLng.G && self.coorsList[i].K ==currLatLng.K){
				//will not add to location string list when there is any duplication with current string
                var found2=false;
				for (var j=0; j<self.locationStringList[i].length; j++){
					if (self.locationStringList[i][j] == locationString) {
						found2 = true;
						break;
					}
				}
				if (!found2)
					self.locationStringList[i].push(locationString);
                found=true;
                break;
            }
        }
		//add new marker and coordinates if not already in the arrays
        if(!found){
            self.coorsList.push(currLatLng);
            self.locationStringList.push([locationString]);
            
			var marker = new google.maps.Marker({
                position: currLatLng
            });
			
            marker.addListener('click', function() {
				document.getElementById(self.tagSelection).innerHTML = generateInformationTable(self.locationStringList[this.order]);
			}.bind({order:self.locationStringList.length-1}));
            
			self.markers.push(marker);
            //readjust coordinate bound for display purpose
            self.latlngbounds.extend(currLatLng);
        }
	}
	
	/*
		Function: updateMap

		focus map on the region containing all the coordinates
		set heat map and set all components to display: heat map, markers, flight path
	*/
    this.updateMap = function(){
		
		self.mapFocus();
        if (self.heatMap=='' || !self.heatMap) {
            self.heatMap = new google.maps.visualization.HeatmapLayer({
                data: self.coorsList
            });
        }
		
        self.showMap(true);
    }

	/*
		Function: mapFocus

		set center of the map and the bound of the map
	*/
    this.mapFocus = function(){
        self.map.setCenter(self.latlngbounds.getCenter());
        self.map.fitBounds(self.latlngbounds);
    }
	
	/*
		Function: showMap

		show all components on the map or not

		Parameters:
			bool - show flight path on the map or not
		
		See also:
			<showFlightPath>
			<showHeatMap>
			<showMarker>
	*/
    this.showMap = function(bool){
		self.showFlightPath(bool);
        self.showHeatMap(bool);
        self.showMarker(bool);
    }
	
	/*
		Function: showFlightPath

		show flight path component on the map or not

		Parameters:
			bool - show flight path on the map or not
		
		See also:
			<showMap>
			<showHeatMap>
			<showMarker>
	*/
	this.showFlightPath = function(bool) {
		self.flightPathStatus = bool;
		for (var i=0; i<self.flightPathList.length; i++) {
			if (bool)
				self.flightPathList[i].setMap(self.map);
			else self.flightPathList[i].setMap(null);
		}
		self.mapFocus();
	}
    
	/*
		Function: showHeatMap

		show heat map component on the map or not

		Parameters:
			bool - show heat map on the map or not
			
		See also:
			<showMap>
			<showFlightPath>
			<showMarker>
	*/
    this.showHeatMap = function(bool){
        if (self.heatMap == '') return;
        self.heatStatus = bool;
        if (bool)
            self.heatMap.setMap(self.map);
        else self.heatMap.setMap(null);
        self.mapFocus();
    }
    
	/*
		Function: showMarker

		show marker component on the map or not

		Parameters:
			bool - show marker on the map or not
			
		See also:
			<showMap>
			<showHeatMap>
			<showFlightPath>
	*/
    this.showMarker = function(bool){
        self.markerStatus = bool;
        for (var i=0; i<self.markers.length; i++){
            if (bool)
                self.markers[i].setMap(self.map);
            else self.markers[i].setMap(null);
        }
        self.mapFocus();
    }
    
	/*
		Function: toogleAll

		Toogle on or off the display of all components on the map
		
		See also:
			<toogleHeatMap>
			<toogleMarker>
			<toogleFlightPath>
	*/
    this.toogleAll = function(){
        var bool = true;
        if (self.heatStatus && self.markerStatus && self.flightPathStatus){
            bool = false;   
        }
		self.showMap(bool);
    }

	/*
		Function: toogleHeatMap

		Toogle on or off the display of heat map component on the map
		
		See also:
			<toogleAll>
			<toogleMarker>
			<toogleFlightPath>
	*/    
    this.toogleHeatMap = function(){
        if (self.heatStatus)
            self.showHeatMap(false);
        else self.showHeatMap(true);
    }
    
	/*
		Function: toogleMarker

		Toogle on or off the display of marker component on the map
		
		See also:
			<toogleAll>
			<toogleHeatMap>
			<toogleFlightPath>
	*/
    this.toogleMarker = function(){
        if (self.markerStatus)
            self.showMarker(false);
        else self.showMarker(true);
    }

	/*
		Function: toogleFlightPath

		Toogle on or off the display of flight path component on the map
		
		See also:
			<toogleAll>
			<toogleHeatMap>
			<toogleMarker>
	*/
	this.toogleFlightPath = function(){
        if (self.flightPathStatus)
            self.showFlightPath(false);
        else self.showFlightPath(true);
    }
}

/*
	Class: CoordinateClass
	
	handle retrieving coordinates of each stream of tweets
*/
function CoordinateClass(obj, locationString, geocoder, callback){
	this.locationString = locationString;
	this.childList = [];
	var self=this;
	this.coorList = [];
	this.geocoder = geocoder;
	this.source = obj;
	this.failedLocations=[];
	this.processedLocations = 0;
	this.callback = callback;
	this.totalObj =  0;
	
	/*
		Function: countObj

		recursively count all object in the provided tree
		
		Parameters:
			obj - the tweet object that will be analyzed
	*/
	this.countObj = function(obj){
		self.totalObj++;
		for (var i=0; i<obj["children"].length; i++){
			self.countObj(obj["children"][i]);
		}
	}
	
	this.countObj(obj);
	
	/*
		Function: findLocation

		find location of the tweet through the status object stored in the tweet object
		Only analyse one layer
		save any object that failed to retrieved coordinates due to over query limit
		when coordinates are retrieved, they are pushed on to another function for saving
		call another function for resend the request for failed query
		
		Parameters:
			obj - the tweet object that will be analyzed
			loc - location String of the object
	*/
	this.findLocation = function(obj, loc){
		
		var status = obj["status"];
		if (status.location || (!status.coordinates && status.user.location)){
			var currLocation = '';
			if (status.location) currLocation = status.location;
			else currLocation = status.user.location;
			
			self.geocoder.geocode( {'address':currLocation}, function(results, rstatus){
				if (rstatus == google.maps.GeocoderStatus.OK) {
					//console.log("processed");
					self.processedLocations++;
					
					self.saveCoor(results[0].geometry.location.G, results[0].geometry.location.K, this.loc);
					
				} else if (rstatus == google.maps.GeocoderStatus.OVER_QUERY_LIMIT){
					//save the unhandled location, order, location string, then recall after finished
					self.failedLocations.push(loc);
					//alert(status);
				} else {
					self.processedLocations++;
					//report error in case of failure
					//alert(status);
				}
				self.resendFailed();
			}.bind({loc:loc}));
			
		} else {
			self.processedLocations++;
			if (status.coordinates){
				
				self.saveCoor(status.coordinates[0], status.coordinates[1], loc);

			}
			
		}
		self.resendFailed();
	}
	
	/*
		Function: saveCoor
		
		save coordinates with the location String into coorList array
		also save this tweet into childList array based on its location String
		
		
		Parameters:
			lat - latitude of the tweet
			lng - longitude of the tweet
			loc - location String of the object
	*/
	this.saveCoor = function(lat, lng, loc){
		self.coorList[loc] = [];
		self.coorList[loc].push(lat);
		self.coorList[loc].push(lng);
		self.coorList[loc].push(loc);
	
		//get substring of location until before the last comma
		if (self.childList[loc.substring(0, loc.lastIndexOf(","))]) 
			self.childList[loc.substring(0, loc.lastIndexOf(","))].push([lat, lng, loc]);
		else self.childList[loc.substring(0, loc.lastIndexOf(","))] = [[lat, lng, loc]];
			
	}
	
	/*
		Function: resendFailed
		
		resend any tweet that failed because of query limit
		if all finished then send data back to the call back function to analyse and display on map
	*/
	this.resendFailed = function(){
		if (self.processedLocations + self.failedLocations.length >= self.totalObj) {
			var tempLocations = self.failedLocations;
			self.failedLocations = [];
			if (tempLocations.length > 0){
				
				for (var i=0; i<tempLocations.length; i++){
					setTimeout(function(){
						self.findLocation(self.getStoredObjFromString(tempLocations[i]), tempLocations[i]);
					}.bind({i:i, tempLocations:tempLocations}), 300);
					
				}
			} else {
				//console.log("source: "+self.sourceCoor[0]+","+self.sourceCoor[1]+"\n");
				for (var loc in self.coorList){
					
					if (self.childList[loc]) {
						self.callback(self.coorList[loc], self.childList[loc]);
					} else self.callback([], [self.coorList[loc]]);
				}
				
				self.callback([], [], true);
			}
		}
		//console.log((self.processedLocations + self.failedLocations.length) +","+ (self.children.length + 1));
	}
	
	/*
		Function: getStoredObjFromString
		
		get the tweet object based on the location String
		
		Parameters:
			location - location String of the object
			
		Returns:
			the located tweet object
	*/
	this.getStoredObjFromString = function(location){
		
		
		var locationArr = locationString.split(",");
		
		if (locationArr.length==1) return self.source;
		var arr = self.source["children"];
		for (var i=1; i<locationArr.length; i++) {
			arr=arr[locationArr[i]];
			if (i+1<locationArr.length)
				arr = arr["children"];
		}
		return arr;
	}
	
	/*
		Function: startProcess
		
		start the analysing process
		
		See also:
			<sendAll>
	*/
	this.startProcess = function(){
		this.sendAll(self.source, self.locationString);
		
	}
	
	/*
		Function: sendAll
		
		recursively find all object and send them all over to locate their coordinates
		
		Parameters:
			obj - the current object to send and search
			location - location String of the object
		
		See also:
			<findLocation>
	*/
	this.sendAll = function(obj, location){
		self.findLocation(obj, location);
		for (var i=0; i<obj["children"].length; i++){
			self.sendAll(obj["children"][i], location+","+i);
		}
	}
}