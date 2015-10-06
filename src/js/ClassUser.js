/**
 * User object.
 * @package status
 */

function User() {
	this.newFollowersList = [];
	this.followersList = [];
	this.compared = false;
	this.oldDataTime = 0;
	this.name = '';
	this.screenName = '';
	this.id = '0';
	this.newFollowersCount = 0;
	this.newListedCount = 0;
	this.followersCount = 0;
	this.friendsCount = 0;
	this.createdAt = '';
	this.location = '';
	this.listedCount = 0;
	this.favoritesCount = 0;
	this.statusesCount = 0;
	this.totalRetweetsCount = 0;
	this.newRetweetsCount = 0;
	this.totalfavoritesCount = 0;
	this.newFavoritesCount = 0;
	this.statusesList = [];
	this.newMentionedCount = 0;
	this.totalMentionedCount = 0;
	this.mentionedList = [];
	var self = this;

	this.loadBasicData = function (parsedObj){
		self.name = parsedObj.name;
		self.screenName = parsedObj.screen_name;
		self.id = parsedObj.id_str;
		self.friendsCount = parsedObj.friends_count;
		self.createdAt = parsedObj.created_at;
		self.favoritesCount = parsedObj.favourites_count;
		self.statusesCount = parsedObj.statuses_count;
		self.newRetweetsCount = 0;
		self.newFavoritesCount = 0;
		self.newMentionedCount = 0;
		self.followersCount = parsedObj.followers_count;
		self.listedCount = parsedObj.listed_count;
		self.location = parsedObj.location;
	}

	this.compareUserData = function (parsedObj, timelineObj, mentionedObj, followerObj, time) {
		self.oldDataTime = time;
		self.compared = true;
		self.newFollowersCount = parsedObj.followers_count - self.followers;
		self.newListedCount = parsedObj.listed_count - self.listed;
		var j = 0;
		for (var i = 0; i < self.statusesList.length; i++ ) {

			var status = new Status( timelineObj[j] );

			if (self.statusesList[i].id != status.id) {
				if (self.statusesList[i].retweetsCount > 0) {
					self.statusesList[i].hasNewRetweet = true;
					self.newRetweetsCount += self.statusesList[i].retweetsCount;
				}
				if (self.statusesList[i].favoritesCount > 0) {
					self.statusesList[i].hasNewFavorite = true;
					self.newFavoritesCount += self.statusesList[i].favoritesCount;
				}

			} else {
				if (self.statusesList[i].retweetsCount - status.retweetsCount != 0) {
					self.statusesList[i].hasNewRetweet = true;
					self.newRetweetsCount += self.statusesList[i].retweetsCount - status.retweetsCount;
				}

				if (self.statusesList[i].favoritesCount - status.favoritesCount != 0) {
					self.statusesList[i].hasNewFavorite = true;
					self.newFavoritesCount += self.statusesList[i].favoritesCount - status.favoritesCount;
				}
				j++;
			}
		}

		for (var i = 0; i < self.mentionedList.length; i++) {

			var status = new Status( mentionedObj[0] );

			if (self.mentionedList[i].id != status.id) {

				self.newMentionedCount++;
				self.mentionedList[i].hasNewMentioned = true;
			} else {
				break;
			}
		}

		for (var i = 0; i < self.followersList.length; i++) {
			if (self.followersList[i] != followerObj.ids[0]) {
				self.newFollowersList.push( self.followersList[i] );
			} else {
				break;
			}
		}

	}

	this.loadUserData = function (parsedObj, timelineObj, mentionedObj, followerObj){
		self.loadBasicData( parsedObj );
		self.compared = false;

		// Load old timeline, override.
		self.statusesList = [];
		self.totalRetweetsCount = 0;
		self.totalfavoritesCount = 0;
		for (var i = 0; i < timelineObj.length; i++) {
			// Save new status to list.
			var status = new Status( timelineObj[i] );
			self.statusesList.push( status );

			self.totalRetweetsCount += status.retweetsCount;
			self.totalfavoritesCount += status.favoritesCount;

		}
		self.mentionedList = [];
		self.totalMentionedCount = mentionedObj.length;
		for (var i = 0; i < mentionedObj.length; i++) {
			self.mentionedList.push( new Status( mentionedObj[i] ) );
		}
		for (var i = 0; i < followerObj.ids.length; i++) {
			self.followersList.push( followerObj.ids[i] );
		}
	}
}

function Status(parsedObj){

	this.text = parsedObj.text;
	this.id = parsedObj.id_str;
	this.createdAt = parsedObj.created_at;
	this.replyToScreenName = parsedObj.in_reply_to_screen_name;
	this.replyToStatusID = parsedObj.in_reply_to_status_id;
	if (parsedObj.coordinates != null) {
		this.coordinates = [parsedObj.coordinates.coordinates[1], parsedObj.coordinates.coordinates[0]];
	}
	if (parsedObj.retweeted_status) {
		this.retweetedStatus = new Status( parsedObj.retweeted_status );
	}
	this.favoritesCount = parsedObj.favorite_count;
	this.retweetsCount = parsedObj.retweet_count;

	this.hasNewRetweet = false;
	this.hasNewFavorite = false;
	this.hasNewMentioned = false;

	this.user = new User();
	if (parsedObj == '' || parsedObj.errors || ! parsedObj) {
		return;
	} else {
		this.user.loadBasicData( parsedObj.user );
	}
}
