
/**
 * Module dependencies.
 */

var express = require('express'),
	socketIO = require('socket.io'),
//	mongodb = require('mongodb'),
	TwitterNode = require('twitter-node-fork').TwitterNode,
	config = require('./config/config.js');
//	biz = require('./lib/biz.js');
	biz= require('./lib/mocks.js');

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
    title: 'Twitter Geo Dashboard'
  });
});

app.listen(config.express.port);
console.log("Express server listening on port %d", app.address().port);




var io = socketIO.listen(app); 
io.sockets.on('connection', function (socket) {
	  socket.json.emit('welcome',biz.twitterStats());
	  socket.json.emit('bestTweet', biz.bestTweet());
	});

biz.run(io);


stream = new TwitterNode({
	  user: config.twitter.screen_name, 
	  password: config.twitter.password,
	  locations: [-90.834961,29.954935,  -64.599609,47.487513] //New Orleans to Maine
//	  locations: [-180, -85, 180, 85]
	})
	  .addListener('error', function(error) {
		console.log(error.message);
	  })
	  .addListener('tweet', biz.processTweet)
	  .addListener('end', function(resp) {
		  console.log("Twitter Stream ended... " + resp.statusCode);
	  })
	  .stream();


