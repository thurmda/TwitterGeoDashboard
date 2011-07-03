var geohash = require('geohash');

module.exports = {
	run: run,
	twitterStats: function(){return condenseMap(hashmap)},
	bestTweet : bestTweet,
	processTweet: processTweet
		
};

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

var _bestTweet = {score:0};
function bestTweet(){
	var tweet = _bestTweet;
	_bestTweet = {score:0};
	return tweet;
}
	
function condenseMap(hm){
	
	return hm;
	
	var _hm = {};
	var pass = 0;
	function foo(_o , o){
		if(typeof o==="object" &&  Object.keys(o).length > 1){
			o.value = undefined;
			console.log("blast");
		}
		for(var key in o){
			_o[key] = o[key]
			foo(_o[key] , o[key])
		}			
	}
	
//	function foo(bar){
//		if(bar){
//			return _hm;
//		}
//		else{
//			_hm.was ='here';
//			return foo('bar');
//		}
//		
//	}
	foo(_hm , hm);
return _hm;
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
			followers :tweet.user.followers_count,
			geo: tweet.geo
		}
	}
}
function getGeo(tweet){
	
	var geo = {hash:''};
	if(tweet.coordinates && tweet.coordinates.coordinates){
		geo.hash = geohash.encode(
				tweet.coordinates.coordinates[1],
				tweet.coordinates.coordinates[0]
		).substr(0,3);
	}
	    	 
return geo;
}

function processTweet (tweet){
//	console.dir(tweet);
	tweet.geo = getGeo(tweet);
	bestTweetRules(tweet);
	map(tweet);
}	




hashmap = {region:{}};
hashmapids = 0;
hashmapStep = 2;
function walk(obj,path){
	var prop, step;
	if(step = path.substr(0,hashmapStep)){
		if(obj[step]){
			prop = obj[step];
			prop.value++;
		}else{
			prop = obj[step]={_id:hashmapids++,value:1};
		}
		walk(prop,path.substr(hashmapStep));
	}else{
		return;
	}
}

function map(tweet){
	walk(hashmap.region, tweet.geo.hash);
}

function run (io){
	
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
	



	setInterval(function(){io.sockets.json.emit('stats', stream.stats());}, config.app.statsInterval);
	setInterval(function(){io.sockets.json.emit('bestTweet', bestTweet());}, config.app.bestTweetSampleInterval);
	function streamStats(){
		io.sockets.json.emit('broadcast',  condenseMap(hashmap));
		setTimeout(streamStats, 600 );
	}
	setTimeout(streamStats, 2000);


	

function randomLL(){
//	var lat = 60 - Math.random()*120;
//	var lng = 180 - Math.random()*180;

//NYCish
//SWhttp://maps.google.com/maps?hl=en&ll=40.285811,-74.797668&spn=1.181671,1.906128&z=9
//NEhttp://maps.google.com/maps?hl=en&ll=41.331451,-72.91626&spn=1.163197,1.906128&z=9	
	var lat = 40 + Math.random()*8;
	var lng = 73 + Math.random()*8;
	var hash = geohash.encode(lat,lng).substr(0,6);
//	var hash = lat.toString().substr(0,3) + lng.toString().substr(0,3)
	return {
			lat:lat,
			lng: lng,
			hash: hash
			}
}


//var fakeTweetCounter = 0;
//var txt="jlkjlsjdlfj lsdjlfkj sdljfl sdj fjsdlfjlsj fljsdl fjsldjk flsdjflj sldjfljsd flkjsdlkjflksjjosjvoijsdoivjsodmv sdmlvdlksmlk slkdjvjlkjslv jlskjv ljsljxc vjxc";
//function fakeTweetStream(){
//     var t = {
//    		  
//              id:fakeTweetCounter++,
//    		  text: txt.substring(Math.random()*40, Math.random()*140),
//              user: {
//            	  	  screen_name: txt.substring(Math.random()*40, 
//            			  5 + Math.random()*20).replace(/\s+/g,'_'),
//            		  followers_count: Math.floor((Math.random()* 300 ))
//              		},
//     			geo: randomLL()
//             }
//     processTweet(t);
//     setTimeout(fakeTweetStream,30 + Math.random()*500);
//}
//fakeTweetStream();




}
