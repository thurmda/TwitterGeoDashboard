var socket = io.connect();
	socket.on('welcome', handleWelcome);
	socket.on('broadcast', handleData);


function handleWelcome(data){
//	console.dir(data);
	sunburst(data);
}
function handleData(data){
//	console.dir(data);	
	updateSunburst(data);
}