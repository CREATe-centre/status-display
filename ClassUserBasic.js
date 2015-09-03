//User object
function User(){
    this.newFollowersList = [];
    this.followersList =[];
	
    //this.parsedObj = parsedObj;
    this.name = '';
    this.screenName = '';
    this.id = '0';
    this.followersCount = 0;
    
    this.friendsCount = 0;
    this.createdAt = '';
    this.location='';
    
    this.favoritesCount = 0;
    this.statusesCount = 0;
	this.listedCount = 0;
	
    var self = this;
    //load basic data
    this.loadBasicData = function (parsedObj){
        self.name = parsedObj.name;
        self.screenName = parsedObj.screen_name;
        self.id = parsedObj.id_str;
        self.friendsCount = parsedObj.friends_count;
        self.createdAt = parsedObj.created_at;
        self.favoritesCount = parsedObj.favourites_count;
        self.statusesCount = parsedObj.statuses_count;
		
        self.followersCount = parsedObj.followers_count;
        self.listedCount = parsedObj.listed_count;
        self.location = parsedObj.location;
    } 

}

//status object
function Status(parsedObj){

    this.text = parsedObj.text;
    this.id = parsedObj.id_str;
    this.createdAt = parsedObj.created_at;
    this.replyToScreenName = parsedObj.in_reply_to_screen_name;
    this.replyToStatusID = parsedObj.in_reply_to_status_id;
    if (parsedObj.coordinates != null)
        this.coordinates = [parsedObj.coordinates.coordinates[1], parsedObj.coordinates.coordinates[0]];
    if (parsedObj.retweeted_status){
        this.retweetedStatus = new Status (parsedObj.retweeted_status);
    }
    this.favoritesCount = parsedObj.favorite_count;
    this.retweetsCount = parsedObj.retweet_count;
    
    this.hasNewRetweet = false;
    this.hasNewFavorite = false;
    this.hasNewMentioned = false;
    
    this.user = new User();
    if(parsedObj=='' || parsedObj.errors || !parsedObj) {
        return;
    }else this.user.loadBasicData(parsedObj.user);
}
