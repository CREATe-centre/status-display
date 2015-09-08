##How to use
* To install plugin, navigate to \wp-content\plugins in side wordpress directory.
* Create a new folder and name it first-plugin (the same as the main file first-plugin.php). If needed, the names can be changed, make sure the folder name is the same as the main php file name.
* Move all the files in this repository into the newly created folder.
* Modify the comments in the first-plugin.php to provide basic information of the plugin such as: plugin name, plugin uri, description, version, author,….
* For now, in order for this plugin to run on a different environment, some modifications have to be made in:
  - Mysql login and sql command in analyseStream.php
  - Consumer key, consumer secret, access token, and access token secret in getdata.php

##Information about each file
####codebird.php
* This is an implementation of Twitter library in PHP, used for connecting to the REST and Streaming API.*
In this context, this is temporarily being used to get main user’s profile.

####getdata.php
* This file bridges between the codebird API and the main plugin:*
  - Main plugin send a request with parameters on what information to get.
  - The parameters are analysed and the appropriate function is called in the codebird API.
  - Final result is encoded and sent back to javascript front.

####analyseStream.php
* This file let the javascript front get data from the database.*
* First, a connection is made to the database and a sql command is sent to retrieve information.
* Next, the data is passed into the main ‘while’ loop.
  - Each row is retrieved
  - Parse the json code
  - Put it into an array:
  - Each element has the following ‘properties’:
    - [‘id’, ‘parent_id’, ‘json’]
    - *The ‘id’ and ‘parent_id’ property was retrieved from the parsed json code*
* Next, a tree structure is built according to the ‘id’ and ‘parent_id’ of each tweet:
  - Each element will have the following properties:
    - [‘json’, ‘childs’]
    - *Where ‘childs’ is the array containing all the retweets of current tweet*
* The tree array then is encoded as json and return back to the javascript end

####First-plugin.php
*Main plugin for displaying the data*
This is the main part in charge of displaying the information onto the website.
First, most of the display structure is defined.
Then, a function will be called to retrieve user information (send request to getdata.php), and related tweets data (send request to analyseStream.php).
The retrieved data is then stored and display on to the website.
The structure of the final tweets tree is as follows:
- Each status is potrayed as an array with 2 properties:
  - [‘status’, ‘childs’]
  - *The ‘status’ property is actually a Status object (currently being defined in ClassUser.js), used to store main data about a tweet after converting from the original JSON format.*
  - *The ‘childs’ property stores an array, listing all the retweets of this tweet.*
  - *The structure will repeat like that for all level.*

In order to easily traverse and find the tweet in the tree, a system of ‘location string’ is used throughout the application.
Basically, the locationString is a string storing information about the location of the tweet in the tree. Ex:
- 0,2,5,1
- This String indicated that first, access the 0th element, then get the 2nd child, then continue to 5th child, then finally 1st child.

There are some utility class for displaying the information uniformly:
- generateStatusInfoFromStatus( status ) and generateStatusInfoFromString( locationString ): Retrieve an html display of a tweet
- generateInformationTable( array ): Draw the whole table base on the array of locationString
- getObjFromString( locationString ): Retrieve the tweet object given the locationString

####ClassUser.js
* Store the definition of class User and class Status (Tweet).*
The 2 classes are initialized by calling new and pass the parsed json object into it. Ex:
* var user = new User( JSON.parse( json ) );
* var status = new Status( JSON.parse( json ) );

####ClassMap.js
* Have the definition of MapClass, where all the process related to the map stored.*
* Another class is also defined in this file, CoordinateClass. This class handle finding all location of tweets inside the tree branch that is passed in. The final result is returned back  to MapClass for displaying.*
This class is initialized by passing 2 tag ID of the display elements.
* The first parameter is the tag ID of the html element in charge of hosting the map.
* The second parameter is the tag ID of the html element in charge of hosting the information of the selected location.
  - Ex:	var map = new ClassMap( ‘map-canvas’, ‘information’ )

The class will define and retrieve the necessary library for displaying the map from Google.
Load data to map by calling **loadMapData ( _data_, _locationString_ )**
Where *‘data’*is either a tweet object or an array of tweet objects. *‘locationString’* is the location String of either the *‘data’* object or the first element of *‘data’* array.
The map will automatically update after finished loading. In case manual request for display is necessary, function **updateMap()** can be called.
There are also various functions help with customizing the display components.
* showAll (bool)
* showHeatMap (bool)
* showFlightPath (bool)
* showMarker (bool)
* toogleAll ()
* toogleHeatMap ()
* toogleFlightPath ()
* toogleMarker ()
The class also has a function to clear all data: clearMapData()
Normal usage of this class would be:
* **Initialization:**
  * var map = new MapClass( ‘map-canvas’, ‘information’ );
* **Clear map and add new data for display:**
  * map.clearMapData ();
  * map.loadMapData (object, locationString);
* **Manual update:**
  * map.updateMap ();

####ClassChart.js
* Have the definition of ChartClass, where all the processes related to google chart are stored.*
This class is initialized by passing 2 tag ID of the display elements.
* The first parameter is the tag ID of the html element in charge of hosting the map.
* The second parameter is the tag ID of the html element in charge of hosting the information of the selected location.
  - Ex:	var chart = new ChartMap( ‘chart-canvas’, ‘information’ )

The class will define and retrieve the necessary library for displaying the chart from Google.
Load data to chart by calling **loadChartData ( _data_, _locationString_ )**
Where *‘data’* is either a tweet object or an array of tweet objects. *‘locationString’* is the location String of either the *‘data’* object or the first element of *‘data’* array.
The chart update will need to be called manually after finished loading. The function to draw chart is **drawChart()**.
The class also has a function to clear all data: clearChartData()
Normal usage of this class would be:
* **Initialization:**
  * var chart = new ChartClass( ‘chart-canvas’, ‘information’ );
* **Clear chart and add new data for display:**
  * chart.clearChartData ();
  * chart.loadChartData (object, locationString);
* **Manual update:**
  * chart.drawChart ();

