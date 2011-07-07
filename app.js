
var express = require('express'),
	socketIO = require('socket.io'),

	config = require('./config/config.js'),	
	twitter = require('./lib/twitter'),
	twitterClient = require('./lib/twitterClient').TwitterNode ,
//	twitterClient = require('./lib/twitterMock').TwitterNode ,
	web = require('./lib/express');
	
 
var app = web.initApp(express,config);
var io = socketIO.listen(app); 

var twitterClient = new twitterClient(config);

var twitterApp = twitter.initApp(io, twitterClient, config);

io.set('log level', 1);