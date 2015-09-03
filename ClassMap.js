function MapClass(elementID, tagSelection){
    this.processedLocationCount = 0;
    this.queryLocationCount = 0;
    this.markers =[];
    this.coorsList = [];
    this.locationStringList = [];
    this.heatMap = '';
    this.tagSelection = tagSelection;
    this.latlngbounds = new google.maps.LatLngBounds();
    var self = this;
    this.heatStatus=false;
    this.markerStatus=false;
    this.originCoor=[];
	
	this.failedLocations=[];
	
	this.flightPathList = [];
	
    var mapOptions = {
      zoom: 5,
      center: new google.maps.LatLng(0, 0),
      //mapTypeId: google.maps.MapTypeId.SATELLITE
    }
    //initialize map and geocoder
    this.map = new google.maps.Map(document.getElementById(elementID), mapOptions); 
    this.geocoder = new google.maps.Geocoder();
    
    //clear data related to the map
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
	
	//fix this, find a way to know when everything is finished
	this.queryData = -1;
	this.count=-1;
	//load data from obj array
	this.loadMapData = function(data, locationString) {
		if (self.count==-1 && self.queryData==-1){
			
			self.count = 0;
			//if obj is an array
			if (data.length) {
				self.queryData = data.length;
				for(var i=0; i<data.length; i++){
				
					var coorClass = new CoordinateClass(data[i], (parseInt(locationString)+i).toString(), self.geocoder, self.putDataToMap);
					coorClass.startProcess();
				}
			} else {
				//if not an array
				self.queryData = 1;
				var coorClass = new CoordinateClass(data, locationString, self.geocoder, self.putDataToMap);
				coorClass.startProcess();
			}
		}
    }
	
	//is called when finished getting location, now start adding data to map
	this.putDataToMap = function(sourceCoor, coorList){
		self.count++;
		//console.log(self.count);
		//alert("yes");
		if (sourceCoor.length>0)
			self.pushCoorToMap(sourceCoor, sourceCoor[2], true);
		for (var i=0; i<coorList.length; i++) {
			self.pushCoorToMap(coorList[i], coorList[i][2], false);
		}
		if (sourceCoor.length>0 && coorList.length>0) self.drawArrow(sourceCoor, coorList);
		self.updateMap();
		if (self.count >= self.queryData) {
			self.count=-1;
			self.queryData=-1;
		}
	}
	
	//draw arrow from source to the childs
	this.drawArrow = function(sourceCoor, coorList){
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
				
				flightPath.setMap(self.map);
				self.flightPathList.push(flightPath);
				
			}
		}
	}
	
	//push coordinate to map
	this.pushCoorToMap = function(coordinate, locationString, source){

		
        var found =false;
        //if (coorsList
		 var currLatLng = new google.maps.LatLng(coordinate[0], coordinate[1]);
        for(var i=0; i<self.coorsList.length; i++){
            if (self.coorsList[i].G ==currLatLng.G && self.coorsList[i].K ==currLatLng.K){
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
        if(!found){
            self.coorsList.push(currLatLng);
            self.locationStringList.push([locationString]);
            
			//http://maps.google.com/mapfiles/ms/icons/green-dot.png
            var marker = new google.maps.Marker({
                position: currLatLng
            });
			/*
			if (source){
				marker.setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png");
			} else {
				marker.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png");
			}*/
            marker.addListener('click', function() {
				
				
				
				document.getElementById(self.tagSelection).innerHTML = generateInformationTable(self.locationStringList[this.order]);
				
				
                
            }.bind({order:self.locationStringList.length-1}));
            self.markers.push(marker);
            //add coordinate to bound for display purpose
            self.latlngbounds.extend(currLatLng);
        }
		
		//draw arrow
	}
	
	
	
	
    //update map view: focus on the markers, load heatMap data, and show
    this.updateMap = function(){
		
		
        self.mapFocus();
        if (self.heatMap=='' || !self.heatMap) {
            self.heatMap = new google.maps.visualization.HeatmapLayer({
                data: self.coorsList
            });
        }

        self.showMap(true);
    }
	
	this.removeArrow = function(){
		self.flightPathList.setMap(null);
	}

    //make map focus on markers points
    this.mapFocus = function(){
        self.map.setCenter(self.latlngbounds.getCenter());
        self.map.fitBounds(self.latlngbounds);
    }

    //set display map for heatMap and markers
    this.showMap = function(bool){
        self.showHeatMap(bool);
        self.showMarker(bool);
    }
    //set display map for heatMap
    this.showHeatMap = function(bool){
        if (self.heatMap == '') return;
        self.heatStatus = bool;
        if (bool)
            self.heatMap.setMap(self.map);
        else self.heatMap.setMap(null);
        self.mapFocus();
    }
    //set display map for markers
    this.showMarker = function(bool){
        self.markerStatus = bool;
        for (var i=0; i<self.markers.length; i++){
            if (bool)
                self.markers[i].setMap(self.map);
            else self.markers[i].setMap(null);
        }
        self.mapFocus();
    }
    
    this.toogleAll = function(){
        var bool = true;
        if (self.heatStatus && self.markerStatus){
            bool = false;   
        }
        self.showHeatMap(bool);
        self.showMarker(bool);
    }
    
    this.toogleHeatMap = function(){
        if (self.heatStatus)
            self.showHeatMap(false);
        else self.showHeatMap(true);
    }
    
    this.toogleMarker = function(){
        if (self.markerStatus)
            self.showMarker(false);
        else self.showMarker(true);
    }
}

//class that handle each stream of tweet
function CoordinateClass(obj, locationString, geocoder, callback){
	this.locationString = locationString;
	this.coorList = [];
	var self=this;
	this.sourceCoor = [];
	this.geocoder = geocoder;
	this.source = obj;
	this.failedLocations=[];
	this.processedLocations = 0;
	this.callback = callback;
	this.totalObj =  0;
	this.countObj = function(obj){
		self.totalObj++;
		for (var i=0; i<obj["childs"].length; i++){
			self.countObj(obj["childs"][i]);
		}
	}
	
	this.countObj(obj);
	
	//find location of the current object
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
	
	//save coordinate of current object and its source
	this.saveCoor = function(lat, lng, loc){
		
		
			self.sourceCoor[loc] = [];
			self.sourceCoor[loc].push(lat);
			self.sourceCoor[loc].push(lng);
			self.sourceCoor[loc].push(loc);
		
			//get substring of location until before the last comma
			if (self.coorList[loc.substring(0, loc.lastIndexOf(","))]) 
				self.coorList[loc.substring(0, loc.lastIndexOf(","))].push([lat, lng, loc]);
			else self.coorList[loc.substring(0, loc.lastIndexOf(","))] = [[lat, lng, loc]];
			
	}
	
	//check if there are any failed because of limited cap, then resend after a short time
	//if all finsihed, then call the callback function
	this.resendFailed = function(){
		if (self.processedLocations + self.failedLocations.length >= self.totalObj) {
			var tempLocations = self.failedLocations;
			self.failedLocations = [];
			if (tempLocations.length > 0){
				
				for (var i=0; i<tempLocations.length; i++){
					setTimeout(function(){
						self.findLocation(self.getObj(tempLocations[i]), tempLocations[i]);
					}.bind({i:i, tempLocations:tempLocations}), 300);
					
				}
			} else {
				//console.log("source: "+self.sourceCoor[0]+","+self.sourceCoor[1]+"\n");
				for (var loc in self.sourceCoor){
					if (self.coorList[loc]) {
						self.callback(self.sourceCoor[loc], self.coorList[loc]);
					} else self.callback([], [self.sourceCoor[loc]]);
				}
				
			}
		}
		//console.log((self.processedLocations + self.failedLocations.length) +","+ (self.childs.length + 1));
	}
	
	//get obj saved at the specified location in the array
	this.getObj = function(location){
		
		var arr = self.source["childs"];
		var locationArr = locationString.split(",");
		
		if (locationArr.length==1) return self.source;
		
		for (var i=1; i<locationArr.length; i++) {
			arr=arr[locationArr[i]];
			if (i+1<locationArr.length)
				arr = arr["childs"];
		}
		return arr;
	}
	
	//start the finding process
	this.startProcess = function(){
		this.sendAll(self.source, self.locationString);
		
	}
	
	//recursively find coordinate of current obj and its children
	this.sendAll = function(obj, location){
		self.findLocation(obj, location);
		for (var i=0; i<obj["childs"].length; i++){
			self.sendAll(obj["childs"][i], location+","+i);
		}
	}
}