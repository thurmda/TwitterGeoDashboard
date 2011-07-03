
var express = require('express'),
	socketIO = require('socket.io'),

	config = require('./config/config.js'),	
	twitter = require('./lib/twitter'),
//	twitter = require('./lib/twitterMock'),
	web = require('./lib/express');

	
var app = web.initApp(express,config);
var io = socketIO.listen(app); 
var twitterApp = twitter.initApp(io, config);
