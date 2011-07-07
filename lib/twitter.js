var _id = 0,
	_countries = [],
	_states = [],
	_cities = [],
	_bestTweet = {score:0},
	_thresh = {
			minTweets : 10,
			country: .05,
			state: .12,
			city: .80
	},
	_baseGeo ={
			world: {
				_id: _id++,
				_v: 0,
				c:{other: {_id:_id++, _v:0}}
				},
	},
	_geo = _baseGeo; 

setInterval(blastMetrics, config.app.statRefreshInterval);
function blastMetrics(){
	console.warn('BLASTING STATS!')
	//memory management
	_geo = _baseGeo;
	_countries = [];
	_states = [];
	_cities = [];
}


function getGStats(){
	return _geo;
}

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


module.exports.initApp = function(io, twitterClient, config){
	stream = twitterClient.stream();
	twitterClient.on('tweet', processTweet);
	io.sockets.on('connection', function (socket) {
		  socket.json.emit('stats', twitterClient.stats());
		  socket.json.emit('bestTweet', bestTweet());
		  socket.json.emit('welcome',getGStats());
		});
	setInterval(function(){io.sockets.json.emit('stats', twitterClient.stats());}, config.app.statsInterval);
	setInterval(function(){io.sockets.json.emit('bestTweet', bestTweet());}, config.app.bestTweetSampleInterval);
	setInterval(function(){io.sockets.json.emit('broadcast', getGStats());}, config.app.geoStatsInterval);
	}