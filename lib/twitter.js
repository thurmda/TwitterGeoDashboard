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
	  socket.json.emit('stats', stream.stats());
	  socket.json.emit('bestTweet', bestTweet());
	  socket.json.emit('welcome',getGStats());
	});
setInterval(function(){io.sockets.json.emit('stats', stream.stats());}, config.app.statsInterval);
setInterval(function(){io.sockets.json.emit('bestTweet', bestTweet());}, config.app.bestTweetSampleInterval);
setInterval(function(){io.sockets.json.emit('broadcast', getGStats());}, config.app.geoStatsInterval);
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


function processTweet(tweet){
	bestTweetRules(tweet);
	countGeo(tweet);
}

function geoRules(tweet){
	var g = {
			geo: tweet.geo,
			place: tweet.place,
			coordinates: tweet.coordinates
	}
//	console.log(g);
/*
 place: 
   { country_code: 'US',
     place_type: 'city',
     country: 'United States',
     attributes: {},
     full_name: 'New Orleans, LA',
     name: 'New Orleans',
     url: 'http://api.twitter.com/1/geo/id/dd3b100831dd1763.json',
     id: 'dd3b100831dd1763',
     bounding_box: { type: 'Polygon', coordinates: [Object] } }
 */	
	gTotal++;
	if (g.place && g.place.country){
		if(gStats.region.c[g.place.country]){
			if(gStats.region.c[g.place.country].c[g.place.name]){
				gStats.region.c[g.place.country].c[g.place.name].val++
			}else{
				gStats.region.c[g.place.country].c._other.val++;
			}
			gStats.region.c[g.place.country]._total++;
		}
		else{
			gStats.region.c[g.place.country] = {_id: idCounter++, c:{}};
			gStats.region.c[g.place.country].c._other = {val:1, _id: idCounter++};
			gStats.region.c[g.place.country]._total = 1;
		}
	}
	if(g.place && g.place.place_type=="city"){
		var comma =g.place.full_name.search(", ");
		if (g.place && g.place.full_name && comma){
			var state = g.place.full_name.substr(comma+2)
			console.log("tpye: %s : %s   = %s",g.place.place_type, g.place.full_name ,state)
			if(state.length){
				states[state]++;
				if(!gStats.region.c[g.place.country].c[state]){
					gStats.region.c[g.place.country].c._other.val -= states[state];
					gStats.region.c[g.place.country].c[state] = {val:states[state], _id: idCounter++}; 
				}
				
			}
		}
	}
//	if (g.place && g.place.name){
//		if(places[g.place.name]){
//			places[g.place.name]++;
//			if(aboveThreshold(g.place.name)){
//				if(!gStats.region.c[g.place.country].c[g.place.name]){
//					gStats.region.c[g.place.country].c._other.val -= places[g.place.name];
//					gStats.region.c[g.place.country].c[g.place.name] = {val:places[g.place.name], _id: idCounter++}; 
//				}
//			}else{
//				//TODO remove
//			}
//		}else{
//			places[g.place.name] = 1;
//		}
//		
//	}

		
		//	if (g.place && g.place.country && g.place.name){
//		gStats.region[g.place.country][g.place.name] = gStats.region[g.place.country][g.place.name] ? 
//				gStats.region[g.place.country][g.place.name]++ : 1;
//	}	
	
}
setInterval(function(){
	console.log(JSON.stringify(_geo));
//	console.dir(_geo);
	}, 3000);

//setInterval(function(){console.dir(palaces);}, 3000);
function aboveThreshold(place){
	return places[place]/stream.stats().total > .1;
}
var gTotal = 0;
var places = {};
var gStats = {
		region: {c:{}}
};
var idCounter = 0;
function getGStats(){
//	gStats._stats = stream.stats();
	return _geo;
}

var states =[];
var cities = [];



var _id = 0;
var _countries = [];
var _states = [];
var _cities = [];
var _geo = {
		world: {
			_id: _id++,
			_v: 0,
			c:{other: {_id:_id++, _v:0}}
			},
}
var _thresh = {
		minTweets : 10,
		country: .05,
		state: .20,
		city: .50
}
function countGeo(tweet){
	/* SAMPLE place from tweet json
	 place: 
	   { country_code: 'US',
	     place_type: 'city',
	     country: 'United States',
	     attributes: {},
	     full_name: 'New Orleans, LA',
	     name: 'New Orleans',
	     url: 'http://api.twitter.com/1/geo/id/dd3b100831dd1763.json',
	     id: 'dd3b100831dd1763',
	     bounding_box: { type: 'Polygon', coordinates: [Object] } }
	 */
	var comma,country, state, city, g={};
	
	if(!tweet.place) return;
	if(tweet.place.place_type!="city") return;

	
	_geo.world._v++;
	if(_geo.world._v <= _thresh.minTweets){
		_geo.world.c.other._v++;
	}
//	console.dir(tweet.place);
	comma = tweet.place.full_name.search(", ");
	
	g.country = country = tweet.place.country;
	g.state = state = (comma) ? tweet.place.full_name.substr(comma+2) : null;
	g.city  = city = tweet.place.name;
	
	(_countries[country]) ? _countries[country]++ : _countries[country] = 1; 
	(_states[country+'~'+state]) ? 
			_states[country+'~'+state]++ : _states[country+'~'+state] = 1; 
	(_cities[country+'~'+state+'~'+city]) ? 
			_cities[country+'~'+state+'~'+city]++ :
			_cities[country+'~'+state+'~'+city] = 1; 

	
	if(_geo.world._v > _thresh.minTweets){
		if(_geo.world.c[country]){//country
			_geo.world.c[country]._v++;
			if(_geo.world.c[country].c[state]){ //state
				_geo.world.c[country].c[state]._v++;
				_geo.world.c[country].c[state].c.other._v++;
				if(_geo.world.c[country].c[state].c[city]){ //city
					_geo.world.c[country].c[state].c[city]._v++;
					_geo.world.c[country].c[state].c[city].c.other._v++;
				}else{//city didn't exist
					_geo.world.c[country].c[state].c.other._v++;
					if(_cities[country+'~'+state+'~'+city]/_geo.world.c[country].c[state]._v > _thresh.city){
						_geo.world.c[country].c[state].c[city] = 
							{_id:_id++,_v:_cities[country+'~'+state+'~'+city], c:{other: {_id:_id++, _v:_cities[country+'~'+state+'~'+city]}}};
						_geo.world.c[country].c[state].c.other._v -=  _cities[country+'~'+state+'~'+city];
					}	
				}				
			}else{//state didn't exist
				_geo.world.c[country].c.other._v++;
				if(_states[country+'~'+state]/_geo.world.c[country]._v > _thresh.state){
					_geo.world.c[country].c[state] = 
						{_id:_id++,_v:_states[country+'~'+state], c:{other: {_id:_id++, _v:_states[country+'~'+state]}}};
					_geo.world.c[country].c.other._v -=  _states[country+'~'+state];
				}	
			}
		}else{ //country didn't exist			
			_geo.world.c.other._v++;
			if(_countries[country]/_geo.world._v > _thresh.country){
				_geo.world.c[country] = {_id:_id++,_v:_countries[country], c:{other: {_id:_id++, _v:_countries[country]}}};
				_geo.world.c.other._v -=  _countries[country];
			}
		}
		
		
	}
			

}