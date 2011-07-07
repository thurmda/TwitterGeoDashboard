console.warn("USING MOCK TWITTER STREAM!");
var     EventEmitter = require('events').EventEmitter;
//var tn = new TwitterNode({
//	  user: config.twitter.screen_name, 
//	  password: config.twitter.password,
//	  locations: config.app.geoBoundingBox
////	  locations: [-90.834961,29.954935,  -64.599609,47.487513] //New Orleans to Maine
//	})
//	  .addListener('error', function(error) {
//		console.log(error.message);
//	  })
//	  .addListener('tweet', processTweet)
//	  .addListener('end', function(resp) {
//		  console.log("Twitter Stream ended... WTF?! " + resp.statusCode);
//		  console.log('Check for concurent use of account: ' +config.twitter.screen_name );
//	  });

var TwitterNode = exports.TwitterNode  = function(config) {
	  EventEmitter.call(this);
	  var me = this;
	  this._stats = {total:0,perSecond:0};
	  this.places = [
				   { place_type: 'city',
				     country: 'United States',
				     full_name: '0'+ ', IA',
				     name: '0'},
				   { place_type: 'city',
				     country: 'United States',
				     full_name: '0'+ ', IA',
				     name: '0'},
				   { place_type: 'city',
				     country: 'United States',
				     full_name: '0'+ ', IA',
				     name: '0'},
				   { place_type: 'city',
				     country: 'United States',
				     full_name: 'New Orleans, LA',
				     name: 'New Orleans'},
				   { place_type: 'city',
				     country: 'United States',
				     full_name: 'New York, NY',
				     name: 'New York'},
				   { place_type: 'city',
				     country: 'United States',
				     full_name: 'Boston, MA',
				     name: 'Boston'},
				   { place_type: 'city',
				     country: 'United States',
				     full_name: 'Baltimore, MD',
				     name: 'Baltimore'},
				   { place_type: 'city',
				     country: 'Spain',
				     full_name: 'Madrid, ??',
				     name: 'Madrid'},
				   { place_type: 'city',
				     country: 'Australia',
				     full_name: 'Sydney, NSW',
				     name: 'Sydney'}
	              ];
	setInterval(function(){
		for (var i = 0; i<3; i++){
			var rnd = Math.floor(Math.random() * 2);
			me.places[i].full_name = rnd + 'aaaaaaaaaaaa, IA';
			me.places[i].name = rnd;
		}
	}, 30)

	this.fakeTweet = function(){
		return {
			 text: "Fake tweet Fake tweet Fake tweet Fake tweet Fake tweet Fake tweet Fake tweet",
			 user: {
				screen_name: "Faker",
				followers: 1001},
			 place: me.places[Math.floor(Math.random()* me.places.length)]
			}
	}
}
TwitterNode.prototype = Object.create(EventEmitter.prototype);
TwitterNode.prototype.stream = function stream() {	
	var _obj = this
	function _stream(){
		_obj._stats.total++;
		var tweet = _obj.fakeTweet();

		_obj.emit('tweet', tweet);
		setTimeout(_stream, Math.random() * 40);
	}
	_stream();
	return this;
}
TwitterNode.prototype.stats = function() {
	return this.stats;
}