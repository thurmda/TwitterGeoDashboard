var     EventEmitter = require('events').EventEmitter,
		TwitterNod = require('twitter-node-fork').TwitterNode;

var TwitterNode = exports.TwitterNode  = function(config) {
    EventEmitter.call(this);
    var me = this;
    function raiseTweet(tweet){
    	me.emit('tweet', tweet)
    }    
    var tn = new TwitterNod({
		user: config.twitter.screen_name, 
		password: config.twitter.password,
		locations: config.app.geoBoundingBox
		})
		.addListener('error', function(error) {
			console.log(error.message);
		})
		.addListener('tweet', raiseTweet)
		.addListener('end', function(resp) {
			  console.log("Twitter Stream ended... WTF?! " + resp.statusCode);
			  console.log('Check for concurent use of account: ' +config.twitter.screen_name );
		})
		return tn;
}
TwitterNode.prototype = Object.create(EventEmitter.prototype);