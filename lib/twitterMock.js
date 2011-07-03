var TwitterNode = require('twitter-node-fork').TwitterNode;

module.exports.initApp = function(io, config){
console.warn("USING FAKE TWITTER STREAM");
	
	
	
var twitterStats = {
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
setInterval(function(){fWith(twitterStats, .2);}, 30);
function fWith(obj, fFactor){
	for(var p in obj){
		if(typeof obj[p] === "number"){
			obj[p] += ((-.5 + Math.random()) *(fFactor || .01)) * obj[p];
		}else{
			fWith(obj[p]);
		}
	}
}

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


io.sockets.on('connection', function (socket) {
	  socket.json.emit('welcome',twitterStats);
	  socket.json.emit('bestTweet', bestTweet());
	});
function streamStats(){
	io.sockets.json.emit('broadcast', twitterStats);
	setTimeout(streamStats, 200 + Math.random()*2000);
}
streamStats();

setInterval(function(){io.sockets.json.emit('bestTweet', bestTweet());}, config.app.bestTweetSampleInterval);


function processTweet (tweet){
	bestTweetRules(tweet);
}
//setInterval(function(){io.sockets.json.emit('stats', stream.stats());}, config.app.statsInterval);

var fakeTweetCounter = 0;
var txt="jlkjlsjdlfj lsdjlfkj sdljfl sdj fjsdlfjlsj fljsdl fjsldjk flsdjflj sldjfljsd flkjsdlkjflksjjosjvoijsdoivjsodmv sdmlvdlksmlk slkdjvjlkjslv jlskjv ljsljxc vjxc";
function fakeTweetStream(){
     var t = {
              id:fakeTweetCounter++,
    		  text: txt.substring(Math.random()*40, Math.random()*140),
              user: {
            	  	  screen_name: "@" + txt.substring(Math.random()*40, 
            			  5 + Math.random()*20).replace(/\s+/g,'_'),
            		  followers_count: Math.floor((Math.random()* 300 ))
              		}
             }
     bestTweetRules(t);
     setTimeout(fakeTweetStream,30 + Math.random()*500);
}
fakeTweetStream();


}