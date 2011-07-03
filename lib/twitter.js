var TwitterNode = require('twitter-node-fork').TwitterNode;

module.exports.initApp = function(io, config){

stream = new TwitterNode({
	  user: config.twitter.screen_name, 
	  password: config.twitter.password,
	  locations: config.app.geoBoundingBox
//	  locations: [-90.834961,29.954935,  -64.599609,47.487513] //New Orleans to Maine
	})
	  .addListener('error', function(error) {
		console.log(error.message);
	  })
	  .addListener('tweet', processTweet)
	  .addListener('end', function(resp) {
		  console.log("Twitter Stream ended... WTF?! " + resp.statusCode);
		  console.log('Check for concurent use of account: ' +config.twitter.screen_name );
	  })
	  .stream();

io.sockets.on('connection', function (socket) {
	  socket.json.emit('welcome',geoStats);
	  socket.json.emit('bestTweet', bestTweet());
	});
setInterval(function(){io.sockets.json.emit('stats', stream.stats());}, config.app.statsInterval);
setInterval(function(){io.sockets.json.emit('bestTweet', bestTweet());}, config.app.bestTweetSampleInterval);
setInterval(function(){io.sockets.json.emit('broadcast', geoStats);}, config.app.geoStatsInterval);
}



var geoStats = {
		s:{
			"America" :{
				"NY" :{
					"NYC": 50,
					"Albany": 4
				},
				"PA" :{
					"Philly": 50,
					"Pitt": 4
				}
			},
			"Europe" : {
				"UK": 10,
				"FR" : 6,
				"Spain": 4
			},
			"Asia": {
				"China": {
					"HK": 20,
					"Sing" : 8
				},
				"Japan" : 4,
				"India" : 8
			},
			"Other" :{
				"Sydney": 5,
				"Mexico" :6
			}
		}
};	



var _bestTweet = {score:0};
function bestTweet(){
var tweet = _bestTweet;
_bestTweet = {score:0};
return tweet;
}
function bestTweetRules(tweet){
var score = 0;
tweet.user.followers_count ? score += tweet.user.followers_count : null;   

if(score > _bestTweet.score){
	_bestTweet = {
		score: score,
		screen_name: "@" + tweet.user.screen_name,
		avatar: tweet.user.profile_image_url,
		text: tweet.text,
		followers :tweet.user.followers_count
	}
}
}


function processTweet (tweet){
bestTweetRules(tweet);
}