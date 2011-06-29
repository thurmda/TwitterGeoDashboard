
/**
 * Module dependencies.
 */

var express = require('express'),
	socketIO = require('socket.io'),
//	mongodb = require('mongodb'),
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
			NorthAmerica : {
				"New York" :{
					"New York": 20,
					"New York": 20,
					"New York": 20
				},
				"Boston" : 3,
				"Austin" : 12,
				"San Francisco" : 17,
				Maryland:{
					"Baltimore" : 20,
					"Philadelphia" : 3
				},
				"Atlanta" : 12,
				"Pittsburgh" : 17
			},
			Europe : {
				"London" : 13,
				"Paris" : 3,
				Spain:{
					"Madrid" : 12,
					"Barcelona": 33
					},
				"Naples" : 11
			},
			Asia: {
				a:11,
				b:11,
				c:11,
				d:{
					a:4,
					b:4,
					c:4
				},
				e:4,
				f:{
					a:7,
					b:7,
					c:7
				}
				
			}
		}
};
setInterval(function(){fWith(twitterStats, Math.random()*.5);}, 30);
function fWith(obj, fFactor){
	for(var p in obj){
		if(typeof obj[p] === "number"){
			obj[p] += (-.5 + Math.random()) *(fFactor || .01) * obj[p];
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
	tweet.score = 0;
	tweet.followers ? tweet.score += tweet.followers : null;   
	
	if(tweet.score > _bestTweet.score)
		_bestTweet = tweet;
}
var fakeTweetCounter = 0;
var txt="விலங்குகளாய், உலகனைத்தும் இகழ்ச்சிசொலப் рсан суликадо,玻 璃而 不伤身 ды зыян эйстэнзэ а у कतो, मला ते दुखत नाही אני יכול לאכול זכוכית וזה לא מזיק";
function fakeTweetStream(){
	var t = {
			 id:fakeTweetCounter++,
			 screen_name: "@" + txt.substring(Math.random()*40, 5 + Math.random()*20).replace(/\s+/g,"_"),
			 text: txt.substring(Math.random()*40, Math.random()*140),
			 followers: Math.floor((Math.random()* 300 ))
			}	
	bestTweetRules(t);
	setTimeout(fakeTweetStream,30 + Math.random()*500);
}
fakeTweetStream();



var io = socketIO.listen(app); 
io.sockets.on('connection', function (socket) {
	  socket.emit('welcome',twitterStats);
	  socket.on('sync', function (data) {
	    console.log(data);
	  });
	});

function streamStats(){
	io.sockets.json.emit('broadcast', twitterStats);
	setTimeout(streamStats, 20 + Math.random()*2000);
}
streamStats();
setInterval(function(){io.sockets.json.emit('bestTweet', bestTweet());}, config.app.bestTweetSampleInterval);