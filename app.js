
/**
 * Module dependencies.
 */

var express = require('express'),
	socketIO = require('socket.io'),
//	mongodb = require('mongodb'),
	TwitterNode = require('twitter-node-fork').TwitterNode,
	config = require('./config/config.js');

var app = module.exports = express.createServer();
// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.listen(config.express.port);
console.log("Express server listening on port %d", app.address().port);











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



var io = socketIO.listen(app); 
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
	//console.dir(tweet);
	bestTweetRules(tweet);
}
stream = new TwitterNode({
	  user: config.twitter.screen_name, 
	  password: config.twitter.password,
//	  locations: [-90.834961,29.954935,  -64.599609,47.487513] //New Orleans to Maine
	  locations: [-180, -90, 180, 90]
	})
	  .addListener('error', function(error) {
		console.log(error.message);
	  })
	  .addListener('tweet', processTweet)
	  .addListener('end', function(resp) {
		  console.log("Twitter Stream ended... " + resp.statusCode);
	  })
	  .stream();
setInterval(function(){io.sockets.json.emit('stats', stream.stats());}, config.app.statsInterval);

//var fakeTweetCounter = 0;
//var txt="jlkjlsjdlfj lsdjlfkj sdljfl sdj fjsdlfjlsj fljsdl fjsldjk flsdjflj sldjfljsd flkjsdlkjflksjjosjvoijsdoivjsodmv sdmlvdlksmlk slkdjvjlkjslv jlskjv ljsljxc vjxc";
//function fakeTweetStream(){
//     var t = {
//              id:fakeTweetCounter++,
//    		  text: txt.substring(Math.random()*40, Math.random()*140),
//              user: {
//            	  	  screen_name: "@" + txt.substring(Math.random()*40, 
//            			  5 + Math.random()*20).replace(/\s+/g,'_'),
//            		  followers_count: Math.floor((Math.random()* 300 ))
//              		}
//             }
//     bestTweetRules(t);
//     setTimeout(fakeTweetStream,30 + Math.random()*500);
//}
//fakeTweetStream();

