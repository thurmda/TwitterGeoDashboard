var socket = io.connect();
	socket.on('welcome', handleWelcome);
	socket.on('broadcast', handleData);
	socket.on('bestTweet', _displayTweetCard);
	socket.on('stats', _displayStats);

function handleWelcome(data){
	console.log("WELCOME");
	console.dir(data);
	sunburst(data);
//	
//	setInterval(function(){
//		//console.dir(data);
//		fWith(data, .2);}, 30);
//	function fWith(obj, fFactor){
//		for(var p in obj){
//			if(typeof obj[p] === "number"){
//				obj[p] += ((-.5 + Math.random()) *fFactor) * obj[p];
//			}else{
//				fWith(obj[p]);
//			}
//		}
//	}
//	function streamStats(){
//		//updateSunburst(data);
//		console.dir(data);
//		setTimeout(streamStats, 200 + Math.random()*2000);
//	}
//	streamStats();

	

}
function handleData(data){
	updateSunburst(data);
//	console.dir(arguments);
}
