//set default username, initialize variables
var username = 'isatvofficial';
document.getElementById("username").value = username;
var currentUser='';
//load the default user's info
reloadUser();

//load new user, called when need to change main user
function loadNewUser(){
    username = document.getElementById("username").value;
    reloadUser();
}

//reload user info
function reloadUser(){
    currentUser = new User();
    jQuery(function ($) {
        //first load set of data related to current user at the current time
        $.when( $.get("/wordpress/wp-content/plugins/first-plugin/getdata.php", {type: "user", username: username}),
        $.get("/wordpress/wp-content/plugins/first-plugin/getdata.php", {'type': "timeline", username: username}),
        $.get("/wordpress/wp-content/plugins/first-plugin/getdata.php", {'type': "follower", username: username})).done(function(a1,a2,a3){
            //load current data
            currentUser.loadUserData(JSON.parse(a1[0]), JSON.parse(a2[0]), JSON.parse(a2[0]), JSON.parse(a3[0]));
            //loading mock old data to compare to the current data
            $.when( $.get("/wordpress/wp-content/plugins/first-plugin/getOldData.php", {'type': "oldUserData"}),
            $.get("/wordpress/wp-content/plugins/first-plugin/getOldData.php", {'type': "oldTimelineData"}),
            $.get("/wordpress/wp-content/plugins/first-plugin/getOldData.php", {'type': "oldFollowerData"})).done(function(a4,a5,a6){
                //load old data and compare to current data
                currentUser.compareUserData(JSON.parse(a4[0]), JSON.parse(a5[0]), JSON.parse(a5[0]), JSON.parse(a6[0]), "1 day");
                //show the result
                showCurrentUser();
            });
        });
    });   
}