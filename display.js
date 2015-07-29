//display the current user info
function showCurrentUser(){
    var content = "<ul>Current User";
    content+= "<li>@"+currentUser.screenName+"</li>"+
              "<li>following: "+currentUser.friendsCount+"</li>"+
              "<li>follower: "+currentUser.followersCount+"</li>"+
              "<li>retweets: "+currentUser.totalRetweetsCount+"</li>"+
              "<li>favorites: "+currentUser.favoritesCount+"</li>"+
              "<li>mentioned: "+currentUser.totalMentionedCount+"</li>"+
              "</ul>";
    document.getElementById("select").style.display='inline';    
    document.getElementById("compare").innerHTML="";    
    document.getElementById("display").innerHTML=content;
}

//clear user info display 
function clearDisplay(){
    document.getElementById("display").innerHTML="";
    document.getElementById("compare").innerHTML="";
    document.getElementById("select").style.display='none';
    
}
//show comparison result of current user with data in the past
function showCompare(){
    var content = "<ul>NEW";
    content+= "<li><a onClick='showFollowersList()'>Followers: "+currentUser.newFollowersList.length+"</a></li>"+
              "<li><a onClick='showTweetList(1)'>Retweet: +"+currentUser.newRetweetsCount+"</a></li>"+
              "<li><a onClick='showTweetList(2)'>Favorites: +"+currentUser.newFavoritesCount+"</li>"+
              "<li><a onClick='showTweetList(3)'>Mentioned: +"+currentUser.newMentionedCount+"</a></li>"+
              "</ul>";
    document.getElementById("compare").innerHTML=content;
}
//show list of tweets, either tweet that has new retweet, has new favorite, or has mentioned the user's name.
function showTweetList(type){
    clearDisplay();
    var content = "<ul>";
    if (type==1){
        //show list of tweets that have new retweets
        content+="new retweet";
        for (var i=0; i<currentUser.statusesList.length; i++){
            var status = currentUser.statusesList[i];
            if (status.hasNewRetweet){
                content+= "<ul><li><a onClick='showNormalUser("+status.user.id+")'>User: "+status.user.name+"</a></li>"+
                          "<li>Content: "+status.text+"</li>"+
                          "<li><a onClick='showRetweet(currentUser.statusesList["+i+"])'>Retweet Total: "+status.retweetCount+"</a></li>"+
                          "<li>Favorites: "+status.favoriteCount+"</li></ul>";
            }
        }
    } else if (type==2){
        //show list of tweets that have new favorites
        content+="new favorite";
        for (var i=0; i<currentUser.statusesList.length; i++){
            var status = currentUser.statusesList[i];
            if (status.hasNewFavorite){
                content+= "<ul><li><a onClick='showNormalUser("+status.user.id+")'>User: "+status.user.name+"</a></li>"+
                          "<li>Content: "+status.text+"</li>"+
                          "<li><a onClick='showRetweet(currentUser.statusesList["+i+"])'>Retweet Total: "+status.retweetCount+"</a></li>"+
                          "<li>Favorites: "+status.favoriteCount+"</li></ul>";
            }
        }
    } else if (type==3){
        //show list of new tweets that have mentioned user's name
        content+="new mentioned";
        for (var i=0; i<currentUser.mentionedList.length; i++){
            var status = currentUser.mentionedList[i];
            if (status.hasNewMentioned){
                content+= "<ul><li><a onClick='showNormalUser("+status.user.id+")'>User: "+status.user.name+"</a></li>"+
                          "<li>Content: "+status.text+"</li>"+
                          "<li><a onClick='showRetweet(currentUser.mentionedList["+i+"])'>Retweet Total: "+status.retweetCount+"</a></li>"+
                          "<li>Favorites: "+status.favoriteCount+"</li></ul>";
            }
        }
    }
    content+="</ul>";
    document.getElementById("display").innerHTML=content;
}

//display list of followers' ID
function showFollowersList(){
    clearDisplay();
    var content = "<ul>User List";
    for (var i=0; i<currentUser.newFollowersList.length; i++){
        content += "<li><a onClick='showNormalUser("+currentUser.newFollowersList[i]+")'>"+currentUser.newFollowersList[i]+"</a></li>";
    }
    content+= "</ul>";
    document.getElementById("display").innerHTML=content;
}

//show retweet of the selected tweet
function showRetweet(originTweet){
    clearDisplay();
    var content = "<ul>Origin Tweet";
    content+= "<li><a onClick='showNormalUser("+originTweet.user.id+")'>User: "+originTweet.user.name+"</a></li>"+
              "<li>Content: "+originTweet.text+"</a></li>"+
              "<li>Retweet Total: "+originTweet.retweetCount+"</a></li>"+
              "<li>Favorites: "+originTweet.favoriteCount+"</a></li>"+
              
              "</ul>";
    content+="<p><a onClick='updateMapChartRetweet(\""+originTweet.id+"\")'>Update Map and Chart</a></p>";
    
    content+="<ul>Retweets";
    
    
    getData("retweets", originTweet.id, null, null, function(data){
        data = JSON.parse(data);
        for (var i=0; i<data.length; i++){
            var status = new Status(data[i]);
            content+= "<ul><li><a onClick='showNormalUser("+status.user.id+")'>User: "+status.user.name+"</a></li>"+
                      "<li>Content: "+status.text+"</a></li>"+
                      "<li>Retweet Total: "+status.retweetCount+"</a></li>"+
                      "<li>Favorites: "+status.favoriteCount+"</a></li></ul>";
        }            
        content+="</ul>";
        document.getElementById("display").innerHTML=content;
    });
        
}

//update map and chart of the retweet data of the current tweet
function updateMapChartRetweet(originTweetID){
    getData("retweets", originTweetID, null, null, function(data){
        data = JSON.parse(data);
        var array=[];
        for (var i=0; i<data.length; i++){
            array.push(new Status(data[i]));
        }
        clearMapData();
        loadMapData(array);
        updateMap();
        getData("status", originTweetID,null,null, function(data){
            data = JSON.parse(data);
            var origin = new Status(data);
            
            clearChartData();
            loadChartData(origin, array);
            drawChart();
        });

    });
}

//display info of another user, not current user
function showNormalUser(userID){
    if (userID == currentUser.id) {
        showCurrentUser();
        return;
    }
    clearDisplay();
    getData("user", null, null, userID, function(data){
        var normalUser = new User();
        normalUser.loadBasicData(JSON.parse(data));
        var content = "<ul>Normal user";
        content+= "<li>@"+normalUser.screenName+"</li>"+
          "<li>following: "+normalUser.friendsCount+"</li>"+
          "<li>follower: "+normalUser.followersCount+"</li>"+
          "<li>created at: "+normalUser.createdAt+"</li>"+
          "<li>favorite: "+normalUser.favoritesCount+"</li>"+
          "<li>tweets: "+normalUser.statusesCount+"</li>"+
          "<li>listed: "+normalUser.listedCount+"</li>"+
          "</ul>";
        document.getElementById("display").innerHTML=content;
        
    });
    
}