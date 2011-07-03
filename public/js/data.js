var socket = io.connect();
	socket.on('welcome', handleWelcome);
	socket.on('broadcast', handleData);
	socket.on('bestTweet', _displayTweetCard);
	socket.on('stats', _displayStats);

function handleWelcome(data){
	sunburst(data);
}
function handleData(data){
	updateSunburst(data);
}