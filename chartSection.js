//initialize temp retweet data for testing and placeholder
tempRetweet = [new Status(''),new Status(''),new Status(''),
            new Status(''),new Status(''),new Status(''),
            new Status(''),new Status(''),new Status(''),
            new Status(''),new Status('')];
tempRetweet[0].createdAt='Mon Jul 20 14:13:14 +0000 2015';
tempRetweet[0].user.name='user1';
tempRetweet[1].createdAt='Mon Jul 20 14:18:14 +0000 2015';
tempRetweet[1].user.name='user2';
tempRetweet[2].createdAt='Mon Jul 20 14:20:14 +0000 2015';
tempRetweet[2].user.name='user3';
tempRetweet[3].createdAt='Mon Jul 20 14:50:14 +0000 2015';
tempRetweet[3].user.name='user4';
tempRetweet[4].createdAt='Mon Jul 20 15:13:14 +0000 2015';
tempRetweet[4].user.name='user5';
tempRetweet[5].createdAt='Mon Jul 20 15:40:14 +0000 2015';
tempRetweet[5].user.name='user6';
tempRetweet[6].createdAt='Mon Jul 20 15:53:14 +0000 2015';
tempRetweet[6].user.name='user7';
tempRetweet[7].createdAt='Mon Jul 20 15:58:14 +0000 2015';
tempRetweet[7].user.name='user8';
tempRetweet[8].createdAt='Mon Jul 20 17:20:14 +0000 2015';
tempRetweet[8].user.name='user9';
tempRetweet[9].createdAt='Mon Jul 20 17:23:14 +0000 2015';
tempRetweet[9].user.name='user10';
tempRetweet[10].createdAt='Mon Jul 20 17:43:14 +0000 2015';
tempRetweet[10].user.name='user11';
          
//get current time
var now = new Date().getTime();
//get time of temp origin tweet
var tempOriginTweet = new Status('');
tempOriginTweet.createdAt = 'Mon Jul 20 11:00:00 +0000 2015';

//set time period = 10 minutes
var unit = 10;
var unitInMilliSec = 60000*unit;
var plots=[];
//load temp data for chart
loadChartData(tempOriginTweet, tempRetweet);

//clear chart related data
function clearChartData(){
    plots=[];
    now = new Date().getTime();
}

//load data for chart
function loadChartData(origin, retweetList){
    //the chart will go from the time of the original tweet to current time
    //initialize the array for plot data
    var temp = now-new Date(Date.parse(origin.createdAt));
    plots = new Array(Math.ceil((now-new Date(Date.parse(origin.createdAt)))/unitInMilliSec));
    //convert origin array to date format, calculate and store at appropriate location on plot array
    for (var i=0; i<retweetList.length; i++) {
        var current = new Date(Date.parse(retweetList[i].createdAt));
        
        var temp = now - current;
        var slot = plots.length - Math.ceil((now-current)/unitInMilliSec);
        if (plots[slot]) {
            plots[slot].push(retweetList[i].user.name);
        } else plots[slot]=[retweetList[i].user.name];
    }
}
// Load the Visualization API library
google.load('visualization', '1.0', {'packages':['corechart']});
//when finished loading, draw the chart
google.setOnLoadCallback(drawChart);

//draw the chart
function drawChart() {
    var data = new google.visualization.DataTable();
    //add plot column
    data.addColumn('number','minutes');
    data.addColumn('number','retweet numbers');

    //add data rows
    for(var i=0; i<plots.length; i++){
        var num = 0;
        if (plots[i]){
            num= plots[i].length;
        }
        data.addRows([[unit*(i+1),num]]);
    }
    
    //set options for chart
    var options = {
        title: 'retweets number',
        //curveType: 'function',
        legend: { position: 'bottom' }
    };

    //set chart display location
    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    
    //initialize listener function, when a point is selected, show the list of users who retweet at the select time
    function selectHandler() {
        var selectedItem = chart.getSelection()[0];
        if (selectedItem) {
            //change list title, clear old list
            document.getElementById('list_title').innerHTML = "Retweeters at "+(selectedItem.row+1)*unit+" minutes after origin:";
            document.getElementById('list_retweeters').innerHTML ="";
            //add list items if available
            if (plots[selectedItem.row]) {
                for(var i=0; i<plots[selectedItem.row].length; i++) {
                    jQuery(function ($) {
                        $("#list_retweeters").append("<li>"+plots[selectedItem.row][i]+"</li>");
                    });
                }
            }
        }
    }
    
    //add listener for interaction
    google.visualization.events.addListener(chart, 'select', selectHandler);    
    //start drawing chart
    chart.draw(data, options);
}