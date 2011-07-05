var socket = io.connect();
	socket.on('welcome', handleWelcome);
	socket.on('broadcast', handleData);
	socket.on('bestTweet', _displayTweetCard);
	socket.on('stats', _displayStats);

var latestGeo;
function handleWelcome(data){
	latestGeo = data;
	sunburst(data);
}
function handleData(data){
	latestGeo = data;
	updateSunburst(data);
}
