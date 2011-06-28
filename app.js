
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
			}
		}
};
function fWith(obj){
	for(var p in obj){
		if(typeof obj[p] === "number"){
			obj[p] += (-.5 + Math.random()) *.3 * obj[p];
		}else{
			fWith(obj[p]);
		}
	}
}
setInterval(function(){fWith(twitterStats);}, 3000);

var io = socketIO.listen(app); 
io.sockets.on('connection', function (socket) {
	  socket.emit('welcome',twitterStats);
	  socket.on('sync', function (data) {
	    console.log(data);
	  });
	});
setInterval(function(){io.sockets.json.emit('broadcast', twitterStats);}, 1000);