function ChartClass(tagChartContainer, tagSelection){
    //set time period = 10 minutes
    this.unit = 10;
    this.unitInMilliSec = 60000*this.unit;
    this.plots=[];
    this.tagSelection=tagSelection;
    
    this.tagChartContainer=tagChartContainer;
    var self = this;
    // Load the Visualization API library
    google.load('visualization', '1.0', {'packages':['corechart']});
    //when finished loading, draw the chart
    this.longest = 0;
	this.chart = '';
    this.tempTable = '';
	
	//setup chart when loading is done
	this.setupChart = function (){
	        //set chart display location
        self.chart = new google.visualization.LineChart(document.getElementById(self.tagChartContainer));
        
        //initialize listener function, when a point is selected, show the list of users who retweet at the select time
        function selectHandler() {
            var selectedItem = self.chart.getSelection()[0];
            if (selectedItem) {
				//get all location string at the selected location and pass it on to be display
				var arr = [];
				for (var i=0; i<self.plots.length; i++){
					if (self.plots[i][selectedItem.row]) {
						for (var j=0; j<self.plots[i][selectedItem.row].length; j++){
							arr.push(self.plots[i][selectedItem.row][j]);
						}
					}
				}
				
				
				document.getElementById(self.tagSelection).innerHTML = generateInformationTable(arr);
            }
        }
        
        //add listener for interaction
        google.visualization.events.addListener(self.chart, 'select', selectHandler); 
	}
	google.setOnLoadCallback(self.setupChart);
    //clear chart related data
    this.clearChartData = function(){
        self.plots=[];
    }
	
	this.origin='';
	
	//populate data array
	this.loadChartData = function(tweetArray, locationString){
        //the chart will go from the time of the original tweet to current time
        self.plots = [];
        
		var currentArray = [];
		if (!tweetArray.length) {
			currentArray = [tweetArray];
			
			
		} else {
			currentArray = tweetArray.slice();
		}
		self.longest = 0;
		
		for (var i=0; i<currentArray.length; i++){
			self.origin = currentArray[i]["status"];
			self.plots[i] = [];
			//self.plots[i][0] = [(parseInt(locationString)+i).toString()]; 
			self.addChartData(currentArray[i], (parseInt(locationString)+i).toString(), i);
			
			//record longest array length
			//then init table base on that length
			if (self.plots[i].length>self.longest) self.longest = self.plots[i].length;
		}
		
    }
	
	//recursively add the current obj data and all its children
	this.addChartData = function(obj, locationString, plotNumber){
		for (var i=0; i<obj["childs"].length; i++){
			var current = new Date(Date.parse(obj["childs"][i]["status"].createdAt));
			var slot = Math.floor((current - (new Date(Date.parse(self.origin.createdAt))))/self.unitInMilliSec)+1;
			//extend plot array length
			if (slot>self.plots[plotNumber].length){
				self.plots[plotNumber] = self.plots[plotNumber].concat(new Array(slot-self.plots[plotNumber].length));
			}
			var location = locationString+","+i;
			if (self.plots[plotNumber][slot]) {
				self.plots[plotNumber][slot].push(location);
			} else self.plots[plotNumber][slot] = [location];
			
			self.addChartData(obj["childs"][i], location, plotNumber);
		}
		
	}
	
	//draw the chart
    this.drawChart = function() {
        var data = new google.visualization.DataTable();
        //add plot column
        data.addColumn('number','minutes');
        
		//add data rows
        var table = [];
		for (var i=0; i<self.longest; i++){
			table[i] = [self.unit*i];
			for (var j=0; j<self.plots.length; j++){
				table[i][j+1] = 0;
			}
		}
		
		//add a column for each plot line
        for(var i=0; i<self.plots.length; i++){
			
			data.addColumn('number','retweet numbers');
			for (var j=0; j<self.plots[i].length; j++) {
				var num = 0;
				if (self.plots[i][j]) {
					num = self.plots[i][j].length;
				}
				table[j][i+1] = num;
			}
			
        }
		
		//start add the table array into the chart data
		for (var i = 0; i<table.length; i++){
			data.addRow(table[i]);
		}
		self.tempTable = table;
        
        //set options for chart
        var options = {
            title: 'retweets number',
            //curveType: 'function',
            legend: { position: 'bottom' }
        };

   
        //start drawing chart
        self.chart.draw(data, options);
    }
}