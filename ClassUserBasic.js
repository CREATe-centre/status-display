/*
	Class: User
	
	Store user information from parsed Json object
*/
function User(parsedObj){
	//this.parsedObj = parsedObj;
	if (parsedObj && parsedObj!='' && !parsedObj.errors) {
		this.name = parsedObj.name;
		this.screenName = parsedObj.screen_name;
		this.id = parsedObj.id_str;
		this.followersCount = 0;
		
		this.friendsCount = parsedObj.friends_count;
		this.createdAt = parsedObj.created_at;
		this.location='';
		
		this.favoritesCount = parsedObj.favourites_count;
		this.statusesCount = parsedObj.statuses_count;
		this.listedCount = parsedObj.listed_count;
		
		this.location = parsedObj.location;
	}
}

/*
	Class: Status
	
	Store tweet information from parsed Json object
*/
function Status(parsedObj){
	if (parsedObj && parsedObj!='' && !parsedObj.errors) {
		this.text = parsedObj.text;
		this.id = parsedObj.id_str;
		this.createdAt = parsedObj.created_at;
		this.replyToScreenName = parsedObj.in_reply_to_screen_name;
		this.replyToStatusID = parsedObj.in_reply_to_status_id;
		if (parsedObj.coordinates != null) {
			this.coordinates = [parsedObj.coordinates.coordinates[1], parsedObj.coordinates.coordinates[0]];
		}
		if (parsedObj.retweeted_status){
			this.retweetedStatus = new Status (parsedObj.retweeted_status);
		}
		this.favoritesCount = parsedObj.favorite_count;
		this.retweetsCount = parsedObj.retweet_count;

		this.hasNewRetweet = false;
		this.hasNewFavorite = false;
		this.hasNewMentioned = false;

		this.user = new User(parsedObj.user);
	}
}
