//User object
function User(){
    this.newFollowersList = [];
    this.followersList =[];
    this.compared = false;
    this.oldDataTime = 0;
    //this.parsedObj = parsedObj;
    this.name = '';
    this.screenName = '';
    this.id = 0;
    this.newFollowersCount = 0;
    this.newListedCount = 0;
    this.followersCount = 0;
    
    this.friendsCount = 0;
    this.createdAt = '';
    this.location='';
    this.listedCount = 0;
    
    this.favoritesCount = 0;
    this.statusesCount = 0;
    
    this.totalRetweetsCount = 0;
    this.newRetweetsCount = 0;
    
    this.totalFavoriteCount = 0;
    this.newFavoritesCount = 0;
    
    this.statusesList = [];
    
    this.newMentionedCount = 0;
    
    this.totalMentionedCount = 0;
    this.mentionedList = [];
    //load basic data
    this.loadBasicData = function (parsedObj){
        this.name = parsedObj.name;
        this.screenName = parsedObj.screen_name;
        this.id = parsedObj.id;
        this.friendsCount = parsedObj.friends_count;
        this.createdAt = parsedObj.created_at;
        this.favoritesCount = parsedObj.favourites_count;
        this.statusesCount = parsedObj.statuses_count;
        this.newRetweetsCount = 0;
        this.newFavoritesCount = 0;
        this.newMentionedCount = 0;
        this.followersCount = parsedObj.followers_count;
        this.listedCount = parsedObj.listed_count;
        this.location = parsedObj.location;
    }
    
    //compare current data with the input data
    this.compareUserData = function (parsedObj, timelineObj, mentionedObj, followerObj, time){
        //this.loadBasicData(parsedObj);
        this.oldDataTime = time;
        this.compared =true;
        this.newFollowersCount = parsedObj.followers_count - this.followers;
        this.newListedCount =  parsedObj.listed_count - this.listed;
            //load and save new difference
        
        //just override
        
        var j=0;
        //load new timeline and compare, or not
        for (var i = 0; i<this.statusesList.length; i++){
            //save new status to list
            var status = new Status(timelineObj[j]);
            //assuming that old tweet is still there in correct order
            if (this.statusesList[i].id != status.id) {
                this.newRetweetsCount += this.statusesList[i].retweetCount;
                this.newFavoritesCount += this.statusesList[i].favoriteCount;
                this.statusesList[i].hasNewRetweet = true;
                this.statusesList[i].hasNewFavorite = true;
                
            } else {
                if (this.statusesList[i].retweetsCount - status.retweetsCount !=0){
                    this.statusesList[i].hasNewRetweet = true;
                    this.newRetweetsCount += this.statusesList[i].retweetsCount - status.retweetsCount;
                }
                
                if (this.statusesList[i].favoriteCount - status.favoriteCount != 0) {
                    this.statusesList[i].hasNewFavorite = true;
                    this.newFavoritesCount += this.statusesList[i].favoriteCount - status.favoriteCount;
                }
                j++;
            }
        }
        
        for (var i=0; i<this.mentionedList.length; i++) {
            
            var status = new Status(mentionedObj[0]);
            
            if (this.mentionedList[i].id != status.id){
                
                this.newMentionedCount++;
                this.mentionedList[i].hasNewMentioned = true;
            } else {
                break;
            }
            
        
        }
        
        for (var i=0; i<this.followersList.length; i++){
            if (this.followersList[i]!=followerObj.ids[0]){
                this.newFollowersList.push(this.followersList[i]);
            } else break;
        }
        
    }
    
    //load current user data
    this.loadUserData = function (parsedObj, timelineObj, mentionedObj, followerObj){
        this.loadBasicData(parsedObj);
        this.compared = false;
        
        //load old timeline, override
        this.statusesList = [];
        this.totalRetweetsCount=0;
        this.totalFavoriteCount=0;
        for (var i = 0; i<timelineObj.length; i++){
            //save new status to list
            var status = new Status(timelineObj[i]);
            this.statusesList.push(status);
            
            this.totalRetweetsCount += status.retweetCount;
            this.totalFavoriteCount += status.favoriteCount;
            
        }
        this.mentionedList = [];
        this.totalMentionedCount = mentionedObj.length;
        for (var i=0; i<mentionedObj.length; i++) {
            
            this.mentionedList.push(new Status(mentionedObj[i]));
        }
        
        for (var i=0; i<followerObj.ids.length; i++){
            this.followersList.push(followerObj.ids[i]);
        }
        
    }
    

}

//status object
function Status(parsedObj){

    this.text = parsedObj.text;
    this.id = parsedObj.id;
    this.createdAt = parsedObj.created_at;
    this.replyToScreenName = parsedObj.in_reply_to_screen_name;
    this.replyToStatusID = parsedObj.in_reply_to_status_id;
    if (parsedObj.coordinates != null)
        this.coordinates = [parsedObj.coordinates.coordinates[1], parsedObj.coordinates.coordinates[0]];
    this.favoriteCount = parsedObj.favorite_count;
    this.retweetCount = parsedObj.retweet_count;
    
    this.hasNewRetweet = false;
    this.hasNewFavorite = false;
    this.hasNewMentioned = false;
    
    this.user = new User();
    if(parsedObj!='') this.user.loadBasicData(parsedObj.user);
}
