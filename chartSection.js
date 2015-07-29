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