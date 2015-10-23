/**
 * ChartClass
 * @package status
 */

function ChartClass(tagChartContainer, tagSelection){
	// Set time period = 10 minutes.
	this.unit = 10;
	this.unitInMilliSec = 60000 * this.unit;
	this.plots = [];
	this.tagSelection = tagSelection;

	this.tagChartContainer = tagChartContainer;
	var self = this;
	// Load the Visualization API library.
	google.load( 'visualization', '1.0', {'packages':['corechart']} );

	this.longest = 0;
	this.chart = '';
	this.tempTable = '';

	/*
		Function: setupChart

		Setup the chart after finished loading library
	*/
	this.setupChart = function (){
		// Set chart display location on the web.
		self.chart = new google.visualization.LineChart( document.getElementById( self.tagChartContainer ) );

		// Initialize listener function, when a point is selected, show the list of users who retweet at the selected time.
		function selectHandler() {
			// Get the selected item.
			var selectedItem = self.chart.getSelection()[0];
			if (selectedItem) {
				// Get all location string at the selected position and pass it on to be display.
				var arr = [];
				for (var i = 0; i < self.plots.length; i++) {
					if (self.plots[i][selectedItem.row]) {
						for (var j = 0; j < self.plots[i][selectedItem.row].length; j++) {
							arr.push( self.plots[i][selectedItem.row][j] );
						}
					}
				}
				document.getElementById( self.tagSelection ).innerHTML = generateInformationTable( arr );
			}
		}
		// Add listener for interaction.
		google.visualization.events.addListener( self.chart, 'select', selectHandler );
	}

	// When finished loading the library, setup the chart.
	google.setOnLoadCallback( self.setupChart );

	/*
		Function: clearChartData

		Clear chart data
	*/
	this.clearChartData = function() {
		self.plots = [];
	}

	this.origin = '';

	/*
		Function: loadChartData

		load chart data from the provided tweet object or array of tweet objects
		call another function to recursively find and add data
		Parameters:
			tweetArray - the tweet object or array of tweet objects that will be analyzed
			locationString - the location String of the tweet object or the first element of the array of tweet objects
	*/
	this.loadChartData = function(tweetArray, locationString) {
		// The chart will go from the time of the original tweet to the last retweet.
		self.plots = [];

		var currentArray = [];
		if ( ! tweetArray.length) {
			currentArray = [tweetArray];
		} else {
			currentArray = tweetArray.slice();
		}
		self.longest = 0;

		for (var i = 0; i < currentArray.length; i++) {
			self.origin = currentArray[i]["status"];
			self.plots[i] = [];

			self.addChartData( currentArray[i], (parseInt( locationString ) + i ).toString(), i );

			// Record longest array length then init table base on that length.
			if (self.plots[i].length > self.longest) {
				self.longest = self.plots[i].length;
			}
		}

	}

	/*
		Function: addChartData
		recursively search and save data to an array
		Parameters:
			obj - tweet object to analyse
			locationString - the location String of the current object
			plotNumber - in case of multiple plot on the same chart, need this number to differentiate between plots
	*/
	this.addChartData = function(obj, locationString, plotNumber) {
		for (var i = 0; i < obj["children"].length; i++) {
			var current = new Date( Date.parse( obj["children"][i]["status"].createdAt ) );
			var slot = Math.floor( ( current - ( new Date( Date.parse( self.origin.createdAt ) ) ) ) / self.unitInMilliSec ) + 1;
			// Extend plot array length.
			if (slot > self.plots[plotNumber].length) {
				self.plots[plotNumber] = self.plots[plotNumber].concat( new Array( slot - self.plots[plotNumber].length ) );
			}
			var location = locationString + "," + i;
			if (self.plots[plotNumber][slot]) {
				self.plots[plotNumber][slot].push( location );
			} else {
				self.plots[plotNumber][slot] = [location];
			}

			self.addChartData( obj["children"][i], location, plotNumber );
		}

	}

	/*
		Function: drawChart
		add row, column, and draw the chart based on the data
	*/
	this.drawChart = function() {
		var data = new google.visualization.DataTable();
		// Add plot column.
		data.addColumn( 'number', 'minutes' );

		// Add data rows.
		var table = [];
		for (var i = 0; i < self.longest; i++) {
			table[i] = [self.unit * i];
			for (var j = 0; j < self.plots.length; j++) {
				table[i][j + 1] = 0;
			}
		}

		// Add a column for each plot line.
		for (var i = 0; i < self.plots.length; i++) {

			data.addColumn( 'number','retweet numbers' );
			for (var j = 0; j < self.plots[i].length; j++) {
				var num = 0;
				if (self.plots[i][j]) {
					num = self.plots[i][j].length;
				}
				table[j][i + 1] = num;
			}

		}

		// Start add the table array into the chart data.
		for (var i = 0; i < table.length; i++) {
			data.addRow( table[i] );
		}
		self.tempTable = table;

		// Set options for chart.
		var options = {
			title: 'retweets number',
			// CurveType: 'function'.
			legend: { position: 'bottom' }
		};

		// Start drawing chart.
		self.chart.draw( data, options );
	}
}
